import { Logger, Module } from "@nestjs/common";
import { EncryptionService } from "./services/encryption/services/encryption.service";
import { JwtModule } from "@nestjs/jwt";
import { config } from "../config/index";
import { PaginationService } from "./services/pagination/services/pagination.service";
import { YoutubeService } from "./services/youtube/services/youtube.service";
import { GeminiService } from "./services/ai/services/gemini.service";

@Module({
  exports: [
    GeminiService,
    YoutubeService,
    EncryptionService,
    PaginationService
  ],
  providers: [
    Logger,
    GeminiService,
    YoutubeService,
    EncryptionService,
    PaginationService
  ],
  imports: [JwtModule.register({ secret: config.tokenization.secret })]
})
export class SharedModule {}
