import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Session, SessionRepository } from "../models/session.model";
import { CreateSessionInput } from "../inputs/create-session.input";
import { User } from "../../users/models/user.model";
import { inTransaction } from "../../utilities/transaction";
import { Connection, Types } from "mongoose";
import { YoutubeService } from "../../shared/services/youtube/services/youtube.service";
import { SendMessageInput } from "../inputs/send-message.input";
import { MessageRole } from "../interfaces/session.interface";
import { GeminiService } from "../../shared/services/ai/services/gemini.service";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import { PaginationService } from "../../shared/services/pagination/services/pagination.service";

@Injectable()
export class SessionService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly youtubeService: YoutubeService,
    private readonly paginationService: PaginationService,
    @InjectModel(Session.name)
    private readonly sessionRepository: SessionRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  async createSession(input: CreateSessionInput, user: User) {
    return await inTransaction(this.connection, async txSession => {
      try {
        input.user = user._id;

        const [session] = await this.sessionRepository.create([input], {
          session: txSession,
          validateBeforeSave: false
        });

        const metadata = await this.youtubeService.getVideoMetadata(
          session.video
        );

        const existingSessions = await this.sessionRepository.find({
          video: input.video
        });

        if (existingSessions.length) {
          session.transcript = existingSessions[0].transcript;

          if (!session.name) {
            session.name = `(${existingSessions.length + 1}) ${existingSessions[0].name || "Untitled"}`;
          }
        } else {
          session.transcript = await this.youtubeService.getVideoTranscript(
            session.video
          );

          if (!session.name) {
            session.name = metadata.title;
          }
        }

        await session.save({ session: txSession });

        await txSession.commitTransaction();

        session.channel = metadata.channelTitle;

        session.publishedAt = metadata.publishedAt;

        session.summary = metadata.description;

        return session;
      } catch (error) {
        await txSession.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
  }

  async sendMessage(input: SendMessageInput, user: User) {
    return await inTransaction(this.connection, async txSession => {
      try {
        const session = await this.sessionRepository.findOne({
          _id: input.id,
          user: user._id,
          isDeleted: false
        });

        if (!session) {
          throw new BadRequestException(
            "This Session either does not exist or has been deleted"
          );
        }

        if (session.messages.length % 2 === 1) {
          throw new BadRequestException(
            "YouTutor has not responded to you yet"
          );
        }

        session.messages.push({
          model: "user",
          content: input.content,
          role: MessageRole.User
        });

        const content = await this.generateResponse(session, user);

        session.messages.push({
          content,
          role: MessageRole.Agent,
          model: this.geminiService.model
        });

        await session.save({ session: txSession });

        await txSession.commitTransaction();

        return session;
      } catch (error) {
        await txSession.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
  }

  async generateResponse(session: Session, user: User) {
    try {
      const transcript = session.transcript || "";

      const conversationHistory = session.messages
        .map(message => {
          return `${message.role === MessageRole.User ? "User" : "YouTutor"}: ${message.content}`;
        })
        .join("\n");

      const prompt = `You are YouTutor, an AI tutor that helps users understand YouTube videos. You can only answer questions based on the video transcript provided below.

${user.bio ? `User Bio:\n${user.bio}\n` : ""}

Video Transcript:
${transcript}

${conversationHistory ? `Conversation History:\n${conversationHistory}\n` : ""}

Instructions:
1. Answer questions based solely on the information in the video transcript above. Do not use any external knowledge.
2. If a question is asked that cannot be answered using the transcript, you must clearly state: "This question is not covered in the video transcript. I can only answer questions based on the content of this video."
3. Be helpful, clear, and educational in your responses
4. When referencing specific parts of the transcript, you MUST use timestamps in one of these formats only: Single timestamps: [HH:MM:SS] or [MM:SS] AND Ranges: [HH:MM:SS-HH:MM:SS] or [MM:SS-MM:SS]
5. Respond to the most recent user message in the conversation history above
${user.systemPrompt ? "6. Follow the user's system prompt instructions above when crafting your response" : ""}

Your response:`;

      return await this.geminiService.generate(prompt);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSession(id: Types.ObjectId, user: User) {
    try {
      const session = await this.sessionRepository.findOne({
        _id: id,
        user: user._id,
        isDeleted: false
      });

      if (!session) {
        throw new NotFoundException();
      }

      const metadata = await this.youtubeService.getVideoMetadata(
        session.video
      );

      session.channel = metadata.channelTitle;

      session.publishedAt = metadata.publishedAt;

      session.summary = metadata.description;

      return session;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getSessions(filter: FilterInput, user: User) {
    try {
      const sessions = await this.paginationService.paginate(
        this.sessionRepository,
        {
          filter,
          user: user._id,
          isDeleted: false
        }
      );

      sessions.list = await Promise.all(
        sessions.list.map(async session => {
          const metadata = await this.youtubeService.getVideoMetadata(
            session.video
          );

          session.channel = metadata.channelTitle;

          session.publishedAt = metadata.publishedAt;

          session.summary = metadata.description;

          return session;
        })
      );

      return sessions;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
