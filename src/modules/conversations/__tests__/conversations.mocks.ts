import { faker } from "@faker-js/faker";

import { Conversation } from "@/common/entities/conversations.entity";
import { Product } from "@/common/entities/products.entity";
import { User } from "@/common/entities/users.entity";
import { EProductStatus, ERentalPeriod } from "@/common/enums/products.enums";

export const MOCK_CONVERSATION_ID = 1;
export const MOCK_PARTICIPANT_1_ID = 1;
export const MOCK_PARTICIPANT_2_ID = 2;
export const MOCK_PRODUCT_ID = 1;

export const MOCK_PARTICIPANT_1 = new User("participant1@example.com", faker.internet.password());
MOCK_PARTICIPANT_1.id = MOCK_PARTICIPANT_1_ID;

export const MOCK_PARTICIPANT_2 = new User("participant2@example.com", faker.internet.password());
MOCK_PARTICIPANT_2.id = MOCK_PARTICIPANT_2_ID;

export const MOCK_PRODUCT = new Product();
MOCK_PRODUCT.id = MOCK_PRODUCT_ID;
MOCK_PRODUCT.title = "Test Product";
MOCK_PRODUCT.description = "Test product description";
MOCK_PRODUCT.categories = ["Electronics", "Gadgets"];
MOCK_PRODUCT.purchasePrice = 100;
MOCK_PRODUCT.rentPrice = 10;
MOCK_PRODUCT.rentalPeriod = ERentalPeriod.DAY;
MOCK_PRODUCT.viewCount = 0;
MOCK_PRODUCT.status = EProductStatus.AVAILABLE;
MOCK_PRODUCT.owner = MOCK_PARTICIPANT_1;
MOCK_PRODUCT.createdAt = new Date("2024-01-01");
MOCK_PRODUCT.updatedAt = new Date("2024-01-01");

export const MOCK_PRODUCT_FOR_PARTICIPANT_2 = new Product();
MOCK_PRODUCT_FOR_PARTICIPANT_2.id = MOCK_PRODUCT_ID;
MOCK_PRODUCT_FOR_PARTICIPANT_2.title = "Test Product";
MOCK_PRODUCT_FOR_PARTICIPANT_2.description = "Test product description";
MOCK_PRODUCT_FOR_PARTICIPANT_2.categories = ["Electronics", "Gadgets"];
MOCK_PRODUCT_FOR_PARTICIPANT_2.purchasePrice = 100;
MOCK_PRODUCT_FOR_PARTICIPANT_2.rentPrice = 10;
MOCK_PRODUCT_FOR_PARTICIPANT_2.rentalPeriod = ERentalPeriod.DAY;
MOCK_PRODUCT_FOR_PARTICIPANT_2.viewCount = 0;
MOCK_PRODUCT_FOR_PARTICIPANT_2.status = EProductStatus.AVAILABLE;
MOCK_PRODUCT_FOR_PARTICIPANT_2.owner = MOCK_PARTICIPANT_2;
MOCK_PRODUCT_FOR_PARTICIPANT_2.createdAt = new Date("2024-01-01");
MOCK_PRODUCT_FOR_PARTICIPANT_2.updatedAt = new Date("2024-01-01");

export const MOCK_CONVERSATION = new Conversation();
MOCK_CONVERSATION.id = MOCK_CONVERSATION_ID;
MOCK_CONVERSATION.participant1 = MOCK_PARTICIPANT_1;
MOCK_CONVERSATION.participant2 = MOCK_PARTICIPANT_2;
MOCK_CONVERSATION.product = MOCK_PRODUCT;
MOCK_CONVERSATION.lastMessageAt = new Date("2024-01-01");
MOCK_CONVERSATION.createdAt = new Date("2024-01-01");
MOCK_CONVERSATION.updatedAt = new Date("2024-01-01");

export const MOCK_CONVERSATION_LIST = [MOCK_CONVERSATION];
export const MOCK_TOTAL_COUNT = 1;
