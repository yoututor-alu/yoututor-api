import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Document } from "../..//shared/models/document.model";
import { User } from "../..//users/models/user.model";
import { Message, MessageSchema } from "./message.model";

@ObjectType()
@Schema({ timestamps: true })
export class Session extends Document {
  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Field({ nullable: true })
  @Prop({ type: String, required: false })
  name?: string;

  @Field()
  @Prop({ type: String, required: true })
  video: string;

  @Field({ nullable: true })
  @Prop({ type: String, required: false })
  transcript?: string;

  @Field(() => [Message])
  @Prop({ type: [{ type: MessageSchema }], required: true, default: [] })
  messages: Message[];

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true, default: false })
  isDeleted: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// //Checking for unique keys when you have multiple indexes
// SessionSchema.post("save", function (error, doc, next) {
//   if (error?.name === "MongoServerError" && (error as any)?.code === 11000) {
//     return next(new ConflictException("You have had a chat with this"));
//   }

//   next();
// } as ErrorHandlingMiddlewareFunction<Session>);

export const SessionModel: ModelDefinition = {
  name: Session.name,
  schema: SessionSchema
};

export type SessionRepository = Model<Session>;
