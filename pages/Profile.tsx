
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, History, Shield, LogOut, Save, Bell, Eye, Palette, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
            Intelligence Preferences
          </h2>
          <div className="space-y-6">
            <div>
              <p className="font-bold text-sm mb-2">Insight Depth</p>
              <p className="text-xs text-brand-muted mb-3">Balance between raw data and narrative.</p>
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
                    {opt === 'context' ? 'Context Heavy' : opt === 'balanced' ? 'Balanced' : 'Data Only'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-sm mb-2">Alert Sensitivity</p>
              <p className="text-xs text-brand-muted mb-3">Threshold for push notifications.</p>
              <div className="flex gap-2">
                {(['low', 'med', 'high'] as const).map(lv => (
                  <button
                    key={lv}
                    onClick={() => setSettings(s => ({ ...s, alertSensitivity: lv }))}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all ${settings.alertSensitivity === lv
                        ? 'bg-brand-teal text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
                      }`}
                  >
                    {lv}
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
