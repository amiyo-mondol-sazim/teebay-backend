import { Module } from "@nestjs/common";

import { NotificationsController } from "./notifications.controller";
import { NotificationsRepository } from "./notifications.repository";
import { NotificationsSerializer } from "./notifications.serializer";
import { NotificationsService } from "./notifications.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsRepository, NotificationsService, NotificationsSerializer],
  exports: [NotificationsService],
})
export class NotificationsModule {}
