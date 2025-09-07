import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { EpisodeModalProps } from '@/types';

const EpisodeModal: React.FC<EpisodeModalProps> = ({ isVisible, selectedItem, onClose, onPlay }) => {
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

  if (!isVisible || !selectedItem) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedItem.name}</DialogTitle>
        </DialogHeader>
        <div className="episodes-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {selectedItem.videos && selectedItem.videos.map((video, index) => (
            <Button 
              key={index}
              onClick={() => onPlay(video.video_url, `${selectedItem.name} - ${video.name}`)}
              variant="outline"
              className="h-auto py-2 px-3 text-sm whitespace-normal text-left"
            >
              {video.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EpisodeModal;