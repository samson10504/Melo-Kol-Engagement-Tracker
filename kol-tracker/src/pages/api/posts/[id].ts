// File: src/pages/api/posts/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import sql from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const postId = Array.isArray(id) ? id[0] : id;

  if (typeof postId !== 'string') {
    res.status(400).json({ error: 'Invalid post ID' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${postId}`;
      if (rows.length === 0) {
        res.status(404).json({ error: 'Post not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching post' });
    }
  } else if (req.method === 'PUT') {
    const { counts, post_creation_date } = req.body;
    try {
      const { rows } = await sql`
        UPDATE posts
        SET counts = ${JSON.stringify(counts)},
            post_creation_date = ${post_creation_date}
        WHERE id = ${postId}
        RETURNING *
      `;
      
      if (rows.length === 0) {
        res.status(404).json({ error: 'Post not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Error updating post' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const postId = Array.isArray(id) ? id[0] : id;
      if (typeof postId !== 'string') {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }
      console.log('Attempting to delete post with ID:', postId);
      const result = await sql`DELETE FROM posts WHERE id = ${postId}`;
      console.log('Delete operation result:', result);
      if (result.rowCount === 0) {
        console.log('No post found with ID:', postId);
        res.status(404).json({ error: 'Post not found' });
      } else {
        res.status(204).end();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Error deleting post', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}