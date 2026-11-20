'use client';

import { useState, useEffect } from 'react';

const API_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `http://${window.location.hostname}:3001`
    : 'http://192.168.100.23:3001';

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeModal, setActiveModal] = useState<'group' | 'page' | 'story' | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('access_token')
      : null;

  const fetchAllData = async () => {
    const token = getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [storiesRes, groupsRes, pagesRes, postsRes] = await Promise.all([
        fetch(`${API_URL}/stories`),
        fetch(`${API_URL}/groups`),
        fetch(`${API_URL}/pages`),
        fetch(`${API_URL}/posts`, { headers }),
      ]);

      if (storiesRes.ok) setStories(await storiesRes.json());
      if (groupsRes.ok) setGroups(await groupsRes.json());
      if (pagesRes.ok) setPages(await pagesRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
    } catch (err) {
      console.error('Failed to load feed data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const token = getToken();
    if (!token) {
      alert('Please log in first to create a post.');
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: newPostContent }),
      });

      if (res.ok) {
        setNewPostContent('');
        fetchAllData();
      } else {
        const errData = await res.json();
        alert(`Could not create post: ${errData.message || 'Check required fields'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      return;
    }

    let endpoint = '';
    let payload: any = {};

    if (activeModal === 'group') {
      endpoint = '/groups';
      payload = { name: titleInput, description: descInput, privacy: 'public' };
    } else if (activeModal === 'page') {
      endpoint = '/pages';
      payload = { title: titleInput, bio: descInput, category: 'Mzansi' };
    } else if (activeModal === 'story') {
      endpoint = '/stories';
      payload = {
        mediaUrl:
          titleInput ||
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
        caption: descInput,
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTitleInput('');
        setDescInput('');
        setActiveModal(null);
        fetchAllData();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || 'Failed to create'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen text-gray-800 relative bg-gray-100 pb-20 md:pb-0">
      {/* South African Flag Background Layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Crect width='900' height='200' fill='%23E03C31'/%3E%3Crect y='400' width='900' height='200' fill='%23001489'/%3E%3Cpath d='M0,0 L450,300 L0,600 Z' fill='%23000000'/%3E%3Cpath d='M0,0 L450,300 L900,300 L900,200 L480,200 L180,0 Z M0,600 L450,300 L900,300 L900,400 L480,400 L180,600 Z' fill='%23FFFFFF'/%3E%3Cpath d='M0,0 L450,300 L900,300 L900,240 L465,240 L105,0 Z M0,600 L450,300 L900,300 L900,360 L465,360 L105,600 Z' fill='%23007749'/%3E%3Cpath d='M0,72 L342,300 L0,528 L0,480 L270,300 L0,120 Z' fill='%23FFB81C'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between border-b-2 border-[#007749]">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs font-bold tracking-widest text-gray-500 uppercase">
            Jacinta Z M Zuma
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-1.5">
            <span>🇿🇦</span>
            <span className="bg-gradient-to-r from-[#007749] via-[#FFB81C] to-[#E03C31] bg-clip-text text-transparent">
              Mzansi
            </span>
          </h1>
          <span className="text-[11px] md:text-xs italic text-[#001489] font-semibold">
            "Two Hands are Better than One"
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a href="/dashboard" className="font-semibold text-[#007749]">Home</a>
          <a href="/messages" className="text-gray-600 hover:text-[#007749]">Messages</a>
          <a href="/profile" className="text-gray-600 hover:text-[#007749]">Profile</a>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 p-2 md:p-4">
        {/* Left Sidebar */}
        <div className="hidden md:block col-span-1 space-y-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm h-fit">
          <div>
            <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-2">Menu</h2>
            <a href="/dashboard" className="block p-2 rounded-lg hover:bg-gray-100 font-medium">📰 News Feed</a>
            <a href="/messages" className="block p-2 rounded-lg hover:bg-gray-100 font-medium">💬 Messenger</a>
            <a href="/profile" className="block p-2 rounded-lg hover:bg-gray-100 font-medium">👤 Profile</a>
          </div>

          <hr />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Groups</h2>
              <button onClick={() => setActiveModal('group')} className="text-xs text-[#007749] font-semibold hover:underline">+ Create</button>
            </div>
            {groups.length === 0 ? <p className="text-xs text-gray-400 px-2">No groups yet</p> : groups.map((g) => (
              <div key={g.id} className="p-2 rounded-lg hover:bg-gray-100 text-sm font-medium truncate">👥 {g.name}</div>
            ))}
          </div>

          <hr />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Pages</h2>
              <button onClick={() => setActiveModal('page')} className="text-xs text-[#007749] font-semibold hover:underline">+ Create</button>
            </div>
            {pages.length === 0 ? <p className="text-xs text-gray-400 px-2">No pages yet</p> : pages.map((p) => (
              <div key={p.id} className="p-2 rounded-lg hover:bg-gray-100 text-sm font-medium truncate">📄 {p.title}</div>
            ))}
          </div>
        </div>

        {/* Center Column */}
        <div className="col-span-1 md:col-span-2 space-y-4 md:space-y-6">
          {/* Stories Bar */}
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveModal('story')}
              className="w-24 h-40 md:w-28 md:h-44 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm flex flex-col items-center justify-center p-2 cursor-pointer shrink-0 border hover:border-[#007749] transition"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 text-[#007749] rounded-full flex items-center justify-center font-bold text-lg md:text-xl mb-2">+</div>
              <span className="text-[11px] md:text-xs font-semibold text-center">Create Story</span>
            </button>

            {stories.map((story) => (
              <div
                key={story.id}
                style={{ backgroundImage: `url(${story.mediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                className="w-24 h-40 md:w-28 md:h-44 bg-[#007749] rounded-xl shadow-sm relative overflow-hidden shrink-0 flex flex-col justify-end p-2 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="relative z-10 text-[11px] md:text-xs font-bold drop-shadow truncate">
                  {story.user?.fullName || story.caption || 'Story'}
                </span>
              </div>
            ))}
          </div>

          {/* Create Post Box */}
          <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-sm">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-[#007749] text-white rounded-full flex items-center justify-center font-bold text-white shrink-0">M</div>
                <input
                  type="text"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Post to your Mzansi wall..."
                  className="w-full bg-gray-100 px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#007749]"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t text-xs md:text-sm">
                <button type="button" className="text-gray-600 hover:bg-gray-100 px-2 md:px-3 py-1.5 rounded-lg">📷 Photo/Video</button>
                <button type="submit" className="bg-[#007749] text-white px-4 md:px-5 py-1.5 rounded-lg font-semibold hover:bg-[#005f3a] transition">Post</button>
              </div>
            </form>
          </div>

          {/* Feed */}
          <div className="space-y-3 md:space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-sm text-center text-gray-500 text-sm">
                No wall posts yet. Share an update above!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#007749] text-white rounded-full flex items-center justify-center font-bold">
                      {(post.author?.fullName || 'M')[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{post.author?.fullName || 'Mzansi Member'}</h4>
                      <span className="text-[10px] md:text-xs text-gray-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{post.body}</p>
                  <div className="flex justify-between text-gray-500 text-xs md:text-sm pt-2 border-t">
                    <button className="hover:text-[#007749] font-medium">👍 Like</button>
                    <button className="hover:text-[#007749] font-medium">💬 Comment</button>
                    <button className="hover:text-[#007749] font-medium">↗️ Share</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block col-span-1 space-y-3 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm h-fit">
          <h2 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-2">Contacts</h2>
          <div className="space-y-2">
            <a href="/messages" className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
              <div className="w-8 h-8 bg-[#007749] rounded-full text-white flex items-center justify-center text-xs font-bold">A</div>
              <span className="text-sm font-medium">Amo Mphela</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 flex justify-around py-2 shadow-lg">
        <a href="/dashboard" className="flex flex-col items-center text-[#007749] text-xs font-semibold">
          <span className="text-lg">🏠</span> Feed
        </a>
        <a href="/messages" className="flex flex-col items-center text-gray-600 text-xs font-medium">
          <span className="text-lg">💬</span> Chat
        </a>
        <button onClick={() => setActiveModal('group')} className="flex flex-col items-center text-gray-600 text-xs font-medium">
          <span className="text-lg">👥</span> Group
        </button>
        <button onClick={() => setActiveModal('page')} className="flex flex-col items-center text-gray-600 text-xs font-medium">
          <span className="text-lg">📄</span> Page
        </button>
        <a href="/profile" className="flex flex-col items-center text-gray-600 text-xs font-medium">
          <span className="text-lg">👤</span> Profile
        </a>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold capitalize">Create New {activeModal}</h3>
            <form onSubmit={handleModalSubmit} className="space-y-3">
              <input
                type="text"
                required={activeModal !== 'story'}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder={
                  activeModal === 'story'
                    ? 'Image URL (leave blank for default)'
                    : activeModal === 'group'
                    ? 'Group Name'
                    : 'Page Title'
                }
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
              />
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder={activeModal === 'story' ? 'Story caption...' : 'Description / Bio...'}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#007749] text-white font-semibold rounded-lg hover:bg-[#005f3a]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}