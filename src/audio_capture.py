"""Audio capture module using sounddevice."""
import queue
import sounddevice as sd
import numpy as np
from typing import Optional
from .config import SAMPLE_RATE, CHANNELS, CHUNK_SIZE, DTYPE

class AudioCapture:
    def __init__(self):
        self.stream: Optional[sd.InputStream] = None
        self.audio_queue = queue.Queue()
        self.is_running = False

    def callback(self, indata: np.ndarray, frames: int, 
                time_info: dict, status: sd.CallbackFlags) -> None:
        """Callback function for the audio stream."""
        if status:
            print(f'Audio callback status: {status}')
        self.audio_queue.put(indata.copy())

    def start(self) -> None:
        """Start audio capture."""
        try:
            self.stream = sd.InputStream(
                samplerate=SAMPLE_RATE,
                channels=CHANNELS,
                dtype=DTYPE,
                blocksize=CHUNK_SIZE,
                callback=self.callback
            )
            self.stream.start()
            self.is_running = True
        except sd.PortAudioError as e:
            raise RuntimeError(f"Failed to start audio capture: {e}")

    def stop(self) -> None:
        """Stop audio capture."""
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.is_running = False
            self.stream = None

    def get_audio_chunk(self) -> Optional[np.ndarray]:
        """Get the next audio chunk from the queue."""
        try:
            return self.audio_queue.get_nowait()
        except queue.Empty:
            return None