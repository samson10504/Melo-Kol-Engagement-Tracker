// File: src/pages/api/kols/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const postId = Array.isArray(id) ? id[0] : id;
      if (typeof postId !== 'string') {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${postId}`;
      if (rows.length === 0) {
        res.status(404).json({ error: 'Post not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Error fetching post', details: error instanceof Error ? error.message : String(error) });
    }
  } else if (req.method === 'PUT') {
    const { name, avatar } = req.body;
    try {
      const { rows } = await sql`
        'UPDATE kols SET name = $1, avatar = $2 WHERE id = $3 RETURNING *',
        [name, avatar, id]
      `;
      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error updating KOL' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const kolId = Array.isArray(id) ? id[0] : id;
      if (typeof kolId !== 'string') {
        res.status(400).json({ error: 'Invalid KOL ID' });
        return;
      }
      console.log('Attempting to delete KOL with ID:', kolId);
      const result = await sql`DELETE FROM kols WHERE id = ${kolId}`;
      console.log('Delete operation result:', result);
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'KOL not found' });
      } else {
        res.status(204).end();
      }
    } catch (error) {
      console.error('Error deleting KOL:', error);
      res.status(500).json({ error: 'Error deleting KOL', details: error instanceof Error ? error.message : String(error) });
    }
  } else if (req.method === 'POST') {
    const { id, name, avatar } = req.body;
    const { rows } = await sql`
      'INSERT INTO kols (id, name, avatar) VALUES ($1, $2, $3) RETURNING *',
      [id, name, avatar]
    `;
    res.status(201).json(rows[0]);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}