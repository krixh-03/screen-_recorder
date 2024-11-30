import { useState, useRef, useCallback } from 'react';
import { RecordingState } from '../types';

export const useMediaRecorder = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];

      const videoStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Get the canvas element to record
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // Create a composite stream from canvas and audio
      const canvasStream = canvas.captureStream(30); // 30 FPS
      const audioTrack = videoStream.getAudioTracks()[0];
      const compositeStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        audioTrack
      ]);

      streamRef.current = videoStream; // Keep original stream for preview
      
      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000,
      };

      mediaRecorder.current = new MediaRecorder(compositeStream, options);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.current.start(200);
      
      timerRef.current = window.setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        error: null,
      });
    } catch (error) {
      console.error('Recording error:', error);
      setRecordingState((prev) => ({
        ...prev,
        error: 'Failed to access camera/microphone. Please ensure permissions are granted.',
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && streamRef.current) {
      return new Promise<void>((resolve) => {
        mediaRecorder.current!.onstop = () => {
          // Stop all tracks from both streams
          streamRef.current!.getTracks().forEach(track => track.stop());
          if (mediaRecorder.current!.stream) {
            mediaRecorder.current!.stream.getTracks().forEach(track => track.stop());
          }
          clearInterval(timerRef.current);
          setRecordingState({
            isRecording: false,
            isPaused: false,
            duration: 0,
            error: null,
          });
          resolve();
        };
        mediaRecorder.current!.stop();
      });
    }
    return Promise.resolve();
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      clearInterval(timerRef.current);
      setRecordingState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      timerRef.current = window.setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
      setRecordingState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const getRecordedBlob = useCallback(() => {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { 
      type: 'video/webm' 
    });
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecordedBlob,
    videoStream: streamRef.current,
  };
};