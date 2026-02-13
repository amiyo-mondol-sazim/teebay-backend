import { Migration } from '@mikro-orm/migrations';

export class Migration20260213165943_add_conversations_messages_notifications extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "notifications" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" int not null, "type" text check ("type" in (\'MESSAGE\', \'RENT_REQUEST\', \'SALE_REQUEST\')) not null, "reference_id" int null, "title" varchar(255) not null, "body" text not null, "read_at" timestamptz null);');

    this.addSql('create table "conversations" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "participant_1_id" int not null, "participant_2_id" int not null, "product_id" int null, "last_message_at" timestamptz null);');

    this.addSql('create table "messages" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "conversation_id" int not null, "sender_id" int not null, "content" text not null, "read_at" timestamptz null);');

    this.addSql('alter table "notifications" add constraint "notifications_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;');

    this.addSql('alter table "conversations" add constraint "conversations_participant_1_id_foreign" foreign key ("participant_1_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "conversations" add constraint "conversations_participant_2_id_foreign" foreign key ("participant_2_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "conversations" add constraint "conversations_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade on delete set null;');

    this.addSql('alter table "messages" add constraint "messages_conversation_id_foreign" foreign key ("conversation_id") references "conversations" ("id") on update cascade;');
    this.addSql('alter table "messages" add constraint "messages_sender_id_foreign" foreign key ("sender_id") references "users" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop constraint "messages_conversation_id_foreign";');

    this.addSql('drop table if exists "notifications" cascade;');

    this.addSql('drop table if exists "conversations" cascade;');

    this.addSql('drop table if exists "messages" cascade;');
  }

}
