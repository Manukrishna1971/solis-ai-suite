import { useState } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { RealWebcamView } from './components/RealWebcamView';
import { RealPhotoUploadView } from './components/RealPhotoUploadView';
import { Video, Image as ImageIcon, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { audioFX } from './utils/audioFX';

export function App() {
  const [activeTab, setActiveTab] = useState<'webcam' | 'upload'>('webcam');
  const [audioEnabled, setAudioEnabled] = useState(audioFX.isEnabled());

  const handleToggleAudio = () => {
    const newState = audioFX.toggle();
    setAudioEnabled(newState);
  };

  const handleSelectTab = (tab: 'webcam' | 'upload') => {
    audioFX.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="relative min-h-screen text-vanilla selection:bg-tangerine selection:text-darkbrown-deep flex flex-col justify-between overflow-x-hidden">
      
      {/* Ambient background with cursor spotlight, mesh gradients & luxury noise */}
      <AmbientBackground />

      {/* Floating Glassmorphism Navbar */}
      <header className="fixed top-4 inset-x-0 z-40 max-w-4xl mx-auto px-4">
        <nav className="glass-surface rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between shadow-2xl border border-vanilla/15">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brunswick to-darkbrown border border-vanilla/30 flex items-center justify-center shadow-inner">
              <div className="w-3 h-3 bg-tangerine rounded-sm rotate-45 shadow-[0_0_10px_#EB7D00]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold tracking-wider text-sm sm:text-base text-vanilla">
                  SOLIS
                </span>
                <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.2 rounded bg-tangerine/15 text-tangerine border border-tangerine/30 font-bold">
                  AI VISION
                </span>
              </div>
            </div>
          </div>

          {/* 2-Way Pure Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-darkbrown/85 border border-vanilla/15 shadow-inner">
            <button
              onClick={() => handleSelectTab('webcam')}
              onMouseEnter={() => audioFX.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'webcam'
                  ? 'bg-tangerine text-darkbrown-deep shadow-md'
                  : 'text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Live Webcam</span>
            </button>

            <button
              onClick={() => handleSelectTab('upload')}
              onMouseEnter={() => audioFX.playHover()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-tangerine text-darkbrown-deep shadow-md'
                  : 'text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photo Upload</span>
            </button>
          </div>

          {/* Sound & Telemetry Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-vanilla-muted px-2 py-1 rounded-lg bg-brunswick/30 border border-vanilla/10">
              <ShieldCheck className="w-3.5 h-3.5 text-tangerine" />
              <span>TF.js MobileNet</span>
            </div>

            <button
              onClick={handleToggleAudio}
              onMouseEnter={() => audioFX.playHover()}
              title={audioEnabled ? 'Mute luxury sound effects' : 'Enable luxury sound effects'}
              className="p-2 rounded-lg text-xs text-vanilla-soft hover:text-vanilla bg-brunswick/30 hover:bg-brunswick/50 border border-vanilla/15 transition-all"
            >
              {audioEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-tangerine" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-vanilla-muted" />
              )}
            </button>
          </div>

        </nav>
      </header>

      {/* Main Single-Purpose Body */}
      <main className="flex-1 relative z-10">
        {activeTab === 'webcam' ? (
          <RealWebcamView />
        ) : (
          <RealPhotoUploadView />
        )}
      </main>

      {/* Minimal Luxury Footer */}
      <footer className="relative z-20 border-t border-vanilla/10 bg-darkbrown-obsidian/80 backdrop-blur-md py-4 px-4 text-xs font-mono text-vanilla-muted text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px]">
          <span className="text-vanilla-soft">
            SOLIS AI • Real-Time Computer Vision & Emotion Engine
          </span>
          <span className="text-tangerine font-semibold">
            Zero-Server Egress • 100% Client-Side Neural Inference
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;
