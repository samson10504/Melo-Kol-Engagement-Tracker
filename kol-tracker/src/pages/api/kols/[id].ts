// File: src/pages/api/kols/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`'SELECT * FROM kols WHERE id = $1', [id]`;
      if (rows.length === 0) {
        res.status(404).json({ error: 'KOL not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching KOL' });
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
      await sql`'DELETE FROM kols WHERE id = $1', [id]`;
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting KOL' });
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