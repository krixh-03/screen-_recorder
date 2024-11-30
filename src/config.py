"""Configuration settings for the audio transcription system."""

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 1024
DTYPE = 'float32'

# Google Cloud Speech-to-Text settings
GOOGLE_API_KEY = 'AIzaSyCf37sDO6QPFCGk8YLXwa8-0Fmv3Kpfnio'
LANGUAGE_CODE = 'en-US'

# Buffer settings
BUFFER_SIZE = 30  # seconds worth of audio to buffer
MAX_CHUNKS = int((SAMPLE_RATE * BUFFER_SIZE) / CHUNK_SIZE)