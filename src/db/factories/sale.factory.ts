import { Factory } from "@mikro-orm/seeder";

import { faker } from "@faker-js/faker";

import { Sale } from "@/common/entities/sales.entity";

export class SaleFactory extends Factory<Sale> {
  model = Sale;

  definition(): Partial<Sale> {
    return {
      price: Number(faker.commerce.price({ min: 10, max: 1000 })),
    };
  }
}
