import type { MiddlewareConsumer } from "@nestjs/common";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { OpenTelemetryModule } from "@metinseylan/nestjs-opentelemetry";

import { AuditLoggingModule } from "./common/audit-logging/audit-logging.module";
import { AuditLoggingSubscriber } from "./common/audit-logging/audit-logging.subscriber";
import { AppLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { validate } from "./common/validators/env.validator";
import ormConfig from "./db/db.config";
import { AuthModule } from "./modules/auth/auth.module";
import { EmailsModule } from "./modules/emails/emails.module";
import { HealthModule } from "./modules/health/health.module";
import { ProductsModule } from "./modules/products/products.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SalesModule } from "./modules/sales/sales.module";
import { UserProfilesModule } from "./modules/user-profiles/user-profiles.module";
import { UsersModule } from "./modules/users/users.module";
import { VerificationRequestsModule } from "./modules/verification-requests/verification-requests.module";
import { PermissionsModule } from "./permissions/permissions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      validate,
    }),

    MikroOrmModule.forRootAsync({
      imports: [AuditLoggingModule],
      useFactory: (auditLoggingSubscriber: AuditLoggingSubscriber) => ({
        ...ormConfig,
        subscribers: [auditLoggingSubscriber],
      }),
      inject: [AuditLoggingSubscriber],
    }),

    OpenTelemetryModule.forRoot({
      serviceName: "Project Backend",
    }),

    EmailsModule,

    AuditLoggingModule,

    UsersModule,
    ProductsModule,
    SalesModule,
    AuthModule,
    RolesModule,
    UserProfilesModule,
    HealthModule,
    VerificationRequestsModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
