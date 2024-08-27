import { NextApiRequest, NextApiResponse } from 'next';
import { ApifyClient } from 'apify-client';
import sql from '../../../../lib/db';

interface InstagramPost {
  timestamp?: string;
  likesCount?: number;
  commentsCount?: number;
  url?: string;
  [key: string]: unknown;
}

interface ApifyRunResult {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  buildId: string;
  exitCode: number;
  defaultKeyValueStoreId: string;
  defaultDatasetId: string;
  defaultRequestQueueId: string;
  containerUrl: string | null;
  datasetItems: number;
  keyValueStoreItems: number;
  requestQueueItems: number;
  usageTotalUsd: number;
  isStatusMessageTerminal: boolean;
  statusMessage: string;
}

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const APIFY_TIMEOUT = 60000; // 60 seconds

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

const requestQueue: (() => Promise<void>)[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
    }
  }

  isProcessing = false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const processRequest = async () => {
      await handleSingleFetch(req, res);
    };
    requestQueue.push(processRequest);
    processQueue();
  } else if (req.method === 'POST') {
    if (req.query.id === 'fetch-all') {
      await handleFetchAll(req, res);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleSingleFetch(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  try {
    const postId = id;
    console.log('Fetching post with ID:', postId);
    
    const { rows } = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    console.log('Database query result:', rows);
    
    if (rows.length === 0) {
      console.log('Post not found in database');
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = rows[0];
    console.log('Post data from database:', post);

    const updatedPost = await fetchAndUpdatePost(post);
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error fetching post update:', error);
    res.status(500).json({ error: 'Error fetching post update', details: error instanceof Error ? error.message : String(error) });
  }
}

async function handleFetchAll(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { rows: posts } = await sql`SELECT * FROM posts`;
    const postUrls = posts.map(post => post.url);

    const input = {
      "username": postUrls,
      "resultsLimit": postUrls.length
    };

    // console.log('Input for Apify:', JSON.stringify(input, null, 2));

    const run = await client.actor("apify/instagram-post-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // console.log('Items returned from Apify:', JSON.stringify(items, null, 2));

    const updatedPosts = await Promise.all(posts.map(async (post) => {
      const matchingItem = items.find((item: InstagramPost) => item.url === post.url || item.shortCode === post.url.split('/').pop());
      if (!matchingItem) {
        console.log(`No matching item found for post ${post.id} with URL ${post.url}`);
        return post; // Return the original post without updating
      }
      const updatedPost = await updatePostInDatabase(post, matchingItem);
      console.log(`Updated post ${updatedPost.id} in database`);
      return updatedPost;
    }));

    const filteredUpdatedPosts = updatedPosts.filter(post => post !== null);
    console.log(`Returning ${filteredUpdatedPosts.length} updated posts`);
    res.status(200).json(filteredUpdatedPosts);
  } catch (error) {
    console.error('Error fetching post updates:', error);
    res.status(500).json({ error: 'Error fetching post updates', details: error instanceof Error ? error.message : String(error) });
  }
}

async function fetchAndUpdatePost(post: any) {
  const input = {
    "username": [post.url], // dont change username cuz it is the fixed api param
    "resultsLimit": 1
  };

  const runPromise = client.actor("apify/instagram-post-scraper").call(input);
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Apify request timeout')), APIFY_TIMEOUT)
  );

  const run = await Promise.race([runPromise, timeoutPromise]) as unknown as ApifyRunResult;
  console.log('Actor run result:', run);

  // Fetch Actor results from the run's dataset
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  console.log('Actor dataset items:', items);

  if (items.length === 0 || items[0].error === 'not_found') {
    console.log('Post not found on Instagram');
    return null;
  }

  const matchingPost = items[0] as InstagramPost;
  console.log('Matching post from Actor results:', matchingPost);

  // Update the post in the database
  const currentDate = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
  const updatedCounts = [
    ...(Array.isArray(post.counts) ? post.counts : []),
    {
      date: currentDate,
      likes: matchingPost.likesCount ?? 0,
      comments: matchingPost.commentsCount ?? 0
    }
  ];
  console.log('Updated counts:', updatedCounts);

  const { rows: updatedRows } = await sql`
    UPDATE posts
    SET counts = ${JSON.stringify(updatedCounts)},
        creation_date = COALESCE(${matchingPost.timestamp}, posts.creation_date)
    WHERE id = ${post.id}
    RETURNING *
  `;
  console.log('Updated post in database:', updatedRows[0]);

  return updatedRows[0];
}

export async function updatePostInDatabase(post: any, item: InstagramPost) {
  const currentDate = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
  const updatedCounts = [
    ...(Array.isArray(post.counts) ? post.counts : []),
    {
      date: currentDate,
      likes: item.likesCount ?? 0,
      comments: item.commentsCount ?? 0
    }
  ];

  console.log(`Updating post ${post.id} with new counts`);
  // console.log(JSON.stringify(updatedCounts, null, 2));

  const { rows: updatedRows } = await sql`
    UPDATE posts
    SET counts = ${JSON.stringify(updatedCounts)},
        creation_date = COALESCE(${item.timestamp}, posts.creation_date)
    WHERE id = ${post.id}
    RETURNING *
  `;
  console.log(`Updated post ${post.id} in database`);

  return updatedRows[0];
}