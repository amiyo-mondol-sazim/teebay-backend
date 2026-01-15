import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { CreateTestUser } from "./create-test-user";
import { RolesAndPermissionsSeeder } from "./roles-and-permissions-seeder";
import { StandardDatabaseSeeder } from "./standard-database-seeder";

export class DevDatabaseSeeder extends Seeder {
  run(em: EntityManager): Promise<void> {
    return this.call(em, [RolesAndPermissionsSeeder, CreateTestUser, StandardDatabaseSeeder]);
  }
}
