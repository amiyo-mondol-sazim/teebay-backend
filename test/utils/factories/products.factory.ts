import { Factory } from "@mikro-orm/seeder";

import { faker } from "@faker-js/faker";

import { Product } from "@/common/entities/products.entity";
import { ERentalPeriod } from "@/common/enums/products.enums";

export class ProductFactory extends Factory<Product> {
  model = Product;

  definition(): Partial<Product> {
    return {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      categories: [faker.commerce.department(), faker.commerce.department()],
      purchasePrice: Number(faker.commerce.price({ min: 100, max: 5000 })),
      rentPrice: Number(faker.commerce.price({ min: 10, max: 500 })),
      rentalPeriod: faker.helpers.arrayElement(Object.values(ERentalPeriod)),
      viewCount: faker.number.int({ min: 0, max: 1000 }),
    };
  }
}
