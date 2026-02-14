import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";

import { Notification } from "@/common/entities/notifications.entity";

import { NotificationsController } from "./notifications.controller";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsSerializer } from "./notifications.serializer";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [MikroOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    {
      provide: NotificationsRepository,
      useFactory: (em: EntityManager) => new NotificationsRepository(em, Notification),
      inject: [EntityManager],
    },
    NotificationsService,
    NotificationsSerializer,
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
