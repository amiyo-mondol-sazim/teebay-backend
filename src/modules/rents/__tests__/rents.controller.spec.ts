import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import { RentsController } from "../rents.controller";
import { RentsSerializer } from "../rents.serializer";
import { RentsService } from "../rents.service";
import {
  MOCK_OWNER,
  MOCK_OWNER_ID,
  MOCK_PRODUCT_ID,
  MOCK_RENT,
  MOCK_RENT_LIST,
  MOCK_RENT_RESPONSE,
  MOCK_RENTER,
  MOCK_RENTER_ID,
  MOCK_TOTAL_COUNT,
} from "./rents.mocks";

describe("RentsController", () => {
  let controller: RentsController;

  const mockRentsService = mockDeep<RentsService>({ funcPropSupport: true });
  const mockRentsSerializer = mockDeep<RentsSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentsController],
      providers: [
        {
          provide: RentsService,
          useValue: mockRentsService,
        },
        {
          provide: RentsSerializer,
          useValue: mockRentsSerializer,
        },
      ],
    }).compile();

    controller = module.get<RentsController>(RentsController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createRent", () => {
    it("should create a rent and return rent response", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };

      mockRentsService.createRent.mockResolvedValue(MOCK_RENT);
      mockRentsSerializer.serialize.mockReturnValue(MOCK_RENT_RESPONSE);

      const result = await controller.createRent(createDto, MOCK_RENTER);

      expect(mockRentsService.createRent).toHaveBeenCalledWith(createDto, MOCK_RENTER_ID);
      expect(mockRentsSerializer.serialize).toHaveBeenCalledWith(MOCK_RENT);
      expect(result).toEqual(MOCK_RENT_RESPONSE);
    });

    it("should throw BadRequestException when product is not available", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };
      const error = new BadRequestException("Product not available");

      mockRentsService.createRent.mockRejectedValue(error);

      await expect(controller.createRent(createDto, MOCK_RENTER)).rejects.toThrow(error);
      expect(mockRentsService.createRent).toHaveBeenCalledWith(createDto, MOCK_RENTER_ID);
    });

    it("should throw ForbiddenException when renter tries to rent own product", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };
      const error = new ForbiddenException("Cannot rent own product");

      mockRentsService.createRent.mockRejectedValue(error);

      await expect(controller.createRent(createDto, MOCK_OWNER)).rejects.toThrow(error);
      expect(mockRentsService.createRent).toHaveBeenCalledWith(createDto, MOCK_OWNER_ID);
    });
  });

  describe("getBorrowsByUser", () => {
    it("should return paginated borrowed rents", async () => {
      mockRentsService.getBorrowsByUser.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);
      mockRentsSerializer.serialize.mockReturnValue(MOCK_RENT_RESPONSE);
      mockRentsSerializer.serializeMany.mockReturnValue([MOCK_RENT_RESPONSE]);

      const result = await controller.getBorrowsByUser(MOCK_RENTER_ID, MOCK_RENTER, 1, 10);

      expect(mockRentsService.getBorrowsByUser).toHaveBeenCalledWith(
        MOCK_RENTER_ID,
        MOCK_RENTER_ID,
        1,
        10,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });

    it("should throw ForbiddenException when current user is not the target user", async () => {
      const error = new ForbiddenException("Unauthorized");
      const differentUserId = 999;

      mockRentsService.getBorrowsByUser.mockRejectedValue(error);

      await expect(
        controller.getBorrowsByUser(differentUserId, MOCK_RENTER, 1, 10),
      ).rejects.toThrow(error);
      expect(mockRentsService.getBorrowsByUser).toHaveBeenCalledWith(
        differentUserId,
        MOCK_RENTER_ID,
        1,
        10,
      );
    });
  });

  describe("getLentByUser", () => {
    it("should return paginated lent rents", async () => {
      mockRentsService.getLentByUser.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);
      mockRentsSerializer.serialize.mockReturnValue(MOCK_RENT_RESPONSE);
      mockRentsSerializer.serializeMany.mockReturnValue([MOCK_RENT_RESPONSE]);

      const result = await controller.getLentByUser(MOCK_OWNER_ID, MOCK_OWNER, 1, 10);

      expect(mockRentsService.getLentByUser).toHaveBeenCalledWith(
        MOCK_OWNER_ID,
        MOCK_OWNER_ID,
        1,
        10,
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });

    it("should throw ForbiddenException when current user is not the target user", async () => {
      const error = new ForbiddenException("Unauthorized");
      const differentUserId = 999;

      mockRentsService.getLentByUser.mockRejectedValue(error);

      await expect(controller.getLentByUser(differentUserId, MOCK_OWNER, 1, 10)).rejects.toThrow(
        error,
      );
      expect(mockRentsService.getLentByUser).toHaveBeenCalledWith(
        differentUserId,
        MOCK_OWNER_ID,
        1,
        10,
      );
    });
  });
});
