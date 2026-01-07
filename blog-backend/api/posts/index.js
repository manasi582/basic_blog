const { getPool } = require('../_db');

module.exports = async (req, res) => {
  const method = req.method;
  const pool = await getPool();

  if (method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'POST') {
    try {
      const { title, author, content, excerpt } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      const finalExcerpt = excerpt || (content.substring(0, 150) + '...');
      const finalAuthor = author || 'Anonymous';
      const [result] = await pool.query(
        'INSERT INTO posts (title, author, content, excerpt) VALUES (?, ?, ?, ?)',
        [title, finalAuthor, content, finalExcerpt]
      );
      return res.status(201).json({
        id: result.insertId,
        title,
        author: finalAuthor,
        content,
        excerpt: finalExcerpt,
        message: 'Post created successfully'
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
};
