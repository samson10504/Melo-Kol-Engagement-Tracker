// File: src/pages/api/kols/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM kols`;
      res.status(200).json(rows);
    } else if (req.method === 'POST') {
      const { name, avatar } = req.body;
      const { rows } = await sql`
        INSERT INTO kols (name, avatar) VALUES (${name}, ${avatar}) RETURNING *
      `;
      res.status(201).json(rows[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in /api/kols:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}