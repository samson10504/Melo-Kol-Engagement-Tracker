// File: src/pages/api/posts/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM posts WHERE id = $1', [id]`;
      if (rows.length === 0) {
        res.status(404).json({ error: 'Post not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching post' });
    }
  } else if (req.method === 'PUT') {
    const { counts } = req.body;
    try {
      const { rows } = await sql`
        'UPDATE posts SET counts = $1 WHERE id = $2 RETURNING *',
        [JSON.stringify(counts), id]
      `;
      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error updating post' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await sql`'DELETE FROM posts WHERE id = $1', [id]`;
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting post' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
