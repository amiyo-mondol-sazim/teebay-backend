import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import type { EntityManager } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { EProductStatus } from "@/common/enums/products.enums";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import { SalesRepository } from "../sales.repository";
import { SalesService } from "../sales.service";
import {
  MOCK_BUYER,
  MOCK_BUYER_ID,
  MOCK_PRODUCT,
  MOCK_PRODUCT_ID,
  MOCK_SALE,
  MOCK_SALE_LIST,
  MOCK_SELLER_ID,
  MOCK_TOTAL_COUNT,
} from "./sales.mocks";

const createMockEntityManager = (): EntityManager =>
  ({
    flush: vi.fn().mockResolvedValue(undefined),
    populate: vi.fn().mockResolvedValue(undefined),
  } as unknown as EntityManager);

describe("SalesService", () => {
  let service: SalesService;

  const mockSalesRepository = mockDeep<SalesRepository>({ funcPropSupport: true });
  const mockProductsService = mockDeep<ProductsService>({ funcPropSupport: true });
  const mockUsersService = mockDeep<UsersService>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: SalesRepository,
          useValue: mockSalesRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    MOCK_PRODUCT.status = EProductStatus.AVAILABLE;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("buyProduct", () => {
    it("should create a sale when product is available and buyer is not owner", async () => {
      const createDto = { productId: MOCK_PRODUCT_ID };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_BUYER);
      mockSalesRepository.createOne.mockReturnValue(MOCK_SALE);
      mockSalesRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      const result = await service.buyProduct(createDto, MOCK_BUYER_ID);

      expect(mockProductsService.getOneById).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockUsersService.findByIdOrThrow).toHaveBeenCalledWith(MOCK_BUYER_ID);
      expect(mockSalesRepository.createOne).toHaveBeenCalledWith({
        product: MOCK_PRODUCT,
        buyer: MOCK_BUYER,
        seller: MOCK_PRODUCT.owner,
        price: MOCK_PRODUCT.purchasePrice,
      });
      expect(result).toEqual(MOCK_SALE);
      expect(MOCK_PRODUCT.status).toBe(EProductStatus.SOLD);
    });

    it("should throw BadRequestException when product is not available", async () => {
      const createDto = { productId: MOCK_PRODUCT_ID };
      const soldProduct = { ...MOCK_PRODUCT, status: EProductStatus.SOLD };

      mockProductsService.getOneById.mockResolvedValue(soldProduct);
      mockSalesRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await expect(service.buyProduct(createDto, MOCK_BUYER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ForbiddenException when buyer tries to buy own product", async () => {
      const createDto = { productId: MOCK_PRODUCT_ID };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockSalesRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await expect(service.buyProduct(createDto, MOCK_SELLER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getBoughtByUser", () => {
    it("should return paginated bought sales for user", async () => {
      mockSalesRepository.getBoughtByUserId.mockResolvedValue([MOCK_SALE_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getBoughtByUser(MOCK_BUYER_ID, MOCK_BUYER_ID, 1, 10);

      expect(mockSalesRepository.getBoughtByUserId).toHaveBeenCalledWith(MOCK_BUYER_ID, 1, 10);
      expect(result).toEqual([MOCK_SALE_LIST, MOCK_TOTAL_COUNT]);
    });

    it("should throw ForbiddenException when current user is not the target user", () => {
      const differentUserId = 999;

      expect(() => service.getBoughtByUser(MOCK_BUYER_ID, differentUserId, 1, 10)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getSoldByUser", () => {
    it("should return paginated sold sales for user", async () => {
      mockSalesRepository.getSoldByUserId.mockResolvedValue([MOCK_SALE_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getSoldByUser(MOCK_SELLER_ID, MOCK_SELLER_ID, 1, 10);

      expect(mockSalesRepository.getSoldByUserId).toHaveBeenCalledWith(MOCK_SELLER_ID, 1, 10);
      expect(result).toEqual([MOCK_SALE_LIST, MOCK_TOTAL_COUNT]);
    });

    it("should throw ForbiddenException when current user is not the target user", () => {
      const differentUserId = 999;

      expect(() => service.getSoldByUser(MOCK_SELLER_ID, differentUserId, 1, 10)).toThrow(
        ForbiddenException,
      );
    });
  });
});
