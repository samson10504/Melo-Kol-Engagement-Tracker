// File: src/pages/api/posts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

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
      const { url, kol_id, creation_date, counts } = req.body;
      const countsString = JSON.stringify(counts);
      const { rows } = await sql`
        INSERT INTO posts (url, kol_id, creation_date, counts)
        VALUES (${url}, ${kol_id}, ${creation_date}, ${countsString})
        RETURNING *
      `;
      const { rows: kolRows } = await sql`SELECT name FROM kols WHERE id = ${kol_id}`;
      const newPost = {
        ...rows[0],
        kol_name: kolRows[0]?.name || 'Unknown KOL'
      };
      res.status(201).json(newPost);
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