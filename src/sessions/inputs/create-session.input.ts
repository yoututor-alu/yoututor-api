import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { Types } from "mongoose";

@InputType()
export class CreateSessionInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field()
  video: string;

  user: Types.ObjectId;
}
