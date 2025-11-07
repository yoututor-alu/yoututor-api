import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AuthResponse {
  constructor(success?: boolean, message?: string) {
    if (success !== undefined) {
      this.success = success;
    } else {
      this.success = true;
    }

    if (message) {
      this.message = message;
    }
  }

  @Field(() => Boolean)
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
