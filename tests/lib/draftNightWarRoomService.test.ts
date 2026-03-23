import { describe, expect, it } from 'vitest';
import {
  getDraftStatusColor,
  getPredictionColor,
  getDraftWarRooms,
  getDraftWarRoomStats,
} from '../../lib/utils/draftNightWarRoomService';

describe('draftNightWarRoomService', () => {
  it('maps draft status to Tailwind color classes', () => {
    expect(getDraftStatusColor('live')).toBe('text-red-400');
    expect(getDraftStatusColor('pre-draft')).toBe('text-amber-400');
    expect(getDraftStatusColor('completed')).toBe('text-emerald-400');
  });

  it('maps prediction outcomes to Tailwind color classes', () => {
    expect(getPredictionColor('correct')).toBe('text-emerald-400');
    expect(getPredictionColor('incorrect')).toBe('text-red-400');
    expect(getPredictionColor('pending')).toBe('text-amber-400');
  });

  it('returns three war rooms with stable ids', () => {
    const rooms = getDraftWarRooms();
    expect(rooms).toHaveLength(3);
    expect(rooms.map((r) => r.id)).toEqual(['wr-nfl-2026', 'wr-nba-2025', 'wr-mlb-2026']);
  });

  it('returns aggregate stats snapshot', () => {
    const stats = getDraftWarRoomStats();
    expect(stats.draftsAttended).toBe(7);
    expect(stats.predictionAccuracy).toBe(61.9);
    expect(stats.favoriteTeam).toBe('New York Giants');
  });
});
