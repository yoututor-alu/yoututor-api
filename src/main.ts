import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "./config";
import { json, urlencoded } from "express";

const origins = {
  production: ["https://alu-yoututor.web.app"],
  development: ["http://localhost:5173", "https://alu-yoututor.web.app"]
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: "50mb" }));

  app.use(urlencoded({ extended: false, limit: "50mb" }));

  app.enableCors({
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: origins[config.environment.state]
  });

  return await app.listen(config.port);
}

bootstrap();
