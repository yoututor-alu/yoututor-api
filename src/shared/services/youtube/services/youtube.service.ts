import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException
} from "@nestjs/common";
import { google } from "googleapis";
import { YoutubeTranscript } from "@danielxceron/youtube-transcript";
import {
  YoutubeTranscriptItem,
  YoutubeVideoData,
  YoutubeVideoMetadata
} from "../interfaces/youtube.interface";
import { stringify } from "../../../../utilities/stringify-json";

const api = google.youtube({ version: "v3", auth: "" });

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

      const transcriptText = transcript.map(item => item.text).join(" ");

      return {
        metadata,
        transcript,
        transcriptText
      };
    } catch (error) {
      this.logger.error(
        `Could not get video data for ${videoId} - ${stringify({ error, videoId })}`
      );

      throw new InternalServerErrorException(error.message || error);
    }
  }

  private async getVideoMetadata(
    videoId: string
  ): Promise<YoutubeVideoMetadata> {
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

  private async getVideoTranscript(
    videoId: string
  ): Promise<YoutubeTranscriptItem[]> {
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

      return transcriptData.map(item => ({
        text: item.text,
        offset: item.offset,
        duration: item.duration
      }));
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
