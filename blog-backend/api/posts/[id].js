const { getPool } = require('../_db');

module.exports = async (req, res) => {
  const method = req.method;
  const { id } = req.query;
  const pool = await getPool();

  if (method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'PUT') {
    try {
      const { title, author, content, excerpt } = req.body;
      if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
      const finalExcerpt = excerpt || (content.substring(0, 150) + '...');
      const [result] = await pool.query(
        'UPDATE posts SET title = ?, author = ?, content = ?, excerpt = ? WHERE id = ?',
        [title, author, content, finalExcerpt, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ message: 'Post updated successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'DELETE') {
    try {
      const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end('Method Not Allowed');
};
