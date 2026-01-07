import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar, User, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function BlogWebsite() {
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('home');
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    excerpt: '',
    category: 'mumbai',
    gist: '',
    image: '',
    tags: '',
    keyTakeaways: [''],
    isFeatured: false,
    isTrending: false,
    isBreaking: false
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) throw new Error('Failed to load posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts. Make sure the backend server is running on port 5000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTakeaway = () => {
    setFormData({ ...formData, keyTakeaways: [...formData.keyTakeaways, ''] });
  };

  const handleTakeawayChange = (index, value) => {
    const newTakeaways = [...formData.keyTakeaways];
    newTakeaways[index] = value;
    setFormData({ ...formData, keyTakeaways: newTakeaways });
  };

  const handleRemoveTakeaway = (index) => {
    if (formData.keyTakeaways.length > 1) {
      const newTakeaways = formData.keyTakeaways.filter((_, i) => i !== index);
      setFormData({ ...formData, keyTakeaways: newTakeaways });
    }
  };

  const savePost = async () => {
    if (!formData.title || !formData.content) {
      setError('Please fill in title and content');
      return;
    }

    if (formData.gist.length < 200 || formData.gist.length > 500) {
      setError('Gist must be between 200 and 500 characters');
      return;
    }

    const validTakeaways = formData.keyTakeaways.filter(t => t.trim() !== '');
    if (validTakeaways.length < 2) {
      setError('Please provide at least 2 key takeaways');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = currentPost
        ? `${API_URL}/posts/${currentPost.id}`
        : `${API_URL}/posts`;

      const method = currentPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      if (!response.ok) throw new Error('Failed to save post');

      await loadPosts();
      setFormData({
        title: '', author: '', content: '', excerpt: '',
        category: 'mumbai', gist: '', image: '', tags: '',
        keyTakeaways: [''], isFeatured: false, isTrending: false, isBreaking: false
      });
      setCurrentPost(null);
      setView('home');
    } catch (err) {
      setError('Failed to save post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete post');

      await loadPosts();
      if (view === 'post') setView('home');
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editPost = (post) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      author: post.author,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category || 'mumbai',
      gist: post.gist || '',
      image: post.image || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      keyTakeaways: post.keyTakeaways && post.keyTakeaways.length > 0 ? post.keyTakeaways : [''],
      isFeatured: post.isFeatured || false,
      isTrending: post.isTrending || false,
      isBreaking: post.isBreaking || false
    });
    setView('editor');
    setError('');
  };

  const viewPost = (post) => {
    setCurrentPost(post);
    setView('post');
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1
              className="text-3xl font-bold text-gray-900 cursor-pointer"
              onClick={() => { setView('home'); setCurrentPost(null); setError(''); }}
            >
              My Blog
            </h1>
            <button
              onClick={() => {
                setFormData({
                  title: '', author: '', content: '', excerpt: '',
                  category: 'mumbai', gist: '', image: '', tags: '',
                  keyTakeaways: [''], isFeatured: false, isTrending: false, isBreaking: false
                });
                setCurrentPost(null);
                setView('editor');
                setError('');
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              New Post
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        )}

        {!loading && view === 'home' && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No posts yet. Create your first post!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                    <h2
                      className="text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => viewPost(post)}
                    >
                      {post.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <User size={16} />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{post.excerpt}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewPost(post)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye size={18} />
                        Read More
                      </button>
                      <button
                        onClick={() => editPost(post)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-700 font-medium ml-4"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && view === 'post' && currentPost && (
          <div>
            <button
              onClick={() => setView('home')}
              className="text-blue-600 hover:text-blue-700 mb-6 font-medium"
            >
              ← Back to all posts
            </button>
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded capitalize">
                    {currentPost.category || 'Uncategorized'}
                  </span>
                  {currentPost.isFeatured && <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Featured</span>}
                  {currentPost.isTrending && <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Trending</span>}
                  {currentPost.isBreaking && <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Breaking News</span>}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
                <div className="flex items-center gap-4 text-gray-600 border-b border-gray-200 pb-6">
                  <span className="flex items-center gap-1">
                    <User size={18} />
                    {currentPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={18} />
                    {formatDate(currentPost.created_at)}
                  </span>
                </div>
              </div>

              {currentPost.image && (
                <img
                  src={currentPost.image}
                  alt={currentPost.title}
                  className="w-full h-96 object-cover rounded-xl mb-8"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}

              {currentPost.gist && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={20} />
                    The Gist
                  </h3>
                  <p className="text-blue-800 text-lg leading-relaxed">{currentPost.gist}</p>
                </div>
              )}

              <div className="prose max-w-none mb-8">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">{currentPost.content}</p>
              </div>

              {currentPost.keyTakeaways && currentPost.keyTakeaways.length > 0 && currentPost.keyTakeaways[0] !== '' && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 text-xl">Key Takeaways</h3>
                  <ul className="space-y-3">
                    {currentPost.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex gap-3 text-gray-700">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentPost.tags && currentPost.tags.length > 0 && (
                <div className="flex gap-2 mb-8 flex-wrap">
                  {(Array.isArray(currentPost.tags) ? currentPost.tags : currentPost.tags.split(',')).map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition cursor-default">
                      #{typeof tag === 'string' ? tag.trim() : tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-6 border-t border-gray-200">
                <button
                  onClick={() => editPost(currentPost)}
                  className="flex items-center gap-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                >
                  <Edit2 size={18} />
                  Edit Post
                </button>
                <button
                  onClick={() => deletePost(currentPost.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                >
                  <Trash2 size={18} />
                  Delete Post
                </button>
              </div>
            </article>
          </div>
        )}

        {!loading && view === 'editor' && (
          <div>
            <button
              onClick={() => { setView('home'); setCurrentPost(null); setError(''); }}
              className="text-blue-600 hover:text-blue-700 mb-6 font-medium"
            >
              ← Cancel
            </button>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {currentPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter post title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {['mumbai', 'maharasthra', 'india', 'world', 'business', 'sports', 'entertaintment', 'opinion'].map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-6 py-2">
                  {[
                    { key: 'isFeatured', label: 'Featured' },
                    { key: 'isTrending', label: 'Trending' },
                    { key: 'isBreaking', label: 'Breaking News' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gist (200-500 chars) *
                  </label>
                  <textarea
                    value={formData.gist}
                    onChange={(e) => setFormData({ ...formData, gist: e.target.value })}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                    placeholder="Brief summary of the post..."
                  />
                  <div className={`text-right text-xs ${formData.gist.length < 200 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {formData.gist.length}/500 (Min 200)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Takeaways (Min 2) *
                  </label>
                  {formData.keyTakeaways.map((takeaway, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={takeaway}
                        onChange={(e) => handleTakeawayChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Takeaway ${index + 1}`}
                      />
                      {formData.keyTakeaways.length > 1 && (
                        <button
                          onClick={() => handleRemoveTakeaway(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddTakeaway}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Takeaway
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tech, news, blog"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description for list view"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-64"
                    placeholder="Write your post content here..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={savePost}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (currentPost ? 'Update Post' : 'Publish Post')}
                  </button>
                  <button
                    onClick={() => {
                      setView('home');
                      setCurrentPost(null);
                      setFormData({
                        title: '', author: '', content: '', excerpt: '',
                        category: 'mumbai', gist: '', image: '', tags: '',
                        keyTakeaways: [''], isFeatured: false, isTrending: false, isBreaking: false
                      });
                      setError('');
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}