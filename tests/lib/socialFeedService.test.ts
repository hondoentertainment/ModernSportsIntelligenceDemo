import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
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
} from '../../lib/socialFeedService';
import type { FeedPost, PostType } from '../../lib/socialFeedService';

describe('socialFeedService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ─── getFeedPosts ────────────────────────────────────────────────────────

  describe('getFeedPosts', () => {
    it('returns seeded mock posts on first call', () => {
      const posts = getFeedPosts();
      expect(posts.length).toBeGreaterThanOrEqual(15);
    });

    it('returns posts sorted by timestamp descending', () => {
      const posts = getFeedPosts();
      for (let i = 1; i < posts.length; i++) {
        expect(new Date(posts[i - 1].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(posts[i].timestamp).getTime());
      }
    });

    it('each post has required fields', () => {
      const posts = getFeedPosts();
      for (const p of posts) {
        expect(p.id).toBeTruthy();
        expect(p.userId).toBeTruthy();
        expect(p.username).toBeTruthy();
        expect(typeof p.likes).toBe('number');
        expect(Array.isArray(p.comments)).toBe(true);
        expect(Array.isArray(p.tags)).toBe(true);
      }
    });
  });

  // ─── createPost ──────────────────────────────────────────────────────────

  describe('createPost', () => {
    it('creates a new post and returns it with generated fields', () => {
      const post = createPost({
        userId: 'test-user',
        username: 'Tester',
        avatar: '/test.png',
        type: 'pickup',
        content: 'Test pickup post',
        tags: ['test'],
      });
      expect(post.id).toBeTruthy();
      expect(post.likes).toBe(0);
      expect(post.comments).toEqual([]);
      expect(post.content).toBe('Test pickup post');
    });

    it('new post appears at the top of the feed', () => {
      createPost({
        userId: 'test-user',
        username: 'Tester',
        avatar: '/test.png',
        type: 'pull',
        content: 'Brand new pull',
        tags: [],
      });
      const posts = getFeedPosts();
      expect(posts[0].content).toBe('Brand new pull');
    });
  });

  // ─── likePost ────────────────────────────────────────────────────────────

  describe('likePost', () => {
    it('increments the like count by 1', () => {
      const posts = getFeedPosts();
      const before = posts[0].likes;
      const updated = likePost(posts[0].id);
      expect(updated).not.toBeNull();
      expect(updated!.likes).toBe(before + 1);
    });

    it('returns null for non-existent post', () => {
      expect(likePost('nonexistent-id')).toBeNull();
    });
  });

  // ─── addComment ──────────────────────────────────────────────────────────

  describe('addComment', () => {
    it('adds a comment to an existing post', () => {
      const posts = getFeedPosts();
      const before = posts[0].comments.length;
      const updated = addComment(posts[0].id, {
        userId: 'commenter',
        username: 'Commenter',
        text: 'Nice card!',
      });
      expect(updated).not.toBeNull();
      expect(updated!.comments.length).toBe(before + 1);
      expect(updated!.comments[updated!.comments.length - 1].text).toBe('Nice card!');
    });

    it('returns null for non-existent post', () => {
      expect(addComment('nonexistent', { userId: 'a', username: 'a', text: 'x' })).toBeNull();
    });
  });

  // ─── getUserProfile ──────────────────────────────────────────────────────

  describe('getUserProfile', () => {
    it('returns a profile for a known user', () => {
      const profile = getUserProfile('user-1');
      expect(profile).not.toBeNull();
      expect(profile!.username).toBe('CardKing23');
      expect(Array.isArray(profile!.badges)).toBe(true);
    });

    it('returns null for unknown user', () => {
      expect(getUserProfile('nonexistent-user')).toBeNull();
    });
  });

  // ─── following ───────────────────────────────────────────────────────────

  describe('follow / unfollow', () => {
    it('returns default following list', () => {
      const following = getFollowing();
      expect(Array.isArray(following)).toBe(true);
      expect(following.length).toBeGreaterThan(0);
    });

    it('followUser adds a user to the following list', () => {
      const result = followUser('user-99');
      expect(result).toContain('user-99');
    });

    it('followUser does not duplicate an already-followed user', () => {
      followUser('user-99');
      const result = followUser('user-99');
      expect(result.filter(id => id === 'user-99').length).toBe(1);
    });

    it('unfollowUser removes a user from the following list', () => {
      followUser('user-99');
      const result = unfollowUser('user-99');
      expect(result).not.toContain('user-99');
    });
  });

  // ─── getFeedStats ────────────────────────────────────────────────────────

  describe('getFeedStats', () => {
    it('returns stats with expected shape', () => {
      const stats = getFeedStats();
      expect(typeof stats.totalPosts).toBe('number');
      expect(typeof stats.activeUsers).toBe('number');
      expect(typeof stats.postsToday).toBe('number');
      expect(stats.topPost).toHaveProperty('id');
      expect(stats.topPost).toHaveProperty('likes');
      expect(Array.isArray(stats.trendingTags)).toBe(true);
    });

    it('totalPosts matches actual post count', () => {
      const stats = getFeedStats();
      const posts = getFeedPosts();
      expect(stats.totalPosts).toBe(posts.length);
    });
  });

  // ─── getTrendingTags ─────────────────────────────────────────────────────

  describe('getTrendingTags', () => {
    it('returns an array of tag strings', () => {
      const tags = getTrendingTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      for (const tag of tags) {
        expect(typeof tag).toBe('string');
      }
    });
  });

  // ─── notifications ──────────────────────────────────────────────────────

  describe('notifications', () => {
    it('returns seeded notifications', () => {
      const notifs = getNotifications();
      expect(notifs.length).toBeGreaterThan(0);
    });

    it('notifications are sorted by timestamp descending', () => {
      const notifs = getNotifications();
      for (let i = 1; i < notifs.length; i++) {
        expect(new Date(notifs[i - 1].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(notifs[i].timestamp).getTime());
      }
    });

    it('markNotificationRead marks a notification as read', () => {
      const notifs = getNotifications();
      const unread = notifs.find(n => !n.read);
      if (unread) {
        const result = markNotificationRead(unread.id);
        expect(result).not.toBeNull();
        expect(result!.read).toBe(true);
      }
    });

    it('markNotificationRead returns null for unknown id', () => {
      expect(markNotificationRead('fake-id')).toBeNull();
    });
  });

  // ─── searchPosts ─────────────────────────────────────────────────────────

  describe('searchPosts', () => {
    it('finds posts by content keyword', () => {
      const results = searchPosts('superfractor');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content.toLowerCase()).toContain('superfractor');
    });

    it('finds posts by player name', () => {
      const results = searchPosts('Luka');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for no match', () => {
      expect(searchPosts('zzzzxyznonexistent')).toEqual([]);
    });
  });

  // ─── filterByType ────────────────────────────────────────────────────────

  describe('filterByType', () => {
    it('returns only posts of the specified type', () => {
      const pickups = filterByType('pickup');
      for (const p of pickups) {
        expect(p.type).toBe('pickup');
      }
      expect(pickups.length).toBeGreaterThan(0);
    });
  });

  // ─── formatTimestamp ─────────────────────────────────────────────────────

  describe('formatTimestamp', () => {
    it('returns "Just now" for recent timestamps', () => {
      expect(formatTimestamp(new Date().toISOString())).toBe('Just now');
    });

    it('returns minutes ago for timestamps within the hour', () => {
      const ts = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatTimestamp(ts)).toMatch(/5m ago/);
    });

    it('returns hours ago for timestamps within the day', () => {
      const ts = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(formatTimestamp(ts)).toMatch(/3h ago/);
    });

    it('returns days ago for timestamps within the week', () => {
      const ts = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatTimestamp(ts)).toMatch(/2d ago/);
    });
  });

  // ─── getPostTypeColor / Label / Icon ─────────────────────────────────────

  describe('post type helpers', () => {
    const types: PostType[] = ['pickup', 'pull', 'collection_highlight', 'grading_result', 'milestone'];

    it('getPostTypeColor returns a tailwind class for each type', () => {
      for (const t of types) {
        expect(getPostTypeColor(t)).toMatch(/^text-/);
      }
    });

    it('getPostTypeLabel returns a human-readable label for each type', () => {
      for (const t of types) {
        const label = getPostTypeLabel(t);
        expect(label.length).toBeGreaterThan(0);
        expect(label).not.toBe(t); // should be a formatted label, not the raw type
      }
    });

    it('getPostTypeIcon returns an icon name for each type', () => {
      for (const t of types) {
        expect(getPostTypeIcon(t).length).toBeGreaterThan(0);
      }
    });
  });
});
