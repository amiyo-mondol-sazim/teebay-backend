import { ValidationPipe } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { AppModule } from "@/app.module";
import ormConfig from "@/db/db.config";
import { type IEmailService } from "@/modules/emails/email-service.interface";
import { EMAIL_SERVICE_TOKEN } from "@/modules/emails/emails.constants";

export const bootstrapTestServer = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EMAIL_SERVICE_TOKEN)
    .useValue(mockDeep<IEmailService>({ funcPropSupport: true }))
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const httpServer = app.getHttpServer();
  const orm = await MikroORM.init(ormConfig);
  const entityManager = orm.em.fork();
  await app.init();

  return {
    appInstance: app,
    httpServerInstance: httpServer,
    dbServiceInstance: entityManager,
    ormInstance: orm,
  };
};
