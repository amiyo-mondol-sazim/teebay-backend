import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import type { EntityManager } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { EProductStatus } from "@/common/enums/products.enums";
import { UsersService } from "@/modules/users/users.service";

import { ProductsRepository } from "../products.repository";
import { ProductsService } from "../products.service";
import {
  MOCK_OWNER,
  MOCK_OWNER_ID,
  MOCK_PRODUCT,
  MOCK_PRODUCT_ID,
  MOCK_PRODUCT_LIST,
  MOCK_TOTAL_COUNT,
} from "./products.mocks";

const createMockEntityManager = (): EntityManager =>
  ({
    flush: vi.fn().mockResolvedValue(undefined),
  } as unknown as EntityManager);

describe("ProductsService", () => {
  let service: ProductsService;

  const mockProductsRepository = mockDeep<ProductsRepository>({ funcPropSupport: true });
  const mockUsersService = mockDeep<UsersService>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getOneById", () => {
    it("should return a product by id", async () => {
      mockProductsRepository.findOneOrFail.mockResolvedValue(MOCK_PRODUCT);

      const result = await service.getOneById(MOCK_PRODUCT_ID);

      expect(mockProductsRepository.findOneOrFail).toHaveBeenCalledWith(MOCK_PRODUCT_ID, {
        populate: ["owner"],
      });
      expect(result).toEqual(MOCK_PRODUCT);
    });
  });

  describe("getAllByOwnerId", () => {
    it("should return paginated products for owner", async () => {
      mockProductsRepository.getAllByOwnerId.mockResolvedValue([
        MOCK_PRODUCT_LIST,
        MOCK_TOTAL_COUNT,
      ]);

      const result = await service.getAllByOwnerId(MOCK_OWNER_ID, 1, 10);

      expect(mockProductsRepository.getAllByOwnerId).toHaveBeenCalledWith(MOCK_OWNER_ID, 1, 10);
      expect(result).toEqual([MOCK_PRODUCT_LIST, MOCK_TOTAL_COUNT]);
    });
  });

  describe("getAll", () => {
    it("should return paginated products", async () => {
      mockProductsRepository.getAll.mockResolvedValue([MOCK_PRODUCT_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getAll(1, 10);

      expect(mockProductsRepository.getAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual([MOCK_PRODUCT_LIST, MOCK_TOTAL_COUNT]);
    });
  });

  describe("createOne", () => {
    it("should create a product", async () => {
      const createDto = {
        title: "New Product",
        description: "Description",
        categories: ["Category"],
        purchasePrice: 50,
        rentPrice: 5,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
      };

      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_OWNER);
      mockProductsRepository.createOne.mockReturnValue(MOCK_PRODUCT);
      mockProductsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      const result = await service.createOne(createDto, MOCK_OWNER_ID);

      expect(mockUsersService.findByIdOrThrow).toHaveBeenCalledWith(MOCK_OWNER_ID);
      expect(mockProductsRepository.createOne).toHaveBeenCalledWith({
        ...createDto,
        owner: MOCK_OWNER,
      });
      expect(result).toEqual(MOCK_PRODUCT);
    });
  });

  describe("updateOne", () => {
    it("should update a product when user is owner", async () => {
      const updateDto = { title: "Updated Title" };
      mockProductsRepository.findOneOrFail.mockResolvedValue(MOCK_PRODUCT);
      mockProductsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      const result = await service.updateOne(MOCK_PRODUCT_ID, updateDto, MOCK_OWNER_ID);

      expect(mockProductsRepository.findOneOrFail).toHaveBeenCalledWith(MOCK_PRODUCT_ID, {
        populate: ["owner"],
      });
      expect(result.title).toEqual("Updated Title");
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      const updateDto = { title: "Updated Title" };
      const differentUserId = 999;
      mockProductsRepository.findOneOrFail.mockResolvedValue(MOCK_PRODUCT);

      await expect(service.updateOne(MOCK_PRODUCT_ID, updateDto, differentUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException when product is not available", async () => {
      const updateDto = { title: "Updated Title" };
      const soldProduct = { ...MOCK_PRODUCT, status: EProductStatus.SOLD };
      mockProductsRepository.findOneOrFail.mockResolvedValue(soldProduct);

      await expect(service.updateOne(MOCK_PRODUCT_ID, updateDto, MOCK_OWNER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("deleteOne", () => {
    it("should delete a product when user is owner", async () => {
      mockProductsRepository.findOneOrFail.mockResolvedValue(MOCK_PRODUCT);
      mockProductsRepository.remove.mockReturnThis();
      mockProductsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await service.deleteOne(MOCK_PRODUCT_ID, MOCK_OWNER_ID);

      expect(mockProductsRepository.findOneOrFail).toHaveBeenCalledWith(MOCK_PRODUCT_ID, {
        populate: ["owner"],
      });
      expect(mockProductsRepository.remove).toHaveBeenCalledWith(MOCK_PRODUCT);
    });

    it("should throw ForbiddenException when user is not owner", async () => {
      const differentUserId = 999;
      mockProductsRepository.findOneOrFail.mockResolvedValue(MOCK_PRODUCT);

      await expect(service.deleteOne(MOCK_PRODUCT_ID, differentUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException when product is not available", async () => {
      const soldProduct = { ...MOCK_PRODUCT, status: EProductStatus.SOLD };
      mockProductsRepository.findOneOrFail.mockResolvedValue(soldProduct);

      await expect(service.deleteOne(MOCK_PRODUCT_ID, MOCK_OWNER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("incrementViews", () => {
    it("should increment product views", async () => {
      mockProductsRepository.incrementViews.mockResolvedValue(MOCK_PRODUCT);
      mockProductsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      const result = await service.incrementViews(MOCK_PRODUCT_ID);

      expect(mockProductsRepository.incrementViews).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(result).toEqual(MOCK_PRODUCT);
    });
  });
});
