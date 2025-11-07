export interface YoutubeVideoMetadata {
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  videoId: string;
  thumbnail?: string;
  duration?: string;
}

export interface YoutubeTranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export interface YoutubeVideoData {
  metadata: YoutubeVideoMetadata;
  transcript: YoutubeTranscriptItem[];
  transcriptText: string;
}
