import { NotificationsSerializer } from "../notifications.serializer";
import { MOCK_NOTIFICATION } from "./notifications.mocks";

describe("NotificationsSerializer", () => {
  let serializer: NotificationsSerializer;

  beforeEach(() => {
    serializer = new NotificationsSerializer();
  });

  describe("serialize", () => {
    it("should serialize notification to response format", () => {
      const result = serializer.serialize(MOCK_NOTIFICATION);

      expect(result).toEqual({
        id: MOCK_NOTIFICATION.id,
        type: MOCK_NOTIFICATION.type,
        referenceId: MOCK_NOTIFICATION.referenceId,
        title: MOCK_NOTIFICATION.title,
        body: MOCK_NOTIFICATION.body,
        readAt: MOCK_NOTIFICATION.readAt,
        createdAt: MOCK_NOTIFICATION.createdAt,
      });
    });

    it("should handle notification with null readAt", () => {
      const notificationWithNull = {
        ...MOCK_NOTIFICATION,
        readAt: null,
      };

      const result = serializer.serialize(notificationWithNull);

      expect(result.readAt).toBeNull();
    });
  });

  describe("serializeMany", () => {
    it("should serialize multiple notifications", () => {
      const notifications = [MOCK_NOTIFICATION, MOCK_NOTIFICATION];

      const result = serializer.serializeMany(notifications);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id");
      expect(result[1]).toHaveProperty("id");
    });
  });
});
