import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MessageRole } from "../interfaces/session.interface";
import { SubDocument } from "../../shared/models/sub-document.model";

@ObjectType()
@Schema({ timestamps: true })
export class Message extends SubDocument {
  @Field(() => MessageRole)
  @Prop({ enum: MessageRole, required: true })
  role: MessageRole;

  @Field()
  @Prop({ required: true })
  model: string;

  @Field()
  @Prop({ required: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
