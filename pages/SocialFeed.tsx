import React, { useState, useMemo } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bell,
  TrendingUp,
  User,
  Hash,
  ShoppingBag,
  Package,
  Star,
  Award,
  Trophy,
  Plus,
  Search,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getFeedPosts,
  createPost,
  likePost,
  addComment,
  getUserProfile,
  getFollowing,
  followUser,
  unfollowUser,
  getFeedStats,
  getTrendingTags,
  getNotifications,
  markNotificationRead,
  searchPosts,
  filterByType,
  formatTimestamp,
  getPostTypeColor,
  getPostTypeLabel,
  getPostTypeIcon,
} from '../lib/social/socialFeedService.ts';
import type { FeedPost, PostType, Notification as FeedNotification, UserProfile, FeedStats } from '../lib/social/socialFeedService.ts';

// ─── Icon resolver ───────────────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag size={16} />,
  Package: <Package size={16} />,
  Star: <Star size={16} />,
  Award: <Award size={16} />,
  Trophy: <Trophy size={16} />,
};

function resolveIcon(type: PostType) {
  return iconMap[getPostTypeIcon(type)] ?? <Star size={16} />;
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type TabId = 'feed' | 'trending' | 'notifications' | 'profile';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'Feed', icon: <BarChart3 size={18} /> },
  { id: 'trending', label: 'Trending', icon: <TrendingUp size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
];

// ─── Component ───────────────────────────────────────────────────────────────

const SocialFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [posts, setPosts] = useState<FeedPost[]>(() => getFeedPosts());
  const [notifications, setNotifications] = useState<FeedNotification[]>(() => getNotifications());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PostType | ''>('');
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('pickup');
  const [newPostPlayer, setNewPostPlayer] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [following, setFollowing] = useState<string[]>(() => getFollowing());

  const stats: FeedStats = useMemo(() => getFeedStats(), [posts]);
  const trendingTags = useMemo(() => getTrendingTags(), [posts]);
  const profile: UserProfile | null = useMemo(() => getUserProfile('current-user'), []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const displayedPosts = useMemo(() => {
    if (searchQuery) return searchPosts(searchQuery);
    if (typeFilter) return filterByType(typeFilter);
    return posts;
  }, [posts, searchQuery, typeFilter]);

  // Activity chart data — posts per day for last 7 days
  const activityData = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    for (const p of posts) {
      const key = p.timestamp.slice(0, 10);
      if (key in days) days[key] += 1;
    }
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5),
      posts: count,
    }));
  }, [posts]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleLike = (id: string) => {
    likePost(id);
    setPosts(getFeedPosts());
  };

  const handleComment = (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    addComment(postId, { userId: 'current-user', username: 'MyProfile', text });
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    setPosts(getFeedPosts());
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPost({
      userId: 'current-user',
      username: 'MyProfile',
      avatar: '/avatars/me.png',
      type: newPostType,
      content: newPostContent,
      player: newPostPlayer || undefined,
      tags: newPostTags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setNewPostContent('');
    setNewPostPlayer('');
    setNewPostTags('');
    setShowCreateForm(false);
    setPosts(getFeedPosts());
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
  };

  const handleToggleFollow = (userId: string) => {
    if (following.includes(userId)) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
    setFollowing(getFollowing());
  };

  // ─── Render helpers ──────────────────────────────────────────────────────

  const renderPostCard = (post: FeedPost) => (
    <div key={post.id} className="bg-slate-800 rounded-xl p-5 space-y-4 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
            {post.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{post.username}</p>
            <p className="text-slate-400 text-xs">{formatTimestamp(post.timestamp)}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-700 ${getPostTypeColor(post.type)}`}>
          {resolveIcon(post.type)}
          {getPostTypeLabel(post.type)}
        </span>
      </div>

      {/* Content */}
      <p className="text-slate-200 text-sm leading-relaxed">{post.content}</p>

      {post.player && (
        <p className="text-slate-400 text-xs">
          <span className="text-slate-500">Player:</span> {post.player}
          {post.cardName && <> &middot; {post.cardName}</>}
        </p>
      )}

      {post.imageUrl && (
        <div className="w-full h-48 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-500 text-sm">
          {post.cardName || 'Card Image'}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-2 border-t border-slate-700/50">
        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition text-sm">
          <Heart size={16} /> {post.likes}
        </button>
        <span className="flex items-center gap-1 text-slate-400 text-sm">
          <MessageCircle size={16} /> {post.comments.length}
        </span>
      </div>

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="space-y-2 pl-4 border-l-2 border-slate-700">
          {post.comments.slice(0, 3).map((c, i) => (
            <div key={i} className="text-xs">
              <span className="text-white font-medium">{c.username}</span>{' '}
              <span className="text-slate-400">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentTexts[post.id] || ''}
          onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
          placeholder="Add a comment..."
          className="flex-1 bg-slate-700/50 text-white text-xs rounded-lg px-3 py-2 placeholder-slate-500 border border-slate-600 focus:outline-none focus:border-blue-500"
        />
        <button onClick={() => handleComment(post.id)} className="text-blue-400 hover:text-blue-300 transition">
          <Send size={16} />
        </button>
      </div>
    </div>
  );

  // ─── Tab content ─────────────────────────────────────────────────────────

  const renderFeedTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search & filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setTypeFilter(''); }}
              placeholder="Search posts, players, tags..."
              className="w-full bg-slate-800 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as PostType | ''); setSearchQuery(''); }}
            className="bg-slate-800 text-white text-sm rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="pickup">Pickups</option>
            <option value="pull">Pack Pulls</option>
            <option value="collection_highlight">Highlights</option>
            <option value="grading_result">Grading</option>
            <option value="milestone">Milestones</option>
          </select>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition">
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="bg-slate-800 rounded-xl p-5 space-y-4 border border-blue-500/30">
            <h3 className="text-white font-semibold">Create Post</h3>
            <select
              value={newPostType}
              onChange={e => setNewPostType(e.target.value as PostType)}
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600"
            >
              <option value="pickup">Pickup</option>
              <option value="pull">Pack Pull</option>
              <option value="collection_highlight">Collection Highlight</option>
              <option value="grading_result">Grading Result</option>
              <option value="milestone">Milestone</option>
            </select>
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="What's happening in your collection?"
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 placeholder-slate-500 h-24 resize-none"
            />
            <input
              type="text"
              value={newPostPlayer}
              onChange={e => setNewPostPlayer(e.target.value)}
              placeholder="Player name (optional)"
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 placeholder-slate-500"
            />
            <input
              type="text"
              value={newPostTags}
              onChange={e => setNewPostTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 placeholder-slate-500"
            />
            <button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-6 py-2 transition">
              Post
            </button>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {displayedPosts.map(renderPostCard)}
          {displayedPosts.length === 0 && (
            <p className="text-slate-500 text-center py-12">No posts found.</p>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Stats */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><BarChart3 size={18} /> Community Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
              <p className="text-slate-400 text-xs">Total Posts</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              <p className="text-slate-400 text-xs">Active Users</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.postsToday}</p>
              <p className="text-slate-400 text-xs">Posts Today</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.topPost.likes}</p>
              <p className="text-slate-400 text-xs">Top Likes</p>
            </div>
          </div>
        </div>

        {/* Activity chart */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 space-y-3">
          <h3 className="text-white font-semibold">Posts Per Day</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                <Bar dataKey="posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending tags sidebar */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2"><Hash size={18} /> Trending Tags</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setSearchQuery(tag); setTypeFilter(''); }}
                className="text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested profiles */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2"><Users size={18} /> Collectors to Follow</h3>
          {['user-1', 'user-2', 'user-3'].map(uid => {
            const p = getUserProfile(uid);
            if (!p) return null;
            const isFollowing = following.includes(uid);
            return (
              <div key={uid} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.username}</p>
                    <p className="text-slate-400 text-xs">{p.followersCount.toLocaleString()} followers</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleFollow(uid)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition ${isFollowing ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTrendingTab = () => (
    <div className="space-y-8">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2"><TrendingUp size={20} /> Trending Now</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingTags.map((tag, i) => (
            <div key={tag} className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-500">#{i + 1}</span>
              <div>
                <p className="text-white font-medium">#{tag}</p>
                <p className="text-slate-400 text-xs">
                  {getFeedPosts().filter(p => p.tags.includes(tag)).length} posts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white text-lg font-semibold">Top Posts</h3>
        {[...getFeedPosts()].sort((a, b) => b.likes - a.likes).slice(0, 5).map(renderPostCard)}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{unreadCount} unread</span>
        )}
      </div>
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => !n.read && handleMarkRead(n.id)}
          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${n.read ? 'bg-slate-800 border-slate-700/50 opacity-60' : 'bg-slate-800 border-blue-500/30 hover:border-blue-500/50'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.type === 'like' ? 'bg-red-500/10 text-red-400' : n.type === 'comment' ? 'bg-blue-500/10 text-blue-400' : n.type === 'follow' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
            {n.type === 'like' ? <Heart size={18} /> : n.type === 'comment' ? <MessageCircle size={18} /> : n.type === 'follow' ? <User size={18} /> : <Bell size={18} />}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">
              <span className="font-semibold">{n.fromUser}</span>{' '}
              <span className="text-slate-400">{n.message}</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">{formatTimestamp(n.timestamp)}</p>
          </div>
          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
        </div>
      ))}
      {notifications.length === 0 && (
        <p className="text-slate-500 text-center py-12">No notifications yet.</p>
      )}
    </div>
  );

  const renderProfileTab = () => {
    if (!profile) return <p className="text-slate-500">Profile not found.</p>;
    return (
      <div className="max-w-2xl space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-white text-xl font-bold">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold">{profile.username}</h3>
              <p className="text-slate-400 text-sm">{profile.bio}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-slate-700/50 rounded-lg p-3">
              <p className="text-xl font-bold text-white">{profile.postsCount}</p>
              <p className="text-slate-400 text-xs">Posts</p>
            </div>
            <div className="text-center bg-slate-700/50 rounded-lg p-3">
              <p className="text-xl font-bold text-white">{profile.followersCount}</p>
              <p className="text-slate-400 text-xs">Followers</p>
            </div>
            <div className="text-center bg-slate-700/50 rounded-lg p-3">
              <p className="text-xl font-bold text-white">{profile.followingCount}</p>
              <p className="text-slate-400 text-xs">Following</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Calendar size={14} />
            Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.badges.map(badge => (
                <span key={badge} className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Award size={12} /> {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">My Posts</h3>
          {posts.filter(p => p.userId === 'current-user').length === 0 ? (
            <p className="text-slate-500 text-center py-8">You haven't posted yet. Share your first card!</p>
          ) : (
            posts.filter(p => p.userId === 'current-user').map(renderPostCard)
          )}
        </div>
      </div>
    );
  };

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Collector <span className="text-blue-400">Social Feed</span>
          </h1>
          <p className="text-slate-400 max-w-2xl font-medium">
            Share pickups, pulls, and milestones with the collecting community.
          </p>
        </div>
        {/* Notification bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative self-start md:self-auto p-2"
        >
          <Bell size={24} className="text-slate-400 hover:text-white transition" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            {tab.icon} {tab.label}
            {tab.id === 'notifications' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'feed' && renderFeedTab()}
      {activeTab === 'trending' && renderTrendingTab()}
      {activeTab === 'notifications' && renderNotificationsTab()}
      {activeTab === 'profile' && renderProfileTab()}
    </div>
  );
};

export default SocialFeed;
