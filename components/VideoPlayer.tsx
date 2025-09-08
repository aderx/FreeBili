import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VideoPlayerProps } from '@/types';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, isVisible, onClose }) => {
  const artRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initArtPlayer = async () => {
      if (!isVisible || !url || !containerRef.current) return;

      // 动态导入ArtPlayer以避免SSR问题
      const Artplayer = (await import('artplayer')).default;
      const Hls = (await import('hls.js')).default;

      const playM3u8 = (video: HTMLVideoElement, url: string, art: any) => {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy();
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          art.on('destroy', () => hls.destroy());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          art.notice.show = 'Unsupported playback format: m3u8';
        }
      };

      const options: any = {
        container: containerRef.current,
        url: url,
        title: title,
        autoplay: true,
        autoSize: false,
        setting: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
      };

      const lowerCaseUrl = url.toLowerCase();
      if (lowerCaseUrl.endsWith('.m3u8')) {
        options.type = 'm3u8';
        options.customType = { m3u8: playM3u8 };
      }

      artRef.current = new (Artplayer as any)(options);

      artRef.current.on('ready', () => {
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) closeBtn.style.display = 'none';
      });
    };

    initArtPlayer();

    return () => {
      if (artRef.current) {
        artRef.current.destroy();
        artRef.current = null;
      }
    };
  }, [isVisible, url, title]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-0 overflow-hidden">
        <div ref={containerRef} className="artplayer-app w-full aspect-video"></div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;