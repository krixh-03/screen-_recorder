"""Main script for real-time audio transcription."""
import asyncio
import signal
import sys
from typing import Optional
from .audio_capture import AudioCapture
from .transcriber import Transcriber

class TranscriptionSystem:
    def __init__(self):
        self.audio_capture = AudioCapture()
        self.transcriber: Optional[Transcriber] = None
        self.running = False

    def handle_transcription(self, text: str) -> None:
        """Handle received transcription."""
        print(f"\rTranscription: {text}", end='', flush=True)

    async def run(self) -> None:
        """Run the transcription system."""
        try:
            # Initialize transcriber
            self.transcriber = Transcriber(self.handle_transcription)
            self.audio_capture.start()
            self.running = True

            # Main processing loop
            while self.running:
                chunk = self.audio_capture.get_audio_chunk()
                if chunk is not None:
                    await self.transcriber.process_audio(chunk.tobytes())
                await asyncio.sleep(0.01)

        except Exception as e:
            print(f"\nError: {e}")
        finally:
            await self.cleanup()

    async def cleanup(self) -> None:
        """Clean up resources."""
        self.running = False
        self.audio_capture.stop()
        if self.transcriber:
            await self.transcriber.close()

def main():
    """Entry point for the application."""
    system = TranscriptionSystem()

    # Set up signal handlers
    def signal_handler(sig, frame):
        print("\nShutting down...")
        system.running = False

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Run the system
    try:
        asyncio.run(system.run())
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"\nFatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()