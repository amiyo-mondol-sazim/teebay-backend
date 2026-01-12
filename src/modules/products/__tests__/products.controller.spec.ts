import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { mockDeep } from "vitest-mock-extended";

import { ProductsController } from "../products.controller";
import { ProductsSerializer } from "../products.serializer";
import { ProductsService } from "../products.service";
import type { ProductResponse } from "../products.types";
import {
  MOCK_OWNER,
  MOCK_OWNER_ID,
  MOCK_PRODUCT,
  MOCK_PRODUCT_ID,
  MOCK_PRODUCT_LIST,
  MOCK_TOTAL_COUNT,
} from "./products.mocks";

describe("ProductsController", () => {
  let controller: ProductsController;

  const mockProductsService = mockDeep<ProductsService>({ funcPropSupport: true });
  const mockProductsSerializer = mockDeep<ProductsSerializer>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ProductsSerializer,
          useValue: mockProductsSerializer,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getOneById", () => {
    it("should return a product by id", async () => {
      const mockResponse: ProductResponse = {
        id: MOCK_PRODUCT_ID,
        title: MOCK_PRODUCT.title,
        description: MOCK_PRODUCT.description,
        categories: MOCK_PRODUCT.categories,
        purchasePrice: MOCK_PRODUCT.purchasePrice,
        rentPrice: MOCK_PRODUCT.rentPrice,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
        viewCount: MOCK_PRODUCT.viewCount,
        createdAt: MOCK_PRODUCT.createdAt,
        updatedAt: MOCK_PRODUCT.updatedAt,
      };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockProductsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.getOneById(MOCK_PRODUCT_ID);

      expect(mockProductsService.getOneById).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockProductsSerializer.serialize).toHaveBeenCalledWith(MOCK_PRODUCT);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAll", () => {
    it("should return paginated products", async () => {
      const mockResponse: ProductResponse = {
        id: MOCK_PRODUCT_ID,
        title: MOCK_PRODUCT.title,
        description: MOCK_PRODUCT.description,
        categories: MOCK_PRODUCT.categories,
        purchasePrice: MOCK_PRODUCT.purchasePrice,
        rentPrice: MOCK_PRODUCT.rentPrice,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
        viewCount: MOCK_PRODUCT.viewCount,
        createdAt: MOCK_PRODUCT.createdAt,
        updatedAt: MOCK_PRODUCT.updatedAt,
      };

      mockProductsService.getAll.mockResolvedValue([MOCK_PRODUCT_LIST, MOCK_TOTAL_COUNT]);
      mockProductsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.getAll(1, 10);

      expect(mockProductsService.getAll).toHaveBeenCalledWith(1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });
  });

  describe("getByOwner", () => {
    it("should return paginated products for owner", async () => {
      const mockResponse: ProductResponse = {
        id: MOCK_PRODUCT_ID,
        title: MOCK_PRODUCT.title,
        description: MOCK_PRODUCT.description,
        categories: MOCK_PRODUCT.categories,
        purchasePrice: MOCK_PRODUCT.purchasePrice,
        rentPrice: MOCK_PRODUCT.rentPrice,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
        viewCount: MOCK_PRODUCT.viewCount,
        createdAt: MOCK_PRODUCT.createdAt,
        updatedAt: MOCK_PRODUCT.updatedAt,
      };

      mockProductsService.getAllByOwnerId.mockResolvedValue([MOCK_PRODUCT_LIST, MOCK_TOTAL_COUNT]);
      mockProductsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.getByOwner(MOCK_OWNER_ID, 1, 10);

      expect(mockProductsService.getAllByOwnerId).toHaveBeenCalledWith(MOCK_OWNER_ID, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(MOCK_TOTAL_COUNT);
    });
  });

  describe("create", () => {
    it("should create a product", async () => {
      const createDto = {
        title: "New Product",
        description: "Description",
        categories: ["Category"],
        purchasePrice: 50,
        rentPrice: 5,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
      };

      const mockResponse: ProductResponse = {
        id: MOCK_PRODUCT_ID,
        title: createDto.title,
        description: createDto.description,
        categories: createDto.categories,
        purchasePrice: createDto.purchasePrice,
        rentPrice: createDto.rentPrice,
        rentalPeriod: createDto.rentalPeriod,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.createOne.mockResolvedValue(MOCK_PRODUCT);
      mockProductsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.create(createDto, MOCK_OWNER);

      expect(mockProductsService.createOne).toHaveBeenCalledWith(createDto, MOCK_OWNER_ID);
      expect(mockProductsSerializer.serialize).toHaveBeenCalledWith(MOCK_PRODUCT);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateDto = { title: "Updated Title" };
      const updatedProduct = { ...MOCK_PRODUCT, ...updateDto };

      const mockResponse: ProductResponse = {
        id: MOCK_PRODUCT_ID,
        title: updateDto.title,
        description: MOCK_PRODUCT.description,
        categories: MOCK_PRODUCT.categories,
        purchasePrice: MOCK_PRODUCT.purchasePrice,
        rentPrice: MOCK_PRODUCT.rentPrice,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
        viewCount: MOCK_PRODUCT.viewCount,
        createdAt: MOCK_PRODUCT.createdAt,
        updatedAt: MOCK_PRODUCT.updatedAt,
      };

      mockProductsService.updateOne.mockResolvedValue(updatedProduct);
      mockProductsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.update(MOCK_PRODUCT_ID, updateDto, MOCK_OWNER);

      expect(mockProductsService.updateOne).toHaveBeenCalledWith(
        MOCK_PRODUCT_ID,
        updateDto,
        MOCK_OWNER_ID,
      );
      expect(mockProductsSerializer.serialize).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("delete", () => {
    it("should delete a product", async () => {
      mockProductsService.deleteOne.mockResolvedValue(undefined);

      await controller.delete(MOCK_PRODUCT_ID, MOCK_OWNER);

      expect(mockProductsService.deleteOne).toHaveBeenCalledWith(MOCK_PRODUCT_ID, MOCK_OWNER_ID);
    });
  });

  describe("incrementViews", () => {
    it("should increment product views", async () => {
      const mockResponse: ProductResponse = {
        id: MOCK_PRODUCT_ID,
        title: MOCK_PRODUCT.title,
        description: MOCK_PRODUCT.description,
        categories: MOCK_PRODUCT.categories,
        purchasePrice: MOCK_PRODUCT.purchasePrice,
        rentPrice: MOCK_PRODUCT.rentPrice,
        rentalPeriod: MOCK_PRODUCT.rentalPeriod,
        viewCount: MOCK_PRODUCT.viewCount + 1,
        createdAt: MOCK_PRODUCT.createdAt,
        updatedAt: MOCK_PRODUCT.updatedAt,
      };

      mockProductsService.incrementViews.mockResolvedValue(MOCK_PRODUCT);
      mockProductsSerializer.serialize.mockReturnValue(mockResponse);

      const result = await controller.incrementViews(MOCK_PRODUCT_ID);

      expect(mockProductsService.incrementViews).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockProductsSerializer.serialize).toHaveBeenCalledWith(MOCK_PRODUCT);
      expect(result).toEqual(mockResponse);
    });
  });
});
