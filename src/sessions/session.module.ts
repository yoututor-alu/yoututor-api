import { Module } from "@nestjs/common";
import { SessionService } from "./services/session.service";
import { SessionResolver } from "./resolvers/session.resolver";
import { SharedModule } from "../shared/shared.module";
import { MongooseModule } from "@nestjs/mongoose";
import { SessionModel } from "./models/session.model";

@Module({
  providers: [SessionResolver, SessionService],
  imports: [SharedModule, MongooseModule.forFeature([SessionModel])]
})
export class SessionModule {}
