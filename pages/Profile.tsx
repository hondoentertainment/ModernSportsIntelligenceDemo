
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, History, Shield, LogOut, Save, Bell, Eye, Palette, Check, Zap, Share2, Copy, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_TEAMS, SPORTS } from '../constants';

interface UserSettings {
  insightDepth: 'context' | 'balanced' | 'data';
  alertSensitivity: 'low' | 'med' | 'high';
  favoriteLeagues: string[];
  notifications: {
    priceAlerts: boolean;
    gameUpdates: boolean;
    weeklyDigest: boolean;
  };
  theme: 'dark' | 'auto';
  favoriteTeam: string;
  primarySport: string;
}

const defaultSettings: UserSettings = {
  insightDepth: 'balanced',
  alertSensitivity: 'high',
  favoriteLeagues: ['NBA', 'MLB'],
  notifications: {
    priceAlerts: true,
    gameUpdates: true,
    weeklyDigest: false,
  },
  theme: 'dark',
  favoriteTeam: 'Baltimore Orioles',
  primarySport: 'Baseball',
};

const Profile: React.FC = () => {
  const { user, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('msi_user_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [saved, setSaved] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('msi_user_settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Collector';
  const displayEmail = user?.email || 'demo@sportsintel.io';

  const toggleLeague = (league: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteLeagues: prev.favoriteLeagues.includes(league)
        ? prev.favoriteLeagues.filter(l => l !== league)
        : [...prev.favoriteLeagues, league]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <section className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-teal to-blue-500 p-1">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-950">
            <User size={64} className="text-brand-teal" />
          </div>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1">{displayName}</h1>
            <p className="text-brand-muted font-bold uppercase tracking-[0.2em] text-sm">
              {displayEmail}
              {isDemoMode && <span className="ml-2 text-amber-400">(Demo Mode)</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {settings.favoriteLeagues.map(league => (
              <span key={league} className="px-3 py-1 bg-brand-lime/10 border border-brand-lime/30 rounded-full text-[10px] font-black uppercase text-brand-lime">
                {league} Fan
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 ${saved
            ? 'bg-brand-lime text-brand-charcoal'
            : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
            }`}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </section>

      {/* Public Profile & Sharing */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Globe className="text-brand-teal" size={20} />
            Public Profile
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Public Visibility</span>
            <button className="w-12 h-7 bg-brand-lime rounded-full relative">
              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full"></div>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-brand-charcoal rounded-full border border-slate-800">
            <Share2 size={32} className="text-brand-lime" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white mb-1">Share your Collection</h3>
            <p className="text-slate-400 text-sm">Allow others to view your portfolio and track your Alpha Score.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => {
              window.navigator.clipboard.writeText(`${window.location.origin}/#/p/${user?.user_metadata?.username || 'demo_user'}`);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }} className="flex-1 md:flex-none px-6 py-3 bg-brand-charcoal hover:bg-slate-800 border border-slate-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all">
              {saved ? <Check size={18} /> : <Copy size={18} />}
              {saved ? 'Copied' : 'Copy Link'}
            </button>
            <a href={`/#/p/${user?.user_metadata?.username || 'demo_user'}`} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-6 py-3 bg-brand-lime text-brand-charcoal rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-green transition-all">
              <Eye size={18} />
              View
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Favorite Leagues */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Heart className="text-brand-teal" size={20} />
            Favorite Leagues
          </h2>
          <div className="space-y-3">
            {['NBA', 'MLB', 'NFL', 'NHL'].map(league => (
              <button
                key={league}
                onClick={() => toggleLeague(league)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${settings.favoriteLeagues.includes(league)
                  ? 'bg-brand-lime/10 border-brand-lime/30 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
              >
                <span className="font-bold">{league}</span>
                {settings.favoriteLeagues.includes(league) && (
                  <Check size={18} className="text-brand-lime" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Intelligence Preferences */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <Settings className="text-brand-teal" size={20} />
            Collector Identity
          </h2>
          <div className="space-y-6">
            <div>
              <p className="font-bold text-sm mb-2">Primary Sport</p>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSettings(s => ({ ...s, primarySport: sport }))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all ${settings.primarySport === sport
                      ? 'bg-brand-teal text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
                      }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-sm mb-2">Favorite Team</p>
              <select
                value={settings.favoriteTeam}
                onChange={(e) => setSettings(s => ({ ...s, favoriteTeam: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-teal transition-all"
              >
                {MOCK_TEAMS.map(team => (
                  <option key={team.id} value={team.name}>{team.name} ({team.league})</option>
                ))}
              </select>
            </div>
            <div>
              <p className="font-bold text-sm mb-2">Insight Depth</p>
              <div className="flex gap-2">
                {(['context', 'balanced', 'data'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSettings(s => ({ ...s, insightDepth: opt }))}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all ${settings.insightDepth === opt
                      ? 'bg-brand-teal text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
                      }`}
                  >
                    {opt === 'context' ? 'Context' : opt === 'balanced' ? 'Balanced' : 'Data'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Notifications */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Bell className="text-brand-teal" size={20} />
          Notification Settings
        </h2>
        <div className="space-y-4">
          {[
            { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified when card values change significantly' },
            { key: 'gameUpdates', label: 'Game Updates', desc: 'Live updates from your favorite teams' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of portfolio performance every Sunday' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div>
                <p className="font-bold">{label}</p>
                <p className="text-xs text-brand-muted">{desc}</p>
              </div>
              <button
                onClick={() => setSettings(s => ({
                  ...s,
                  notifications: { ...s.notifications, [key]: !s.notifications[key as keyof typeof s.notifications] }
                }))}
                className={`w-12 h-7 rounded-full transition-all relative ${settings.notifications[key as keyof typeof settings.notifications]
                  ? 'bg-brand-lime'
                  : 'bg-slate-700'
                  }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.notifications[key as keyof typeof settings.notifications] ? 'left-6' : 'left-1'
                  }`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* External Connections */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Shield className="text-brand-teal" size={20} />
          API Connectivity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black italic">
                e
              </div>
              <div>
                <p className="font-bold text-sm">eBay Official API</p>
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Market Feed (Sold Listings)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></div>
              <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between opacity-50 grayscale">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black">
                P
              </div>
              <div>
                <p className="font-bold text-sm">PSA Direct</p>
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Population Report Data</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disabled</span>
          </div>
        </div>
      </section>

      {/* Sync Scheduler Section */}
      <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <History className="text-brand-teal" size={20} />
            Market Intelligence Sync
          </h2>
          <div className="px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full">
            <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Auto-Refresh Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="font-bold text-sm mb-2">Refesh Interval</p>
              <div className="flex flex-wrap gap-2">
                {['manual', 'hourly', 'daily', 'weekly'].map((interval) => (
                  <button
                    key={interval}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                          ${interval === 'daily'
                        ? 'bg-brand-lime border-brand-lime text-brand-charcoal'
                        : 'bg-slate-900 border-slate-800 text-brand-muted hover:border-slate-700'}`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Next Scheduled Sync</p>
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-brand-lime" />
                <span className="text-xl font-mono font-bold text-white">04:22:18</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div>
                <p className="font-bold text-sm">Sync on Startup</p>
                <p className="text-[10px] text-brand-muted uppercase">Refresh NAV when app launches</p>
              </div>
              <div className="w-12 h-7 bg-brand-lime rounded-full relative">
                <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div>
                <p className="font-bold text-sm">Push Notifications</p>
                <p className="text-[10px] text-brand-muted uppercase">Notify on major price shifts</p>
              </div>
              <div className="w-12 h-7 bg-brand-lime rounded-full relative">
                <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Out */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 font-bold hover:text-red-300 transition-colors uppercase tracking-[0.2em] text-xs"
        >
          <LogOut size={16} /> Sign out of Intelligence Platform
        </button>
      </div>
    </div>
  );
};

export default Profile;
