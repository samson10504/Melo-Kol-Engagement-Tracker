// File: src/pages/api/posts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';
import { ApifyClient } from 'apify-client';
import { updatePostInDatabase } from './[id]/fetch';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT posts.*, kols.name as kol_name
        FROM posts
        JOIN kols ON posts.kol_id = kols.id
      `;
      const postsWithParsedCounts = rows.map((post: any) => ({
        ...post,
        counts: typeof post.counts === 'string' ? JSON.parse(post.counts) : post.counts
      }));
      res.status(200).json(postsWithParsedCounts);
    } else if (req.method === 'POST') {
      await handleCreateMultiple(req, res);
    } else if (req.method === 'DELETE') {
      const postId = req.query.id;
      if (typeof postId !== 'string') {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }
      try {
        await sql`DELETE FROM posts WHERE id = ${postId}`;
        res.status(204).end();
      } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Error deleting post' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in /api/posts:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}

async function handleCreateMultiple(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { posts } = req.body;
    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty posts array' });
    }
    const createdPosts = [];

    // Create posts in the database
    for (const post of posts) {
      const { url, kol_id } = post;
      const { rows } = await sql`
        INSERT INTO posts (url, kol_id, post_creation_date, counts)
        VALUES (${url}, ${parseInt(kol_id, 10)}, ${new Date().toISOString()}, '[]'::jsonb)
        RETURNING *
      `;
      const { rows: kolRows } = await sql`SELECT name FROM kols WHERE id = ${parseInt(kol_id, 10)}`;
      const newPost = {
        ...rows[0],
        kol_name: kolRows[0]?.name || 'Unknown KOL',
        counts: [],
        url: url,
        id: rows[0].id
      };
      createdPosts.push(newPost);
    }

    // Fetch updates for all created posts
    const postUrls = createdPosts.map(post => post.url);
    const input = {
      "username": postUrls,
      "resultsLimit": postUrls.length
    };

    const run = await client.actor("apify/instagram-post-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Update posts with fetched data
    const updatedPosts = await Promise.all(createdPosts.map(async (post) => {
      const matchingItem = items.find((item: any) => item.url === post.url || item.shortCode === post.url.split('/').pop());
      if (matchingItem) {
        return await updatePostInDatabase(post, matchingItem);
      }
      return post;
    }));

    console.log('Created and updated posts:', updatedPosts);
    res.status(201).json(updatedPosts);
  } catch (error) {
    console.error('Error creating and updating multiple posts:', error);
    res.status(500).json({ error: 'Error creating and updating multiple posts', details: error instanceof Error ? error.message : String(error) });
  }
}

// Make sure to include the updatePostInDatabase function from your existing code