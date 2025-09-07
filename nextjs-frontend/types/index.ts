export interface Video {
  name: string;
  video_url: string;
}

export interface SearchResult {
  name: string;
  vod_pic: string;
  videos: Video[];
  source_name?: string;
  resolution?: string;
}

export interface SiteConfig {
  site_name: string;
  pc_background_image_url: string;
  phone_background_image_url: string;
}

export interface HomeProps {
  siteConfig: SiteConfig;
}

export interface SearchFormProps {
  onSearch: (keyword: string) => void;
}

export interface ResultCardProps {
  item: SearchResult;
  onClick: (item: SearchResult) => void;
}

export interface EpisodeModalProps {
  isVisible: boolean;
  selectedItem: SearchResult | null;
  onClose: () => void;
  onPlay: (url: string, title: string) => void;
}

export interface VideoPlayerProps {
  url: string;
  title: string;
  isVisible: boolean;
  onClose: () => void;
}