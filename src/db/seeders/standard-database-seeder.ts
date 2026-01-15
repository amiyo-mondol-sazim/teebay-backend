import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { faker } from "@faker-js/faker";

import type { Product } from "@/common/entities/products.entity";
import { Role } from "@/common/entities/roles.entity";
import { EProductStatus } from "@/common/enums/products.enums";
import { EUserRole } from "@/common/enums/roles.enums";

import { ProductFactory } from "../factories/product.factory";
import { RentFactory } from "../factories/rent.factory";
import { SaleFactory } from "../factories/sale.factory";
import { UserFactory } from "../factories/user.factory";

export class StandardDatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const superUserRole = await em.findOneOrFail(Role, { name: EUserRole.SUPER_USER });

    const userFactory = new UserFactory(em);
    const users = userFactory.make(50);

    for (const user of users) {
      if (user.userProfile) {
        user.userProfile.role = superUserRole;
        user.userProfile.user = user;
      }
      em.persist(user);
    }
    await em.flush();

    const productFactory = new ProductFactory(em);
    const allProducts: Product[] = [];

    for (const user of users) {
      const products = await productFactory.create(20, { owner: user });
      allProducts.push(...products);
    }
    await em.flush();

    const saleFactory = new SaleFactory(em);

    const productsToSell = faker.helpers.arrayElements(allProducts, 300);

    for (const product of productsToSell) {
      const possibleBuyers = users.filter((u) => u.id !== product.owner.id);
      if (possibleBuyers.length === 0) continue;

      const buyer = faker.helpers.arrayElement(possibleBuyers);

      product.status = EProductStatus.SOLD;

      await saleFactory.create(1, {
        product: product,
        buyer: buyer,
        seller: product.owner,
        price: product.purchasePrice,
      });

      em.persist(product);
    }
    await em.flush();

    const availableProducts = allProducts.filter((p) => p.status === EProductStatus.AVAILABLE);
    const productsToRent = faker.helpers.arrayElements(availableProducts, 300);

    const rentFactory = new RentFactory(em);

    for (const product of productsToRent) {
      const possibleRenters = users.filter((u) => u.id !== product.owner.id);
      if (possibleRenters.length === 0) continue;

      const renter = faker.helpers.arrayElement(possibleRenters);

      await rentFactory.create(1, {
        product: product,
        renter: renter,
        owner: product.owner,
        rentPrice: product.rentPrice,
      });
    }
    await em.flush();
  }
}
