import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SessionService } from "../services/session.service";
import { Session } from "../models/session.model";
import { UseGuards } from "@nestjs/common";
import { Guard } from "../../authentication/guards/authentication.guard";
import { CreateSessionInput } from "../inputs/create-session.input";
import { CurrentUser } from "../../authentication/decorators/current-user.decorator";
import { User } from "../../users/models/user.model";
import { SendMessageInput } from "../inputs/send-message.input";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";
import { SessionsResponse } from "../responses/sessions.response";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";

@UseGuards(Guard)
@Resolver()
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => Session)
  async createSession(
    @CurrentUser() user: User,
    @Args({ name: "input", type: () => CreateSessionInput, nullable: false })
    input: CreateSessionInput
  ) {
    return await this.sessionService.createSession(input, user);
  }

  @Mutation(() => Session)
  async sendMessage(
    @CurrentUser() user: User,
    @Args({ name: "input", type: () => SendMessageInput, nullable: false })
    input: SendMessageInput
  ) {
    return await this.sessionService.sendMessage(input, user);
  }

  @Query(() => Session)
  async getSession(
    @CurrentUser() user: User,
    @Args({ name: "id", type: () => GraphQLObjectId, nullable: false })
    id: Types.ObjectId
  ) {
    return await this.sessionService.getSession(id, user);
  }

  @Query(() => SessionsResponse)
  async getSessions(
    @CurrentUser() user: User,
    @Args({ name: "filter", type: () => FilterInput, nullable: false })
    filter: FilterInput
  ) {
    return await this.sessionService.getSessions(filter, user);
  }
}
