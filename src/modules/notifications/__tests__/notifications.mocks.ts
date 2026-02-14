import type { EntityManager } from "@mikro-orm/postgresql";

import { faker } from "@faker-js/faker";

import { Notification } from "@/common/entities/notifications.entity";
import { User } from "@/common/entities/users.entity";
import { ENotificationType } from "@/common/enums/notifications.enums";

export const MOCK_NOTIFICATION_ID = 1;
export const MOCK_USER_ID = 1;

export const MOCK_USER = new User("test@example.com", faker.internet.password());
MOCK_USER.id = MOCK_USER_ID;

export const MOCK_NOTIFICATION = new Notification();
MOCK_NOTIFICATION.id = MOCK_NOTIFICATION_ID;
MOCK_NOTIFICATION.type = ENotificationType.MESSAGE;
MOCK_NOTIFICATION.title = "Test notification";
MOCK_NOTIFICATION.body = "Test body";
MOCK_NOTIFICATION.referenceId = 123;
MOCK_NOTIFICATION.readAt = null;
MOCK_NOTIFICATION.createdAt = new Date("2024-01-01");
MOCK_NOTIFICATION.updatedAt = new Date("2024-01-01");
MOCK_NOTIFICATION.user = MOCK_USER;

// Type-specific mocks
export const MOCK_MESSAGE_NOTIFICATION = new Notification();
MOCK_MESSAGE_NOTIFICATION.id = MOCK_NOTIFICATION_ID;
MOCK_MESSAGE_NOTIFICATION.type = ENotificationType.MESSAGE;
MOCK_MESSAGE_NOTIFICATION.title = "Test notification";
MOCK_MESSAGE_NOTIFICATION.body = "Test body";
MOCK_MESSAGE_NOTIFICATION.referenceId = 123;
MOCK_MESSAGE_NOTIFICATION.readAt = null;
MOCK_MESSAGE_NOTIFICATION.createdAt = new Date("2024-01-01");
MOCK_MESSAGE_NOTIFICATION.updatedAt = new Date("2024-01-01");
MOCK_MESSAGE_NOTIFICATION.user = MOCK_USER;

export const MOCK_RENT_REQUEST_NOTIFICATION = new Notification();
MOCK_RENT_REQUEST_NOTIFICATION.id = MOCK_NOTIFICATION_ID;
MOCK_RENT_REQUEST_NOTIFICATION.type = ENotificationType.RENT_REQUEST;
MOCK_RENT_REQUEST_NOTIFICATION.title = "Test notification";
MOCK_RENT_REQUEST_NOTIFICATION.body = "Test body";
MOCK_RENT_REQUEST_NOTIFICATION.referenceId = 123;
MOCK_RENT_REQUEST_NOTIFICATION.readAt = null;
MOCK_RENT_REQUEST_NOTIFICATION.createdAt = new Date("2024-01-01");
MOCK_RENT_REQUEST_NOTIFICATION.updatedAt = new Date("2024-01-01");
MOCK_RENT_REQUEST_NOTIFICATION.user = MOCK_USER;

export const MOCK_SALE_REQUEST_NOTIFICATION = new Notification();
MOCK_SALE_REQUEST_NOTIFICATION.id = MOCK_NOTIFICATION_ID;
MOCK_SALE_REQUEST_NOTIFICATION.type = ENotificationType.SALE_REQUEST;
MOCK_SALE_REQUEST_NOTIFICATION.title = "Test notification";
MOCK_SALE_REQUEST_NOTIFICATION.body = "Test body";
MOCK_SALE_REQUEST_NOTIFICATION.referenceId = 123;
MOCK_SALE_REQUEST_NOTIFICATION.readAt = null;
MOCK_SALE_REQUEST_NOTIFICATION.createdAt = new Date("2024-01-01");
MOCK_SALE_REQUEST_NOTIFICATION.updatedAt = new Date("2024-01-01");
MOCK_SALE_REQUEST_NOTIFICATION.user = MOCK_USER;

export const MOCK_NOTIFICATION_LIST = [MOCK_NOTIFICATION];
export const MOCK_TOTAL_COUNT = 5;

export const createMockEntityManager = (): EntityManager =>
  ({
    flush: vi.fn().mockResolvedValue(undefined),
    transactional: vi
      .fn()
      .mockImplementation((callback: () => Promise<unknown>) =>
        callback().then((result: unknown) => result),
      ),
    getReference: vi.fn().mockImplementation((entity: unknown, id: number) => ({
      id,
      __entity: entity,
    })),
  } as unknown as EntityManager);
