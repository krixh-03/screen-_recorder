export interface CaptionStyle {
  fontSize: number;
  position: 'top' | 'bottom';
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
}

export interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}