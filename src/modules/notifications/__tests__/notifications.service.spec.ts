import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import { ENotificationType } from "@/common/enums/notifications.enums";

import { NotificationsRepository } from "../notifications.repository";
import { NotificationsService } from "../notifications.service";
import {
  MOCK_MESSAGE_NOTIFICATION,
  MOCK_NOTIFICATION_ID,
  MOCK_RENT_REQUEST_NOTIFICATION,
  MOCK_SALE_REQUEST_NOTIFICATION,
  MOCK_TOTAL_COUNT,
  MOCK_USER_ID,
  createMockEntityManager,
} from "./notifications.mocks";

vi.mock("@/modules/chat/chat.gateway", () => ({
  ChatGateway: class {
    sendNotification = vi.fn();
  },
}));

describe("NotificationsService", () => {
  let service: NotificationsService;

  const mockRepository = mockDeep<NotificationsRepository>({ funcPropSupport: true });

  beforeEach(async () => {
    const { ChatGateway } = await import("@/modules/chat/chat.gateway");

    const module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: mockRepository },
        { provide: ChatGateway, useValue: { sendNotification: vi.fn() } },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createNotification", () => {
    it("should create MESSAGE notification", async () => {
      mockRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockRepository.createOne.mockReturnValue(MOCK_MESSAGE_NOTIFICATION);

      const result = await service.createNotification(
        MOCK_USER_ID,
        ENotificationType.MESSAGE,
        "Test title",
        "Test body",
        123,
      );

      expect(mockRepository.createOne).toHaveBeenCalled();
      expect(result.type).toBe(ENotificationType.MESSAGE);
    });

    it("should create RENT_REQUEST notification", async () => {
      mockRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockRepository.createOne.mockReturnValue(MOCK_RENT_REQUEST_NOTIFICATION);

      const result = await service.createNotification(
        MOCK_USER_ID,
        ENotificationType.RENT_REQUEST,
        "Rent request",
        "Please rent this item",
      );

      expect(mockRepository.createOne).toHaveBeenCalled();
      expect(result.type).toBe(ENotificationType.RENT_REQUEST);
    });

    it("should create SALE_REQUEST notification", async () => {
      mockRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockRepository.createOne.mockReturnValue(MOCK_SALE_REQUEST_NOTIFICATION);

      const result = await service.createNotification(
        MOCK_USER_ID,
        ENotificationType.SALE_REQUEST,
        "Sale request",
        "Please buy this item",
      );

      expect(mockRepository.createOne).toHaveBeenCalled();
      expect(result.type).toBe(ENotificationType.SALE_REQUEST);
    });
  });

  describe("getNotifications", () => {
    it("should return paginated notifications", async () => {
      mockRepository.findByUser.mockResolvedValue([[MOCK_MESSAGE_NOTIFICATION], MOCK_TOTAL_COUNT]);

      const queryDto = { page: 1, limit: 10 };
      const [notifications, count] = await service.getNotifications(MOCK_USER_ID, queryDto);

      expect(mockRepository.findByUser).toHaveBeenCalledWith(MOCK_USER_ID, 1, 10);
      expect(notifications).toHaveLength(1);
      expect(count).toBe(MOCK_TOTAL_COUNT);
    });

    it("should use default page size when not provided", async () => {
      mockRepository.findByUser.mockResolvedValue([[MOCK_MESSAGE_NOTIFICATION], MOCK_TOTAL_COUNT]);

      const queryDto = {};
      const [notifications] = await service.getNotifications(MOCK_USER_ID, queryDto);

      expect(mockRepository.findByUser).toHaveBeenCalledWith(MOCK_USER_ID, 1, 20);
      expect(notifications).toHaveLength(1);
    });

    it("should use provided page and limit", async () => {
      mockRepository.findByUser.mockResolvedValue([[MOCK_MESSAGE_NOTIFICATION], MOCK_TOTAL_COUNT]);

      const queryDto = { page: 2, limit: 15 };
      const [notifications] = await service.getNotifications(MOCK_USER_ID, queryDto);

      expect(mockRepository.findByUser).toHaveBeenCalledWith(MOCK_USER_ID, 2, 15);
      expect(notifications).toHaveLength(1);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      mockRepository.getUnreadCount.mockResolvedValue(5);

      const result = await service.getUnreadCount(MOCK_USER_ID);

      expect(mockRepository.getUnreadCount).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(result).toBe(5);
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      mockRepository.markAsRead.mockResolvedValue(true);

      await service.markAsRead(MOCK_NOTIFICATION_ID, MOCK_USER_ID);

      expect(mockRepository.markAsRead).toHaveBeenCalledWith(MOCK_NOTIFICATION_ID, MOCK_USER_ID);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      await service.markAllAsRead(MOCK_USER_ID);

      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(MOCK_USER_ID);
    });
  });
});
