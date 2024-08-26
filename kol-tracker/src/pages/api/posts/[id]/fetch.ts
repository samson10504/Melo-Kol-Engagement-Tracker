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

const APIFY_TIMEOUT = 15000; // 15 seconds

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  try {
    const postId = id;
    console.log('Fetching post with ID:', postId);
    
    // Fetch the post from the database
    const { rows } = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    console.log('Database query result:', rows);
    
    if (rows.length === 0) {
      console.log('Post not found in database');
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = rows[0];
    console.log('Post data from database:', post);

    // Extract the Instagram post ID from the URL
    const instagramPostId = post.url.split('/').pop()?.split('?')[0];
    console.log('Extracted Instagram post ID:', instagramPostId);

    // Prepare Actor input
    const input = {
      "username": [post.url],
      "resultsLimit": 1
    };
    console.log('Actor input:', input);

    // Run the Actor with a timeout
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
      return res.status(404).json({ error: 'Post not found on Instagram' });
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
          creation_date = ${matchingPost.timestamp ?? null}
      WHERE id = ${postId}
      RETURNING *
    `;
    console.log('Updated post in database:', updatedRows[0]);

    res.status(200).json(updatedRows[0]);
  } catch (error) {
    console.error('Error fetching post update:', error);
    res.status(500).json({ error: 'Error fetching post update', details: error instanceof Error ? error.message : String(error) });
  }
}