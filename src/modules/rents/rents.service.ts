import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";

import { EProductStatus } from "@/common/enums/products.enums";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";

import {
  CANNOT_RENT_OWN_PRODUCT_ERROR,
  DEFAULT_RENTS_PAGE_SIZE,
  INVALID_RENT_DATE_RANGE_ERROR,
  PRODUCT_ALREADY_RENTED_FOR_PERIOD_ERROR,
  PRODUCT_NOT_AVAILABLE_FOR_RENT_ERROR,
  RENT_START_DATE_IN_PAST_ERROR,
  UNAUTHORIZED_RENTS_VIEW_ERROR,
} from "./rents.constants";
import type { CreateRentDto } from "./rents.dtos";
import { RentsRepository } from "./rents.repository";

@Injectable()
export class RentsService {
  constructor(
    private readonly rentsRepository: RentsRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async createRent(dto: CreateRentDto, renterId: number) {
    const product = await this.productsService.getOneById(dto.productId);
    await this.rentsRepository.getEntityManager().populate(product.owner, ["userProfile"]);

    if (product.status === EProductStatus.SOLD) {
      throw new BadRequestException(PRODUCT_NOT_AVAILABLE_FOR_RENT_ERROR);
    }

    if (product.owner.id === renterId) {
      throw new ForbiddenException(CANNOT_RENT_OWN_PRODUCT_ERROR);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const now = new Date();
    // Set hours to 0 to compare dates only if needed, but for precision we can use full date
    // Actually, usually it's better to allow same day but not past
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      throw new BadRequestException(RENT_START_DATE_IN_PAST_ERROR);
    }

    if (start >= end) {
      throw new BadRequestException(INVALID_RENT_DATE_RANGE_ERROR);
    }

    const overlappingRent = await this.rentsRepository.findOverlappingRent(
      dto.productId,
      start,
      end,
    );

    if (overlappingRent) {
      throw new BadRequestException(PRODUCT_ALREADY_RENTED_FOR_PERIOD_ERROR);
    }

    const renter = await this.usersService.findByIdOrThrow(renterId);

    const rent = this.rentsRepository.createOne({
      product,
      renter,
      owner: product.owner,
      rentPrice: product.rentPrice,
      startDate: start,
      endDate: end,
    });

    product.status = EProductStatus.RENTED;

    await this.rentsRepository.getEntityManager().flush();

    return rent;
  }

  getBorrowsByUser(
    userId: number,
    currentUserId: number,
    page = 1,
    limit = DEFAULT_RENTS_PAGE_SIZE,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(UNAUTHORIZED_RENTS_VIEW_ERROR);
    }

    return this.rentsRepository.getBorrowsByUserId(userId, page, limit);
  }

  getLentByUser(userId: number, currentUserId: number, page = 1, limit = DEFAULT_RENTS_PAGE_SIZE) {
    if (userId !== currentUserId) {
      throw new ForbiddenException(UNAUTHORIZED_RENTS_VIEW_ERROR);
    }

    return this.rentsRepository.getLentByUserId(userId, page, limit);
  }
}
