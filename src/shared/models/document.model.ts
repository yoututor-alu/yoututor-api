import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLObjectId from "graphql-type-object-id/dist";
import { Document as AbstractDocument, Types } from "mongoose";

@ObjectType()
export class Document extends AbstractDocument {
  declare _id: Types.ObjectId;

  @Field(() => GraphQLObjectId)
  declare id: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
