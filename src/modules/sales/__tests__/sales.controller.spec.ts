import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import { SalesController } from "../sales.controller";
import { SalesSerializer } from "../sales.serializer";
import { SalesService } from "../sales.service";
import {
  MOCK_BUYER,
  MOCK_BUYER_ID,
  MOCK_PRODUCT_ID,
  MOCK_SALE,
  MOCK_SALE_LIST,
  MOCK_SALE_RESPONSE,
  MOCK_SELLER,
  MOCK_SELLER_ID,
  MOCK_TOTAL_COUNT,
} from "./sales.mocks";

describe("SalesController", () => {
  let controller: SalesController;

  const mockSalesService = mockDeep<SalesService>({ funcPropSupport: true });
  const mockSalesSerializer = mockDeep<SalesSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
        {
          provide: SalesSerializer,
          useValue: mockSalesSerializer,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("buyProduct", () => {
    it("should purchase a product and return sale response", async () => {
      const createDto = { productId: MOCK_PRODUCT_ID };

      mockSalesService.buyProduct.mockResolvedValue(MOCK_SALE);
      mockSalesSerializer.serialize.mockReturnValue(MOCK_SALE_RESPONSE);

      const result = await controller.buyProduct(createDto, MOCK_BUYER);

      expect(mockSalesService.buyProduct).toHaveBeenCalledWith(createDto, MOCK_BUYER_ID);
      expect(mockSalesSerializer.serialize).toHaveBeenCalledWith(MOCK_SALE);
      expect(result).toEqual(MOCK_SALE_RESPONSE);
    });

    it("should throw BadRequestException when product is not available", async () => {
      const createDto = { productId: MOCK_PRODUCT_ID };
      const error = new BadRequestException("Product not available");

      mockSalesService.buyProduct.mockRejectedValue(error);

      await expect(controller.buyProduct(createDto, MOCK_BUYER)).rejects.toThrow(error);
      expect(mockSalesService.buyProduct).toHaveBeenCalledWith(createDto, MOCK_BUYER_ID);
    });

    it("should throw ForbiddenException when buyer tries to buy own product", async () => {
      const createDto = { productId: MOCK_PRODUCT_ID };
      const error = new ForbiddenException("Cannot buy own product");

      mockSalesService.buyProduct.mockRejectedValue(error);

      await expect(controller.buyProduct(createDto, MOCK_SELLER)).rejects.toThrow(error);
      expect(mockSalesService.buyProduct).toHaveBeenCalledWith(createDto, MOCK_SELLER_ID);
    });
  });

  describe("getBoughtByUser", () => {
    it("should return paginated bought sales", async () => {
      mockSalesService.getBoughtByUser.mockResolvedValue([MOCK_SALE_LIST, MOCK_TOTAL_COUNT]);
      mockSalesSerializer.serialize.mockReturnValue(MOCK_SALE_RESPONSE);
      mockSalesSerializer.serializeMany.mockReturnValue([MOCK_SALE_RESPONSE]);

      const result = await controller.getBoughtByUser(MOCK_BUYER_ID, MOCK_BUYER, 1, 10);

      expect(mockSalesService.getBoughtByUser).toHaveBeenCalledWith(
        MOCK_BUYER_ID,
        MOCK_BUYER_ID,
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

      mockSalesService.getBoughtByUser.mockRejectedValue(error);

      await expect(controller.getBoughtByUser(differentUserId, MOCK_BUYER, 1, 10)).rejects.toThrow(
        error,
      );
      expect(mockSalesService.getBoughtByUser).toHaveBeenCalledWith(
        differentUserId,
        MOCK_BUYER_ID,
        1,
        10,
      );
    });
  });

  describe("getSoldByUser", () => {
    it("should return paginated sold sales", async () => {
      mockSalesService.getSoldByUser.mockResolvedValue([MOCK_SALE_LIST, MOCK_TOTAL_COUNT]);
      mockSalesSerializer.serialize.mockReturnValue(MOCK_SALE_RESPONSE);
      mockSalesSerializer.serializeMany.mockReturnValue([MOCK_SALE_RESPONSE]);

      const result = await controller.getSoldByUser(MOCK_SELLER_ID, MOCK_SELLER, 1, 10);

      expect(mockSalesService.getSoldByUser).toHaveBeenCalledWith(
        MOCK_SELLER_ID,
        MOCK_SELLER_ID,
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

      mockSalesService.getSoldByUser.mockRejectedValue(error);

      await expect(controller.getSoldByUser(differentUserId, MOCK_SELLER, 1, 10)).rejects.toThrow(
        error,
      );
      expect(mockSalesService.getSoldByUser).toHaveBeenCalledWith(
        differentUserId,
        MOCK_SELLER_ID,
        1,
        10,
      );
    });
  });
});
