import { Migration } from "@mikro-orm/migrations";

export class Migration20260211000000_add_rental_expiry_cron_job extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create or replace function mark_expired_rentals_as_available()
      returns void as $$
      begin
        update products
        set status = 'AVAILABLE'
        where id in (
          select r.product_id
          from rents r
          where r.end_date < CURRENT_DATE
            and r.deleted_at IS NULL
        )
        and status = 'RENTED';
      end;
      $$ language plpgsql;
    `);
  }

  async down(): Promise<void> {
    this.addSql('drop function if exists mark_expired_rentals_as_available();');
  }
}
