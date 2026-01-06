const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper to read posts
const readPosts = async () => {
    try {
        const data = await fs.readFile(POSTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await fs.writeFile(POSTS_FILE, '[]');
            return [];
        }
        throw err;
    }
};

// Helper to write posts
const writePosts = async (posts) => {
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
};

// GET /api/posts - Retrieve all posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await readPosts();
        // Return posts sorted by creation date (newest first)
        res.json(posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
        console.error('Error reading posts:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// POST /api/posts - Create a new post
app.post('/api/posts', async (req, res) => {
    try {
        const {
            title, author, content, excerpt,
            category, gist, image, tags, keyTakeaways,
            isFeatured, isTrending, isBreaking
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const posts = await readPosts();

        const newPost = {
            id: Date.now().toString(),
            title,
            author: author || 'Anonymous',
            content,
            excerpt: excerpt || content.substring(0, 150) + '...',
            category,
            gist,
            image,
            tags: tags || [],
            keyTakeaways: keyTakeaways || [],
            isFeatured: isFeatured || false,
            isTrending: isTrending || false,
            isBreaking: isBreaking || false,
            created_at: new Date().toISOString()
        };

        posts.push(newPost);
        await writePosts(posts);

        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// PUT /api/posts/:id - Update a post
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, author, content, excerpt,
            category, gist, image, tags, keyTakeaways,
            isFeatured, isTrending, isBreaking
        } = req.body;

        const posts = await readPosts();
        const index = posts.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }

        posts[index] = {
            ...posts[index],
            title: title || posts[index].title,
            author: author || posts[index].author,
            content: content || posts[index].content,
            excerpt: excerpt || posts[index].excerpt,
            category: category || posts[index].category,
            gist: gist || posts[index].gist,
            image: image || posts[index].image,
            tags: tags || posts[index].tags,
            keyTakeaways: keyTakeaways || posts[index].keyTakeaways,
            isFeatured: isFeatured !== undefined ? isFeatured : posts[index].isFeatured,
            isTrending: isTrending !== undefined ? isTrending : posts[index].isTrending,
            isBreaking: isBreaking !== undefined ? isBreaking : posts[index].isBreaking,
        };

        await writePosts(posts);

        res.json(posts[index]);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// DELETE /api/posts/:id - Delete a post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await readPosts();
        const filteredPosts = posts.filter(p => p.id !== id);

        if (posts.length === filteredPosts.length) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await writePosts(filteredPosts);

        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
