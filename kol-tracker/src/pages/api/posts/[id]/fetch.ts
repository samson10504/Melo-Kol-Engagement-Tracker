// File: src/pages/api/posts/[id]/fetch.ts


import { NextApiRequest, NextApiResponse } from 'next';
import { ApifyClient } from 'apify-client';
import sql from '../../../../lib/db';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

interface InstagramPost {
  timestamp?: string;
  likesCount?: number;
  commentsCount?: number;
  url?: string;
  [key: string]: unknown;
}

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

    // Extract the Instagram post ID and username from the URL
    const urlParts = post.url.split('/').filter(Boolean);
    const instagramPostId = urlParts[urlParts.length - 1];
    const username = urlParts[urlParts.length - 3];
    console.log('Extracted Instagram post ID:', instagramPostId);
    console.log('Extracted username:', username);

    // Prepare Actor input
    const input = {
      "username": [post.url],
      "resultsLimit": 1
    };
    console.log('Actor input:', input);

    // Run the Actor and wait for it to finish
    const run = await client.actor("apify/instagram-post-scraper").call(input);
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