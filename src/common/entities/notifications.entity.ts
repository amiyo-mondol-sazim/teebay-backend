import {
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import type { NotificationsRepository } from "@/modules/notifications/notifications.repository";

import { ENotificationType } from "../enums/notifications.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "notifications" })
export class Notification extends CustomBaseEntity {
  [EntityRepositoryType]?: NotificationsRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => User, { fieldName: "user_id" })
  user!: User;

  @Enum(() => ENotificationType)
  type!: ENotificationType;

  @Property({ fieldName: "reference_id", nullable: true })
  referenceId?: number;

  @Property({ fieldName: "title" })
  title!: string;

  @Property({ fieldName: "body", type: "text" })
  body!: string;

  @Property({ fieldName: "read_at", nullable: true })
  readAt?: Date;
}
