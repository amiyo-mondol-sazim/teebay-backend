import { Migration } from '@mikro-orm/migrations';

export class Migration20260125065920_add_image_url_to_products extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "products" add column "image_url" text;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "products" drop column "image_url";');
  }

}
