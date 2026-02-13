import type { EntityManager } from "@mikro-orm/postgresql";

import { faker } from "@faker-js/faker";

import { Conversation } from "@/common/entities/conversations.entity";
import { Message } from "@/common/entities/messages.entity";
import { User } from "@/common/entities/users.entity";

export const MOCK_MESSAGE_ID = 1;
export const MOCK_CONVERSATION_ID = 1;
export const MOCK_SENDER_ID = 1;
export const MOCK_RECIPIENT_ID = 2;
export const MOCK_USER_ID = 1;
export const MOCK_TOTAL_COUNT = 50;

export const MOCK_SENDER = new User("sender@example.com", faker.internet.password());
MOCK_SENDER.id = MOCK_SENDER_ID;

export const MOCK_RECIPIENT = new User("recipient@example.com", faker.internet.password());
MOCK_RECIPIENT.id = MOCK_RECIPIENT_ID;

export const MOCK_CURRENT_USER = new User("current@example.com", faker.internet.password());
MOCK_CURRENT_USER.id = MOCK_USER_ID;

export const MOCK_CONVERSATION = new Conversation();
MOCK_CONVERSATION.id = MOCK_CONVERSATION_ID;
MOCK_CONVERSATION.participant1 = MOCK_SENDER;
MOCK_CONVERSATION.participant2 = MOCK_RECIPIENT;
MOCK_CONVERSATION.lastMessageAt = new Date("2024-01-01");
MOCK_CONVERSATION.createdAt = new Date("2024-01-01");
MOCK_CONVERSATION.updatedAt = new Date("2024-01-01");

export const MOCK_MESSAGE = new Message();
MOCK_MESSAGE.id = MOCK_MESSAGE_ID;
MOCK_MESSAGE.conversation = MOCK_CONVERSATION;
MOCK_MESSAGE.sender = MOCK_SENDER;
MOCK_MESSAGE.content = "This is a test message";
MOCK_MESSAGE.readAt = undefined;
MOCK_MESSAGE.createdAt = new Date("2024-01-01");
MOCK_MESSAGE.updatedAt = new Date("2024-01-01");

export const MOCK_MESSAGE_LIST = [MOCK_MESSAGE];

export const createMockMessage = (overrides: Partial<Message> = {}): Message => {
  const message = new Message();
  message.id = faker.number.int();
  message.conversation = MOCK_CONVERSATION;
  message.sender = MOCK_SENDER;
  message.content = faker.lorem.sentence();
  message.readAt = undefined;
  message.createdAt = new Date();
  message.updatedAt = new Date();
  Object.assign(message, overrides);
  return message;
};

export const createMockConversation = (overrides: Partial<Conversation> = {}): Conversation => {
  const conversation = new Conversation();
  conversation.id = faker.number.int();
  conversation.participant1 = MOCK_SENDER;
  conversation.participant2 = MOCK_RECIPIENT;
  conversation.lastMessageAt = new Date();
  conversation.createdAt = new Date();
  conversation.updatedAt = new Date();
  Object.assign(conversation, overrides);
  return conversation;
};

export const createMockEntityManager = (): EntityManager =>
  ({
    flush: vi.fn().mockResolvedValue(undefined),
    transactional: vi
      .fn()
      .mockImplementation((callback: () => Promise<unknown>) =>
        callback().then((result: unknown) => result),
      ),
  } as unknown as EntityManager);
