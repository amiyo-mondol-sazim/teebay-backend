import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import type { User } from "@/common/entities/users.entity";

import { NotificationsController } from "../notifications.controller";
import type { GetNotificationsQueryDto } from "../notifications.dtos";
import { NotificationsSerializer } from "../notifications.serializer";
import { NotificationsService } from "../notifications.service";
import {
  MOCK_MESSAGE_NOTIFICATION,
  MOCK_NOTIFICATION_ID,
  MOCK_TOTAL_COUNT,
  MOCK_USER_ID,
} from "./notifications.mocks";

describe("NotificationsController", () => {
  let controller: NotificationsController;

  const mockService = mockDeep<NotificationsService>({ funcPropSupport: true });
  const mockSerializer = mockDeep<NotificationsSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
        { provide: NotificationsSerializer, useValue: mockSerializer },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /notifications", () => {
    it("should return paginated notifications", async () => {
      const mockNotifications = [MOCK_MESSAGE_NOTIFICATION];
      const mockTotalCount = MOCK_TOTAL_COUNT;

      mockService.getNotifications.mockResolvedValue([mockNotifications, mockTotalCount]);
      mockSerializer.serializeMany.mockReturnValue([MOCK_MESSAGE_NOTIFICATION]);

      const queryDto: GetNotificationsQueryDto = { page: 1, limit: 20 };
      const currentUser = { id: MOCK_USER_ID } as User;

      const result = await controller.getNotifications(currentUser, queryDto);

      expect(mockService.getNotifications).toHaveBeenCalledWith(MOCK_USER_ID, queryDto);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
    });

    it("should use default pagination when not provided", async () => {
      const mockNotifications = [MOCK_MESSAGE_NOTIFICATION];
      const mockTotalCount = MOCK_TOTAL_COUNT;

      mockService.getNotifications.mockResolvedValue([mockNotifications, mockTotalCount]);
      mockSerializer.serializeMany.mockReturnValue([MOCK_MESSAGE_NOTIFICATION]);

      const queryDto = {} as GetNotificationsQueryDto;
      const currentUser = { id: MOCK_USER_ID } as User;

      await controller.getNotifications(currentUser, queryDto);

      expect(mockService.getNotifications).toHaveBeenCalledWith(MOCK_USER_ID, {
        page: 1,
        limit: 20,
      });
    });
  });

  describe("GET /unread-count", () => {
    it("should return unread count", async () => {
      mockService.getUnreadCount.mockResolvedValue(5);

      const currentUser = { id: MOCK_USER_ID } as User;

      const result = await controller.getUnreadCount(currentUser);

      expect(mockService.getUnreadCount).toHaveBeenCalledWith(MOCK_USER_ID);
      expect(result.count).toBe(5);
    });
  });

  describe("PATCH /:id/read", () => {
    it("should mark notification as read", async () => {
      mockService.markAsRead.mockResolvedValue(undefined);

      const currentUser = { id: MOCK_USER_ID } as User;

      await controller.markAsRead(MOCK_NOTIFICATION_ID, currentUser);

      expect(mockService.markAsRead).toHaveBeenCalledWith(MOCK_NOTIFICATION_ID, MOCK_USER_ID);
    });
  });

  describe("PATCH /read-all", () => {
    it("should mark all notifications as read", async () => {
      mockService.markAllAsRead.mockResolvedValue(undefined);

      const currentUser = { id: MOCK_USER_ID } as User;

      await controller.markAllAsRead(currentUser);

      expect(mockService.markAllAsRead).toHaveBeenCalledWith(MOCK_USER_ID);
    });
  });
});
