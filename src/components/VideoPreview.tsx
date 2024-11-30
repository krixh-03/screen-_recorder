import React, { useRef, useEffect } from 'react';

interface VideoPreviewProps {
  stream: MediaStream | null;
  captions: string;
  captionStyle: {
    fontSize: number;
    position: 'top' | 'bottom';
  };
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  stream,
  captions,
  captionStyle,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    return lines.slice(0, 2); // Limit to 2 lines
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      const width = video.videoWidth || canvas.clientWidth;
      const height = video.videoHeight || canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, width, height);
      }

      if (captions) {
        ctx.font = `${captionStyle.fontSize}px Arial`;
        ctx.textAlign = 'center';

        const maxWidth = width * 0.8;
        const lines = wrapText(ctx, captions, maxWidth);
        const lineHeight = captionStyle.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;

        let y =
          captionStyle.position === 'top'
            ? captionStyle.fontSize + 10
            : height - totalHeight - 10;

        lines.forEach((line) => {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 4;
          ctx.strokeText(line, width / 2, y);

          ctx.fillStyle = 'white';
          ctx.fillText(line, width / 2, y);

          y += lineHeight;
        });
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stream, captions, captionStyle]);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full"
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
