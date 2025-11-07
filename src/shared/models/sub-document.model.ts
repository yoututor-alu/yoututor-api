import { Field } from "@nestjs/graphql";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";

export class SubDocument {
  declare private _id?: Types.ObjectId;

  @Field(() => GraphQLObjectId)
  declare id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
