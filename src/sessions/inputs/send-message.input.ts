import { Field, InputType } from "@nestjs/graphql";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";
import { IsObjectId } from "../../shared/validators/objectid.validator";

@InputType()
export class SendMessageInput {
  @Field(() => GraphQLObjectId)
  @IsObjectId({ field: "session" })
  id: Types.ObjectId;

  @Field()
  content: string;
}
