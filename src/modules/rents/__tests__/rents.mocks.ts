import { faker } from "@faker-js/faker";

import { Product } from "@/common/entities/products.entity";
import { Rent } from "@/common/entities/rents.entity";
import { UserProfile } from "@/common/entities/user-profiles.entity";
import { User } from "@/common/entities/users.entity";
import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";

import type { RentResponse } from "../rents.types";

export const MOCK_RENTER_ID = 1;
export const MOCK_OWNER_ID = 2;
export const MOCK_PRODUCT_ID = 1;
export const MOCK_RENT_ID = 1;

export const MOCK_RENTER = new User("renter@example.com", faker.internet.password());
MOCK_RENTER.id = MOCK_RENTER_ID;
MOCK_RENTER.createdAt = new Date("2027-01-01");
MOCK_RENTER.updatedAt = new Date("2027-01-01");

export const MOCK_RENTER_PROFILE = new UserProfile("John", "Renter");
MOCK_RENTER_PROFILE.id = 1;
MOCK_RENTER_PROFILE.createdAt = new Date("2027-01-01");
MOCK_RENTER_PROFILE.updatedAt = new Date("2027-01-01");
MOCK_RENTER.userProfile = MOCK_RENTER_PROFILE;

export const MOCK_OWNER = new User("owner@example.com", faker.internet.password());
MOCK_OWNER.id = MOCK_OWNER_ID;
MOCK_OWNER.createdAt = new Date("2027-01-01");
MOCK_OWNER.updatedAt = new Date("2027-01-01");

export const MOCK_OWNER_PROFILE = new UserProfile("Jane", "Owner");
MOCK_OWNER_PROFILE.id = 2;
MOCK_OWNER_PROFILE.createdAt = new Date("2027-01-01");
MOCK_OWNER_PROFILE.updatedAt = new Date("2027-01-01");
MOCK_OWNER.userProfile = MOCK_OWNER_PROFILE;

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
MOCK_PRODUCT.owner = MOCK_OWNER;
MOCK_PRODUCT.createdAt = new Date("2027-01-01");
MOCK_PRODUCT.updatedAt = new Date("2027-01-01");

export const MOCK_RENT = new Rent();
MOCK_RENT.id = MOCK_RENT_ID;
MOCK_RENT.product = MOCK_PRODUCT;
MOCK_RENT.renter = MOCK_RENTER;
MOCK_RENT.owner = MOCK_OWNER;
MOCK_RENT.rentPrice = MOCK_PRODUCT.rentPrice;
MOCK_RENT.startDate = new Date("2027-02-01");
MOCK_RENT.endDate = new Date("2027-02-07");
MOCK_RENT.createdAt = new Date("2027-02-01");
MOCK_RENT.updatedAt = new Date("2027-02-01");

export const MOCK_RENT_LIST = [MOCK_RENT];
export const MOCK_TOTAL_COUNT = 1;

export const MOCK_RENT_RESPONSE: RentResponse = {
  id: MOCK_RENT.id,
  rentPrice: MOCK_RENT.rentPrice,
  startDate: MOCK_RENT.startDate,
  endDate: MOCK_RENT.endDate,
  createdAt: MOCK_RENT.createdAt,
  updatedAt: MOCK_RENT.updatedAt,
  product: MOCK_PRODUCT,
  renter: MOCK_RENTER,
  owner: MOCK_OWNER,
};
