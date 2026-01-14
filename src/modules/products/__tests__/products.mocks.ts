import { faker } from "@faker-js/faker";

import { Product } from "@/common/entities/products.entity";
import { User } from "@/common/entities/users.entity";
import { ERentalPeriod } from "@/common/enums/products.enums";

export const MOCK_PRODUCT_ID = 1;
export const MOCK_OWNER_ID = 1;

export const MOCK_OWNER = new User("owner@example.com", faker.internet.password());
MOCK_OWNER.id = MOCK_OWNER_ID;

export const MOCK_PRODUCT = new Product();
MOCK_PRODUCT.id = MOCK_PRODUCT_ID;
MOCK_PRODUCT.title = "Test Product";
MOCK_PRODUCT.description = "Test product description";
MOCK_PRODUCT.categories = ["Electronics", "Gadgets"];
MOCK_PRODUCT.purchasePrice = 100;
MOCK_PRODUCT.rentPrice = 10;
MOCK_PRODUCT.rentalPeriod = ERentalPeriod.DAY;
MOCK_PRODUCT.viewCount = 0;
MOCK_PRODUCT.owner = MOCK_OWNER;
MOCK_PRODUCT.createdAt = new Date("2024-01-01");
MOCK_PRODUCT.updatedAt = new Date("2024-01-01");

export const MOCK_PRODUCT_LIST = [MOCK_PRODUCT];
export const MOCK_TOTAL_COUNT = 1;
