import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import type { ConversationsRepository } from "@/modules/conversations/conversations.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Product } from "./products.entity";
import { User } from "./users.entity";

@Entity({ tableName: "conversations" })
export class Conversation extends CustomBaseEntity {
  [EntityRepositoryType]?: ConversationsRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => User, { fieldName: "participant_1_id" })
  participant1!: User;

  @ManyToOne(() => User, { fieldName: "participant_2_id" })
  participant2!: User;

  @ManyToOne(() => Product, { fieldName: "product_id", nullable: true })
  product?: Product;

  @Property({ fieldName: "last_message_at", nullable: true })
  lastMessageAt?: Date;
}
