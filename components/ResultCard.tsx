import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ResultCardProps } from '@/types';

const ResultCard: React.FC<ResultCardProps> = ({ item, onClick }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  };

  return (
    <Card className="result-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onClick(item)}>
      <CardContent className="p-0">
        <div className="poster-wrapper relative">
          <img 
            src={item.vod_pic} 
            alt={item.name} 
            onError={handleImageError}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <div className="episode-count absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {item.videos && item.videos.length > 0 ? `${item.videos.length} 集` : '0 集'}
          </div>
        </div>
        <div className="card-details p-3">
          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          <p className="card-source text-xs text-gray-500 mt-1">{item.source_name} {item.resolution}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;