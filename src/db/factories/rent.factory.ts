import { Factory } from "@mikro-orm/seeder";

import { faker } from "@faker-js/faker";

import { Rent } from "@/common/entities/rents.entity";

export class RentFactory extends Factory<Rent> {
  model = Rent;

  definition(): Partial<Rent> {
    const startDate = faker.date.past();
    const endDate = faker.date.future({ refDate: startDate });

    return {
      rentPrice: Number(faker.commerce.price({ min: 1, max: 100 })),
      startDate: startDate,
      endDate: endDate,
    };
  }
}
