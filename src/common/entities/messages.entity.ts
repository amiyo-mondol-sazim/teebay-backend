import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import type { MessagesRepository } from "@/modules/messages/messages.repository";

import { Conversation } from "./conversations.entity";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({ tableName: "messages" })
export class Message extends CustomBaseEntity {
  [EntityRepositoryType]?: MessagesRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => Conversation, { fieldName: "conversation_id" })
  conversation!: Conversation;

  @ManyToOne(() => User, { fieldName: "sender_id" })
  sender!: User;

  @Property({ fieldName: "content", type: "text" })
  content!: string;

  @Property({ fieldName: "read_at", nullable: true })
  readAt?: Date;
}
