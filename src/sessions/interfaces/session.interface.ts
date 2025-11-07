import { registerEnumType } from "@nestjs/graphql";

export enum MessageRole {
  User = "User",
  Agent = "Agent"
}

registerEnumType(MessageRole, {
  name: "MessageRole",
  description: "Message Roles"
});
