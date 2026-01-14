import { faker } from "@faker-js/faker";

import { Product } from "@/common/entities/products.entity";
import { Sale } from "@/common/entities/sales.entity";
import { UserProfile } from "@/common/entities/user-profiles.entity";
import { User } from "@/common/entities/users.entity";
import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";

import type { SaleResponse } from "../sales.types";

export const MOCK_BUYER_ID = 1;
export const MOCK_SELLER_ID = 2;
export const MOCK_PRODUCT_ID = 1;
export const MOCK_SALE_ID = 1;

export const MOCK_BUYER = new User("buyer@example.com", faker.internet.password());
MOCK_BUYER.id = MOCK_BUYER_ID;
MOCK_BUYER.createdAt = new Date("2024-01-01");
MOCK_BUYER.updatedAt = new Date("2024-01-01");

export const MOCK_BUYER_PROFILE = new UserProfile("John", "Buyer");
MOCK_BUYER_PROFILE.id = 1;
MOCK_BUYER_PROFILE.createdAt = new Date("2024-01-01");
MOCK_BUYER_PROFILE.updatedAt = new Date("2024-01-01");
MOCK_BUYER.userProfile = MOCK_BUYER_PROFILE;

export const MOCK_SELLER = new User("seller@example.com", faker.internet.password());
MOCK_SELLER.id = MOCK_SELLER_ID;
MOCK_SELLER.createdAt = new Date("2024-01-01");
MOCK_SELLER.updatedAt = new Date("2024-01-01");

export const MOCK_SELLER_PROFILE = new UserProfile("Jane", "Seller");
MOCK_SELLER_PROFILE.id = 2;
MOCK_SELLER_PROFILE.createdAt = new Date("2024-01-01");
MOCK_SELLER_PROFILE.updatedAt = new Date("2024-01-01");
MOCK_SELLER.userProfile = MOCK_SELLER_PROFILE;

export const MOCK_PRODUCT = new Product();
MOCK_PRODUCT.id = MOCK_PRODUCT_ID;
MOCK_PRODUCT.title = "Test Product";
MOCK_PRODUCT.description = "Test product description";
MOCK_PRODUCT.categories = ["Electronics", "Gadgets"];
MOCK_PRODUCT.purchasePrice = 100;
MOCK_PRODUCT.rentPrice = 10;
MOCK_PRODUCT.rentalPeriod = ERentalPeriod.DAY;
MOCK_PRODUCT.status = EProductStatus.AVAILABLE;
MOCK_PRODUCT.viewCount = 0;
MOCK_PRODUCT.owner = MOCK_SELLER;
MOCK_PRODUCT.createdAt = new Date("2024-01-01");
MOCK_PRODUCT.updatedAt = new Date("2024-01-01");

export const MOCK_SALE = new Sale();
MOCK_SALE.id = MOCK_SALE_ID;
MOCK_SALE.product = MOCK_PRODUCT;
MOCK_SALE.buyer = MOCK_BUYER;
MOCK_SALE.seller = MOCK_SELLER;
MOCK_SALE.price = MOCK_PRODUCT.purchasePrice;
MOCK_SALE.createdAt = new Date("2024-01-02");
MOCK_SALE.updatedAt = new Date("2024-01-02");

export const MOCK_SALE_LIST = [MOCK_SALE];
export const MOCK_TOTAL_COUNT = 1;

export const MOCK_SALE_RESPONSE: SaleResponse = {
  id: MOCK_SALE.id,
  price: MOCK_SALE.price,
  createdAt: MOCK_SALE.createdAt,
  updatedAt: MOCK_SALE.updatedAt,
  product: MOCK_PRODUCT,
  buyer: MOCK_BUYER,
  seller: MOCK_SELLER,
};
