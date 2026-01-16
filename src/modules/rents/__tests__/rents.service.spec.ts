import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import type { EntityManager } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { EProductStatus } from "@/common/enums/products.enums";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import { RentsRepository } from "../rents.repository";
import { RentsService } from "../rents.service";
import {
  MOCK_CALCULATED_RENT_PRICE,
  MOCK_OWNER_ID,
  MOCK_PRODUCT,
  MOCK_PRODUCT_ID,
  MOCK_RENT,
  MOCK_RENT_LIST,
  MOCK_RENTER,
  MOCK_RENTER_ID,
  MOCK_TOTAL_COUNT,
} from "./rents.mocks";

const createMockEntityManager = (): EntityManager =>
  ({
    flush: vi.fn().mockResolvedValue(undefined),
    populate: vi.fn().mockResolvedValue(undefined),
  } as unknown as EntityManager);

describe("RentsService", () => {
  let service: RentsService;

  const mockRentsRepository = mockDeep<RentsRepository>({ funcPropSupport: true });
  const mockProductsService = mockDeep<ProductsService>({ funcPropSupport: true });
  const mockUsersService = mockDeep<UsersService>({ funcPropSupport: true });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentsService,
        {
          provide: RentsRepository,
          useValue: mockRentsRepository,
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

    service = module.get<RentsService>(RentsService);
    MOCK_PRODUCT.status = EProductStatus.AVAILABLE;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createRent", () => {
    it("should create a rent when product is available and renter is not owner", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_RENTER);
      mockRentsRepository.createOne.mockReturnValue(MOCK_RENT);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      const result = await service.createRent(createDto, MOCK_RENTER_ID);

      expect(mockProductsService.getOneById).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockUsersService.findByIdOrThrow).toHaveBeenCalledWith(MOCK_RENTER_ID);
      expect(mockRentsRepository.createOne).toHaveBeenCalledWith({
        product: MOCK_PRODUCT,
        renter: MOCK_RENTER,
        owner: MOCK_PRODUCT.owner,
        rentPrice: MOCK_CALCULATED_RENT_PRICE,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
      });
      expect(result).toEqual(MOCK_RENT);
      expect(MOCK_PRODUCT.status).toBe(EProductStatus.RENTED);
    });

    it("should throw BadRequestException when product is sold", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };
      const soldProduct = { ...MOCK_PRODUCT, status: EProductStatus.SOLD };

      mockProductsService.getOneById.mockResolvedValue(soldProduct);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await expect(service.createRent(createDto, MOCK_RENTER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when product is already rented for the requested period", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockRentsRepository.findOverlappingRent.mockResolvedValue(MOCK_RENT);

      await expect(service.createRent(createDto, MOCK_RENTER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should create a rent when product is RENTED but dates do not overlap", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-03-01",
        endDate: "2027-03-07",
      };
      const rentedProduct = { ...MOCK_PRODUCT, status: EProductStatus.RENTED };

      mockProductsService.getOneById.mockResolvedValue(rentedProduct);
      mockUsersService.findByIdOrThrow.mockResolvedValue(MOCK_RENTER);
      mockRentsRepository.createOne.mockReturnValue(MOCK_RENT);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());
      mockRentsRepository.findOverlappingRent.mockResolvedValue(null);

      const result = await service.createRent(createDto, MOCK_RENTER_ID);

      expect(result).toEqual(MOCK_RENT);
      expect(mockRentsRepository.findOverlappingRent).toHaveBeenCalledWith(
        MOCK_PRODUCT_ID,
        new Date(createDto.startDate),
        new Date(createDto.endDate),
      );
    });

    it("should throw ForbiddenException when renter tries to rent own product", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-01",
        endDate: "2027-02-07",
      };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await expect(service.createRent(createDto, MOCK_OWNER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException when start date is after end date", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2027-02-07",
        endDate: "2027-02-01",
      };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await expect(service.createRent(createDto, MOCK_RENTER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when start date is in the past", async () => {
      const createDto = {
        productId: MOCK_PRODUCT_ID,
        startDate: "2020-01-01",
        endDate: "2020-01-07",
      };

      mockProductsService.getOneById.mockResolvedValue(MOCK_PRODUCT);
      mockRentsRepository.getEntityManager.mockReturnValue(createMockEntityManager());

      await expect(service.createRent(createDto, MOCK_RENTER_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getBorrowsByUser", () => {
    it("should return paginated borrowed rents for user", async () => {
      mockRentsRepository.getBorrowsByUserId.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getBorrowsByUser(MOCK_RENTER_ID, MOCK_RENTER_ID, 1, 10);

      expect(mockRentsRepository.getBorrowsByUserId).toHaveBeenCalledWith(MOCK_RENTER_ID, 1, 10);
      expect(result).toEqual([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);
    });

    it("should throw ForbiddenException when current user is not the target user", () => {
      const differentUserId = 999;

      expect(() => service.getBorrowsByUser(MOCK_RENTER_ID, differentUserId, 1, 10)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getLentByUser", () => {
    it("should return paginated lent rents for user", async () => {
      mockRentsRepository.getLentByUserId.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getLentByUser(MOCK_OWNER_ID, MOCK_OWNER_ID, 1, 10);

      expect(mockRentsRepository.getLentByUserId).toHaveBeenCalledWith(MOCK_OWNER_ID, 1, 10);
      expect(result).toEqual([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);
    });

    it("should throw ForbiddenException when current user is not the target user", () => {
      const differentUserId = 999;

      expect(() => service.getLentByUser(MOCK_OWNER_ID, differentUserId, 1, 10)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getRentsByProduct", () => {
    it("should return paginated rents for a product", async () => {
      mockRentsRepository.getRentsByProductId.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getRentsByProduct(MOCK_PRODUCT_ID, 1, 10);

      expect(mockRentsRepository.getRentsByProductId).toHaveBeenCalledWith(MOCK_PRODUCT_ID, 1, 10);
      expect(result).toEqual([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);
    });

    it("should use default page and limit when not provided", async () => {
      mockRentsRepository.getRentsByProductId.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);

      await service.getRentsByProduct(MOCK_PRODUCT_ID);

      expect(mockRentsRepository.getRentsByProductId).toHaveBeenCalledWith(MOCK_PRODUCT_ID, 1, 10);
    });

    it("should return empty array when no rents exist for product", async () => {
      mockRentsRepository.getRentsByProductId.mockResolvedValue([[], 0]);

      const result = await service.getRentsByProduct(MOCK_PRODUCT_ID, 1, 10);

      expect(result).toEqual([[], 0]);
    });

    it("should pass custom page and limit to repository", async () => {
      mockRentsRepository.getRentsByProductId.mockResolvedValue([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);

      const result = await service.getRentsByProduct(MOCK_PRODUCT_ID, 3, 25);

      expect(mockRentsRepository.getRentsByProductId).toHaveBeenCalledWith(MOCK_PRODUCT_ID, 3, 25);
      expect(result).toEqual([MOCK_RENT_LIST, MOCK_TOTAL_COUNT]);
    });
  });
});
