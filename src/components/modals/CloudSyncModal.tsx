import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  X,
  Cloud,
  CloudOff,
  Laptop,
  Monitor,
  HardDrive,
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  Smartphone,
  Save,
} from 'lucide-react';

export const CloudSyncModal: React.FC = () => {
  const {
    isOffline,
    setIsOffline,
    syncStatus,
    triggerAutoSave,
    lastSavedAt,
    history,
    restoreHistoryStep,
    setActiveModal,
    theme,
  } = useStudio();

  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const devices = [
    { name: 'ThinkPad P1 Gen 6 (Linux / Wayland)', os: 'Linux GTK4', active: true, ip: '192.168.1.104', lastSync: 'Just now' },
    { name: 'MacBook Pro 16″ M3 Max (macOS Metal)', os: 'macOS 15', active: true, ip: '192.168.1.109', lastSync: '2 mins ago' },
    { name: 'Custom Studio Rig (Windows 11 WinUI)', os: 'Windows 11', active: false, ip: '192.168.1.112', lastSync: '1 hour ago' },
  ];

  const handleForceSync = () => {
    triggerAutoSave();
    setSyncSuccessMsg('Cloud state synchronized across all desktop endpoints with AES-256 encryption.');
    setTimeout(() => setSyncSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div
        className="w-full max-w-xl rounded-lg border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{ backgroundColor: theme.bgPanel, borderColor: theme.border }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Cloud Synchronization & Offline Storage</h2>
              <p className="text-xs text-neutral-400">Multi-device desktop synchronization with local zero-latency fallback</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto scrollbar-thin">
          {/* Offline Mode Toggle Banner */}
          <div className="p-3 rounded bg-black/30 border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-semibold text-neutral-200 flex items-center gap-2">
                <span>Offline-First Safe Mode</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isOffline ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isOffline ? 'OFFLINE ACTIVE' : 'ONLINE CLOUD CONNECTED'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                When offline, all edits are committed to high-speed local IndexedDB with continuous snapshotting.
              </p>
            </div>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                isOffline ? 'bg-amber-600' : 'bg-sky-600'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isOffline ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Sync Success Feedback */}
          {syncSuccessMsg && (
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Connected Desktop Devices */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Connected Desktop Workstations
            </div>
            <div className="space-y-1.5">
              {devices.map(dev => (
                <div
                  key={dev.name}
                  className="p-2.5 rounded bg-black/20 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Laptop className="w-4 h-4 text-neutral-400" />
                    <div>
                      <div className="font-medium text-neutral-200">{dev.name}</div>
                      <div className="text-[10px] text-neutral-500">{dev.os} · {dev.ip}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-medium ${dev.active ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {dev.active ? 'Live Sync' : 'Standby'}
                    </span>
                    <div className="text-[9px] text-neutral-500 font-mono">{dev.lastSync}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Data Backup Revisions */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Automatic Snapshot Revisions</span>
              <span className="text-[10px] text-neutral-500 font-mono">{history.length} snapshots</span>
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-white/5 rounded border border-white/5 bg-black/30">
              {history.slice(-5).reverse().map((snap, idx) => (
                <div key={snap.id} className="p-2 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-neutral-300 truncate">{snap.title}</span>
                  </div>
                  <button
                    onClick={() => { restoreHistoryStep(history.length - 1 - idx); }}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-neutral-200 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20 flex justify-between items-center text-xs">
          <span className="text-neutral-400">
            Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleForceSync}
              className="px-3 py-1.5 rounded bg-[#0d99ff] hover:bg-sky-400 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Sync Now</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
