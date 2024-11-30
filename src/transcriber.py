"""Real-time transcription using Google Cloud Speech-to-Text."""
from google.cloud import speech_v1
from google.cloud.speech_v1 import SpeechClient
from google.api_core import client_options
from concurrent.futures import ThreadPoolExecutor
import json
from typing import Optional, Callable
from .config import GOOGLE_API_KEY, SAMPLE_RATE, LANGUAGE_CODE

class Transcriber:
    def __init__(self, on_transcription: Callable[[str], None]):
        self.on_transcription = on_transcription
        self.client = None
        self.streaming_config = None
        self.executor = ThreadPoolExecutor(max_workers=1)
        self._setup_client()

    def _setup_client(self) -> None:
        """Initialize Google Cloud Speech client."""
        try:
            # Configure client with API key
            options = client_options.ClientOptions(
                api_key=GOOGLE_API_KEY
            )
            self.client = speech_v1.SpeechClient(client_options=options)
            
            # Configure streaming recognition
            config = speech_v1.RecognitionConfig(
                encoding=speech_v1.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=SAMPLE_RATE,
                language_code=LANGUAGE_CODE,
                enable_automatic_punctuation=True,
            )
            
            self.streaming_config = speech_v1.StreamingRecognitionConfig(
                config=config,
                interim_results=True
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Google Cloud Speech: {e}")

    async def process_audio(self, audio_data: bytes) -> None:
        """Process audio data and get transcription."""
        if not self.client:
            return

        try:
            # Create streaming request
            requests = [
                speech_v1.StreamingRecognizeRequest(
                    audio_content=audio_data
                )
            ]

            responses = self.client.streaming_recognize(
                config=self.streaming_config,
                requests=requests
            )

            # Process streaming responses
            for response in responses:
                if not response.results:
                    continue

                result = response.results[0]
                if result.is_final:
                    transcript = result.alternatives[0].transcript
                    if transcript.strip():
                        self.on_transcription(transcript)

        except Exception as e:
            print(f"Error processing audio: {e}")

    async def close(self) -> None:
        """Clean up resources."""
        if self.executor:
            self.executor.shutdown(wait=False)
        if self.client:
            await self.client.close()