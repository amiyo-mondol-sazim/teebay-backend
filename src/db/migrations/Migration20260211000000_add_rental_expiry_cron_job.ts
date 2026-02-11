import { Migration } from "@mikro-orm/migrations";

export class Migration20260211000000_add_rental_expiry_cron_job extends Migration {
  async up(): Promise<void> {
    // Enable pg_cron extension
    this.addSql('create extension if not exists pg_cron;');

    // Create function to mark expired rentals as available
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

    // Schedule the cron job to run daily at midnight
    this.addSql(`
      select cron.schedule(
        'mark-expired-rentals-available',
        '0 0 * * *',
        $$select mark_expired_rentals_as_available()$$
      );
    `);
  }

  async down(): Promise<void> {
    // Unschedule the cron job
    this.addSql("select cron.unschedule('mark-expired-rentals-available');");

    // Drop the function
    this.addSql('drop function if exists mark_expired_rentals_as_available();');
  }
}
