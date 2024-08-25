// File: src/pages/api/kols/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM kols');
      res.status(200).json(rows);
    } else if (req.method === 'POST') {
      const { name, avatar } = req.body;
      const { rows } = await pool.query(
        'INSERT INTO kols (name, avatar) VALUES ($1, $2) RETURNING *',
        [name, avatar]
      );
      res.status(201).json(rows[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in /api/kols:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}