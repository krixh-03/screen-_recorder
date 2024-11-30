import  { useState, useCallback, useEffect } from 'react';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VideoPreview } from './components/VideoPreview';
import { Controls } from './components/Controls';
import { CaptionStyler } from './components/CaptionStyler';
import { CaptionStyle } from './types';

function App() {
  const {
    recordingState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getRecordedBlob,
    videoStream,
  } = useMediaRecorder();

  const [captions, setCaptions] = useState('');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    fontSize: 24,
    position: 'bottom',
  });

  // Simulated speech recognition (replace with actual implementation)
  useEffect(() => {
    if (recordingState.isRecording && !recordingState.isPaused) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setCaptions(transcript);
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [recordingState.isRecording, recordingState.isPaused]);

  const handleDownload = useCallback(async () => {
    const blob = getRecordedBlob();
    if (!blob) {
      console.error('No recording data available');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getRecordedBlob]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Video Recorder with Real-time Captions
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <VideoPreview
            stream={videoStream}
            captions={captions}
            captionStyle={captionStyle}
          />

          <Controls
            isRecording={recordingState.isRecording}
            isPaused={recordingState.isPaused}
            duration={recordingState.duration}
            onStart={startRecording}
            onStop={stopRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onDownload={handleDownload}
          />

          {recordingState.error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {recordingState.error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CaptionStyler
            style={captionStyle}
            onChange={setCaptionStyle}
          />
        </div>
      </div>
    </div>
  );
}

export default App;