import { Migration } from '@mikro-orm/migrations';

export class Migration20260113090231_add_sales_table_and_product_status extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "sales" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "product_id" int not null, "buyer_id" int not null, "seller_id" int not null, "price" numeric(10,2) not null);');
    this.addSql('alter table "sales" add constraint "sales_product_id_unique" unique ("product_id");');

    this.addSql('alter table "sales" add constraint "sales_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;');
    this.addSql('alter table "sales" add constraint "sales_buyer_id_foreign" foreign key ("buyer_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "sales" add constraint "sales_seller_id_foreign" foreign key ("seller_id") references "users" ("id") on update cascade;');

    this.addSql('alter table "products" add column "status" text not null default \'AVAILABLE\';');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "sales" cascade;');

    this.addSql('alter table "products" drop column "status";');
  }

}
