import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException
} from "@nestjs/common";
import { google } from "googleapis";
import {
  YoutubeVideoData,
  YoutubeVideoMetadata
} from "../interfaces/youtube.interface";
import { stringify } from "../../../../utilities/stringify-json";
import { config } from "../../../../config";
import { Supadata } from "@supadata/js";

const api = google.youtube({ version: "v3", auth: config.google.apiKey });

const supadata = new Supadata({
  apiKey: config.supadata.apiKey || ""
});

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor() {}

  async getVideoData(videoId: string): Promise<YoutubeVideoData> {
    try {
      if (!videoId) {
        throw new BadRequestException("Video ID is required");
      }

      const [metadata, transcript] = await Promise.all([
        this.getVideoMetadata(videoId),
        this.getVideoTranscript(videoId)
      ]);

      return {
        metadata,
        transcript
      };
    } catch (error) {
      this.logger.error(
        `Could not get video data for ${videoId} - ${stringify({ error, videoId })}`
      );

      throw new InternalServerErrorException(error.message || error);
    }
  }

  async getVideoMetadata(videoId: string): Promise<YoutubeVideoMetadata> {
    try {
      const response = await api.videos.list({
        id: [videoId],
        part: ["snippet", "contentDetails", "statistics"]
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new BadRequestException(`Video with ID (${videoId}) not found`);
      }

      const video = response.data.items[0];

      const snippet = video.snippet;

      const contentDetails = video.contentDetails;

      return {
        videoId: videoId,
        tags: snippet?.tags || [],
        title: snippet?.title || "",
        description: snippet?.description || "",
        publishedAt: snippet?.publishedAt || "",
        channelTitle: snippet?.channelTitle || "",
        thumbnail:
          snippet?.thumbnails?.maxres?.url ||
          snippet?.thumbnails?.high?.url ||
          snippet?.thumbnails?.default?.url ||
          "",
        duration: contentDetails?.duration || ""
      };
    } catch (error) {
      this.logger.error(
        `Could not get video metadata for ${videoId} - ${stringify({ error, videoId })}`
      );

      throw new InternalServerErrorException(error.message || error);
    }
  }

  private formatTimestamp(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `[${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}]`;
    }
    return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}]`;
  }

  async getVideoTranscript(videoId: string): Promise<string> {
    try {
      // Get transcript from any supported platform (YouTube, TikTok, Instagram, X (Twitter)) or file
      const transcriptResult = await supadata.transcript({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        lang: "en", // optional
        text: false,
        mode: "auto" // optional: 'native', 'auto', or 'generate'
      });

      const content = (transcriptResult as any)?.content;

      if (!content || !Array.isArray(content)) {
        throw new InternalServerErrorException("Invalid transcript format");
      }

      // Format each chunk with timestamp
      const formattedChunks = content.map((chunk: any) => {
        const timestamp = this.formatTimestamp(chunk.offset || 0);
        return `${timestamp} ${chunk.text || ""}`;
      });

      return formattedChunks.join(" ");
    } catch (error) {
      this.logger.error(
        `Error fetching video transcript for ${videoId}:`,
        error
      );
      throw new InternalServerErrorException(
        `Failed to fetch video transcript: ${error.message || error}. Note: Not all videos have transcripts available.`
      );
    }
  }
}
