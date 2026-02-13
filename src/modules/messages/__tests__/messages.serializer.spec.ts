import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { MessagesSerializer } from "../messages.serializer";
import { MOCK_MESSAGE, MOCK_MESSAGE_LIST, MOCK_SENDER } from "./messages.mocks";

describe("MessagesSerializer", () => {
  let serializer: MessagesSerializer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesSerializer],
    }).compile();

    serializer = module.get<MessagesSerializer>(MessagesSerializer);
  });

  describe("serialize", () => {
    it("should serialize a single message correctly", () => {
      const result = serializer.serialize(MOCK_MESSAGE);

      expect(result).toEqual({
        id: MOCK_MESSAGE.id,
        conversationId: MOCK_MESSAGE.conversation.id,
        sender: {
          id: MOCK_SENDER.id,
          email: MOCK_SENDER.email,
          userProfile: undefined,
        },
        content: MOCK_MESSAGE.content,
        readAt: MOCK_MESSAGE.readAt,
        createdAt: MOCK_MESSAGE.createdAt,
      });
    });

    it("should include readAt when message is read", () => {
      const readMessage = { ...MOCK_MESSAGE, readAt: new Date() };
      const result = serializer.serialize(readMessage);

      expect(result.readAt).toBeDefined();
    });
  });

  describe("serializeMany", () => {
    it("should serialize array of messages", () => {
      const result = serializer.serializeMany(MOCK_MESSAGE_LIST);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: MOCK_MESSAGE.id,
        conversationId: MOCK_MESSAGE.conversation.id,
        sender: {
          id: MOCK_SENDER.id,
          email: MOCK_SENDER.email,
          userProfile: undefined,
        },
        content: MOCK_MESSAGE.content,
        readAt: MOCK_MESSAGE.readAt,
        createdAt: MOCK_MESSAGE.createdAt,
      });
    });

    it("should return empty array for empty input", () => {
      const result = serializer.serializeMany([]);
      expect(result).toEqual([]);
    });
  });
});
