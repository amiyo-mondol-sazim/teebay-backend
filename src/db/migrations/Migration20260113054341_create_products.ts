import { Migration } from '@mikro-orm/migrations';

export class Migration20260113054341_create_products extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "products" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(255) not null, "description" text not null, "categories" text[] not null, "purchase_price" numeric(10,2) not null, "rent_price" numeric(10,2) not null, "rental_period" text not null, "view_count" int not null default 0, "owner_id" int not null);');

    this.addSql('alter table "products" add constraint "products_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on update cascade;');

    this.addSql('alter table "audit_logs" alter column "actor_id" type varchar(255) using ("actor_id"::varchar(255));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "products" cascade;');

    this.addSql('alter table "audit_logs" alter column "actor_id" type int4 using ("actor_id"::int4);');
  }

}
