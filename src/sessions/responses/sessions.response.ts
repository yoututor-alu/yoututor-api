import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "../../shared/services/pagination/responses/pagination.response";
import { Session } from "../models/session.model";

@ObjectType()
export class SessionsResponse extends PaginationResponse<Session> {
  @Field(() => [Session])
  declare list: Session[];
}
