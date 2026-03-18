import React, { useState, useMemo } from 'react';
import { X, Camera, Image, Layout, Settings, Aperture, Wand2, Palette } from 'lucide-react';
import { getSessions, getTemplates } from '../lib/utils/photoStudioService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PhotoStudioModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('sessions');

  const sessions = useMemo(() => getSessions(), []);
  const templates = useMemo(() => getTemplates(), []);

  if (!isOpen) return null;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'good': return { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' };
      case 'fair': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-sky-400';
    return 'text-amber-400';
  };

  const tabs = [
    { id: 'sessions', label: 'Sessions', icon: <Camera size={16} />, count: sessions.length },
    { id: 'templates', label: 'Templates', icon: <Layout size={16} />, count: templates.length },
  ];

  const totalPhotos = sessions.reduce((sum: number, s: any) => sum + (s.photoCount || 0), 0);
  const avgQuality = Math.round(sessions.reduce((sum: number, s: any) => sum + (s.qualityScore || 0), 0) / sessions.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl">
              <Camera size={24} className="text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Photo Studio</h2>
              <p className="text-xs text-slate-500">AI-powered card photography and listing optimization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Total Photos</p>
            <p className="text-lg font-bold text-sky-400">{totalPhotos}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Quality</p>
            <p className="text-lg font-bold text-white">{avgQuality}/100</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Templates</p>
            <p className="text-lg font-bold text-white">{templates.length}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-sky-400 bg-slate-800/50 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700/50">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'sessions' && (
            <div className="grid gap-4">
              {sessions.map((session: any, idx: number) => {
                const quality = getQualityColor(session.quality || 'good');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Aperture size={18} className="text-sky-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{session.name || `Session ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{session.date || '2024-01-15'} • {session.photoCount || 0} photos</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${quality.bg} ${quality.border} ${quality.text}`}>
                        {session.quality || 'good'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Quality</p>
                        <p className={`text-sm font-bold ${getScoreColor(session.qualityScore || 0)}`}>{session.qualityScore || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Resolution</p>
                        <p className="text-sm font-bold text-white">{session.resolution || '4K'}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">AI Enhanced</p>
                        <p className="text-sm font-bold text-sky-400">{session.aiEnhanced ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Listings</p>
                        <p className="text-sm font-bold text-emerald-400">{session.listingsCreated || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                      {idx % 2 === 0 ? <Wand2 size={18} className="text-sky-400" /> : <Palette size={18} className="text-purple-400" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{template.name || `Template ${idx + 1}`}</h3>
                      <p className="text-xs text-slate-500">{template.category || 'Standard'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Uses</p>
                      <p className="text-sm font-bold text-sky-400">{template.usageCount || 0}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Rating</p>
                      <p className="text-sm font-bold text-amber-400">{template.rating || 4.5}/5</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Background</p>
                      <p className="text-sm font-bold text-white">{template.background || 'Dark'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Lighting</p>
                      <p className="text-sm font-bold text-white">{template.lighting || 'Studio'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoStudioModal;
