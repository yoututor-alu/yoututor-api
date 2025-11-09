export interface YoutubeVideoMetadata {
  title: string;
  tags?: string[];
  description: string;
  channelTitle: string;
  publishedAt: string;
  videoId: string;
  thumbnail?: string;
  duration?: string;
}

export interface YoutubeVideoData {
  metadata: YoutubeVideoMetadata;
  transcript: string;
}
