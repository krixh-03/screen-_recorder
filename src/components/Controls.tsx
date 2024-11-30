import React from 'react';
import { Play, Pause, Square, Download } from 'lucide-react';
import { cn } from '../utils/cn';

interface ControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDownload: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRecording,
  isPaused,
  duration,
  onStart,
  onStop,
  onPause,
  onResume,
  onDownload,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-2xl font-mono">
        {formatDuration(duration)}
      </div>
      
      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={onStart}
            className={cn(
              "p-3 rounded-full bg-red-500 hover:bg-red-600",
              "text-white transition-colors"
            )}
          >
            <Play className="w-6 h-6" />
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={onPause}
                className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
              >
                <Pause className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={onResume}
                className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                <Play className="w-6 h-6" />
              </button>
            )}
            
            <button
              onClick={onStop}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          </>
        )}
        
        {!isRecording && (
          <button
            onClick={onDownload}
            className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            <Download className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};