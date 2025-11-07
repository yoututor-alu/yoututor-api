import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ApolloDriver } from "@nestjs/apollo";
import { AppService } from "./app.service";
import { UserModule } from "./users/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { config } from "./config";
import { SharedModule } from "./shared/shared.module";
import { SessionModule } from "./sessions/session.module";
import { AuthenticationModule } from "./authentication/authentication.module";

const GraphQLModules = [
  UserModule,
  SharedModule,
  SessionModule,
  AuthenticationModule
];

const ServerModules = [
  MongooseModule.forRoot(config.database.uri),
  GraphQLModule.forRoot({
    cors: {
      credentials: true,
      origin: true
    },
    debug: config.isLocal,
    playground: config.isLocal,
    introspection: true,
    autoSchemaFile: true,
    driver: ApolloDriver,
    include: GraphQLModules,
    fieldResolverEnhancers: ["guards"],
    context: ({ req, res }) => ({ req, res })
  })
];

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [...ServerModules, ...GraphQLModules]
})
export class AppModule {}
