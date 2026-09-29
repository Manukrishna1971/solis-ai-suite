import React, { useState } from 'react';
import { X, Sparkles, Check, Trash2, BrainCircuit } from 'lucide-react';
import { trainCustomObject, getCustomTrainedLabels, clearCustomModel } from '../utils/realVisionDetector';
import { audioFX } from '../utils/audioFX';

interface CustomTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoElement: HTMLVideoElement | null;
  onTrainingComplete?: () => void;
}

export const CustomTrainerModal: React.FC<CustomTrainerModalProps> = ({
  isOpen,
  onClose,
  videoElement,
  onTrainingComplete,
}) => {
  const [objectName, setObjectName] = useState('Ironbox');
  const [isTraining, setIsTraining] = useState(false);
  const [samplesCount, setSamplesCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTrained = getCustomTrainedLabels();

  const handleCaptureSamples = async () => {
    if (!videoElement || !objectName.trim()) return;
    setIsTraining(true);
    setSuccessMessage(null);
    audioFX.playClick();

    let count = 0;
    const interval = setInterval(async () => {
      if (videoElement && videoElement.readyState >= 2) {
        count++;
        setSamplesCount(count);
        await trainCustomObject(objectName.trim(), videoElement);

        if (count >= 12) {
          clearInterval(interval);
          setIsTraining(false);
          setSuccessMessage(`Learned "${objectName.trim()}"! The AI will now recognize it.`);
          audioFX.playSuccess();
          onTrainingComplete?.();
        }
      }
    }, 150);
  };

  const handleClear = () => {
    audioFX.playClick();
    clearCustomModel();
    setSuccessMessage('Custom neural memory cleared.');
    onTrainingComplete?.();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          audioFX.playClick();
          onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-surface rounded-3xl border border-vanilla/25 shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200 bg-[#161408]/95 text-vanilla">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-vanilla/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tangerine/15 text-tangerine border border-tangerine/30 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-vanilla tracking-tight">
                Teach AI Any Custom Object
              </h3>
              <p className="text-xs text-vanilla-muted">
                Hold up your object in front of the camera to teach it in 2 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-vanilla-muted hover:text-vanilla hover:bg-brunswick/40 border border-transparent hover:border-vanilla/15 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Name Pills */}
        <div className="my-4">
          <label className="text-xs font-mono uppercase text-vanilla-muted block mb-2 font-bold">
            Select or Type Object Name:
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Ironbox', 'Specs / Glasses', 'Pen / Marker', 'Keys', 'Watch'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  audioFX.playClick();
                  setObjectName(preset);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  objectName === preset
                    ? 'bg-tangerine text-darkbrown-deep border-tangerine shadow-sm'
                    : 'bg-darkbrown/80 text-vanilla-soft hover:text-vanilla border-vanilla/15'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={objectName}
            onChange={(e) => setObjectName(e.target.value)}
            placeholder="e.g. Ironbox, My Glasses, Ballpoint Pen"
            className="w-full bg-darkbrown/80 border border-vanilla/20 rounded-xl px-4 py-2.5 text-sm text-vanilla focus:outline-none focus:border-tangerine font-sans placeholder-vanilla-muted/60"
          />
        </div>

        {/* Capture Action */}
        <div className="p-4 rounded-2xl bg-brunswick/30 border border-vanilla/15 text-center my-4">
          <p className="text-xs text-vanilla-soft mb-3 leading-relaxed">
            Position your <strong>{objectName || 'object'}</strong> clearly inside the camera frame, then click capture.
          </p>

          <button
            onClick={handleCaptureSamples}
            disabled={isTraining || !objectName.trim()}
            className="btn-tangerine-glow w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-tangerine-sm"
          >
            {isTraining ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Learning... ({samplesCount} / 12 Samples)</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                <span>Capture Samples & Train Now</span>
              </>
            )}
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-brunswick/70 border border-tangerine/50 text-xs font-mono text-vanilla flex items-center gap-2 mb-4 animate-in fade-in">
            <Check className="w-4 h-4 text-tangerine flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Currently Learned Memory */}
        {currentTrained.length > 0 && (
          <div className="pt-3 border-t border-vanilla/10 flex items-center justify-between text-xs font-mono text-vanilla-muted">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-vanilla">Learned:</span>
              {currentTrained.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded bg-darkbrown text-tangerine border border-tangerine/30">
                  {c}
                </span>
              ))}
            </div>

            <button
              onClick={handleClear}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] p-1 rounded"
              title="Clear Custom Memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
