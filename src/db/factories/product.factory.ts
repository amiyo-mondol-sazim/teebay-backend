import { Factory } from "@mikro-orm/seeder";

import { faker } from "@faker-js/faker";

import { Product } from "@/common/entities/products.entity";
import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";

export class ProductFactory extends Factory<Product> {
  model = Product;

  definition(): Partial<Product> {
    const categories = [
      "Electronics",
      "Furniture",
      "Books",
      "Clothing",
      "Sports",
      "Toys",
      "Tools",
      "Garden",
    ];

    return {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      categories: faker.helpers.arrayElements(categories, { min: 1, max: 3 }),
      purchasePrice: Number(faker.commerce.price({ min: 10, max: 1000 })),
      rentPrice: Number(faker.commerce.price({ min: 1, max: 100 })),
      rentalPeriod: faker.helpers.enumValue(ERentalPeriod),
      status: EProductStatus.AVAILABLE,
      viewCount: faker.number.int({ min: 0, max: 1000 }),
    };
  }
}
