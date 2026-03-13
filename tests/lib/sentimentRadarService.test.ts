import { describe, it, expect } from 'vitest';
import {
  getPlayerSentiment,
  getAllPlayerSentiments,
  getTrendingSentiments,
  getSentimentAlerts,
  getSentimentTimeline,
  getMarketSentimentOverview,
  getScatterData,
} from '../../lib/sentimentRadarService';

describe('sentimentRadarService', () => {
  describe('getPlayerSentiment', () => {
    it('returns data for known player', () => {
      const data = getPlayerSentiment('luka-doncic');
      expect(data).toBeDefined();
      expect(data!.player).toBe('Luka Doncic');
      expect(data!.overallSentiment).toBeGreaterThanOrEqual(-100);
      expect(data!.overallSentiment).toBeLessThanOrEqual(100);
    });

    it('returns undefined for unknown player', () => {
      const data = getPlayerSentiment('nonexistent-player');
      expect(data).toBeUndefined();
    });

    it('has valid source sentiments', () => {
      const data = getPlayerSentiment('victor-wembanyama');
      expect(data).toBeDefined();
      expect(data!.sources.twitter.score).toBeGreaterThanOrEqual(-100);
      expect(data!.sources.reddit.volume).toBeGreaterThan(0);
      expect(['rising', 'falling', 'stable']).toContain(data!.sources.forums.trend);
    });

    it('has valid sentiment level', () => {
      const data = getPlayerSentiment('luka-doncic');
      expect(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']).toContain(data!.sentimentLevel);
    });
  });

  describe('getAllPlayerSentiments', () => {
    it('returns all players', () => {
      const all = getAllPlayerSentiments();
      expect(all.length).toBeGreaterThanOrEqual(10);
    });

    it('returns a copy (not the original array)', () => {
      const a = getAllPlayerSentiments();
      const b = getAllPlayerSentiments();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('getTrendingSentiments', () => {
    it('returns top 5 by absolute price change', () => {
      const trending = getTrendingSentiments();
      expect(trending.length).toBe(5);
      for (let i = 1; i < trending.length; i++) {
        expect(Math.abs(trending[i - 1].priceChange24h)).toBeGreaterThanOrEqual(
          Math.abs(trending[i].priceChange24h)
        );
      }
    });
  });

  describe('getSentimentAlerts', () => {
    it('returns array of alerts', () => {
      const alerts = getSentimentAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('each alert has valid fields', () => {
      const alerts = getSentimentAlerts();
      for (const a of alerts) {
        expect(a.id).toBeTruthy();
        expect(a.player).toBeTruthy();
        expect(['twitter', 'reddit', 'forums', 'multi']).toContain(a.source);
        expect(a.message).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(a.severity);
        expect(a.timestamp).toBeTruthy();
      }
    });

    it('includes both positive and negative sentiment alerts', () => {
      const alerts = getSentimentAlerts();
      const positive = alerts.filter(a => a.sentiment > 0);
      const negative = alerts.filter(a => a.sentiment < 0);
      expect(positive.length).toBeGreaterThan(0);
      expect(negative.length).toBeGreaterThan(0);
    });
  });

  describe('getSentimentTimeline', () => {
    it('returns timeline for known player', () => {
      const timeline = getSentimentTimeline('luka-doncic');
      expect(timeline.length).toBe(30);
    });

    it('returns empty for unknown player', () => {
      const timeline = getSentimentTimeline('nonexistent');
      expect(timeline).toEqual([]);
    });

    it('timeline points have valid structure', () => {
      const timeline = getSentimentTimeline('victor-wembanyama');
      for (const p of timeline) {
        expect(p.date).toBeTruthy();
        expect(typeof p.sentiment).toBe('number');
        expect(p.sentiment).toBeGreaterThanOrEqual(-100);
        expect(p.sentiment).toBeLessThanOrEqual(100);
        expect(p.volume).toBeGreaterThan(0);
        expect(p.price).toBeGreaterThan(0);
      }
    });
  });

  describe('getMarketSentimentOverview', () => {
    it('returns valid overview', () => {
      const overview = getMarketSentimentOverview();
      expect(typeof overview.overall).toBe('number');
      expect(overview.bullish).toBeGreaterThanOrEqual(0);
      expect(overview.bearish).toBeGreaterThanOrEqual(0);
      expect(overview.neutral).toBeGreaterThanOrEqual(0);
      expect(overview.bullish + overview.bearish + overview.neutral).toBe(getAllPlayerSentiments().length);
      expect(overview.totalVolume).toBeGreaterThan(0);
    });

    it('has top keywords', () => {
      const overview = getMarketSentimentOverview();
      expect(overview.topKeywords.length).toBeGreaterThan(0);
      expect(overview.topKeywords.length).toBeLessThanOrEqual(12);
      for (const kw of overview.topKeywords) {
        expect(kw.keyword).toBeTruthy();
        expect(kw.count).toBeGreaterThan(0);
      }
    });
  });

  describe('getScatterData', () => {
    it('returns data for all players', () => {
      const data = getScatterData();
      expect(data.length).toBe(getAllPlayerSentiments().length);
      for (const d of data) {
        expect(d.player).toBeTruthy();
        expect(typeof d.sentiment).toBe('number');
        expect(typeof d.priceChange).toBe('number');
      }
    });
  });
});
