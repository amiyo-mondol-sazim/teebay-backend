import { Migration } from '@mikro-orm/migrations';

export class Migration20260114080155_create_sales extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "rents" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "product_id" int not null, "renter_id" int not null, "owner_id" int not null, "rent_price" numeric(10,2) not null, "start_date" timestamptz not null, "end_date" timestamptz not null);');

    this.addSql('alter table "rents" add constraint "rents_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;');
    this.addSql('alter table "rents" add constraint "rents_renter_id_foreign" foreign key ("renter_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "rents" add constraint "rents_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "rents" cascade;');
  }

}
