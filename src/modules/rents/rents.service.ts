import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { ENotificationType } from "@/common/enums/notifications.enums";
import { EProductStatus } from "@/common/enums/products.enums";
import { ChatGateway } from "@/modules/chat/chat.gateway";
import { NotificationsService } from "@/modules/notifications/notifications.service";
import { ProductsService } from "@/modules/products/products.service";
import { UsersService } from "@/modules/users/users.service";
import { acquireLock } from "@/utils/lock";

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
import { calculateRentPrice } from "./rents.helper";
import { RentsRepository } from "./rents.repository";

@Injectable()
export class RentsService {
  constructor(
    private readonly rentsRepository: RentsRepository,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  createRent(dto: CreateRentDto, renterId: number) {
    const em = this.rentsRepository.getEntityManager();

    return em.transactional((tx) => this.executeRentCreation(dto, renterId, tx));
  }

  private async executeRentCreation(dto: CreateRentDto, renterId: number, tx: EntityManager) {
    const lockAcquire = await acquireLock(dto.productId, tx);
    if (!lockAcquire) {
      throw new BadRequestException(PRODUCT_NOT_AVAILABLE_FOR_RENT_ERROR);
    }

    const product = await this.productsService.getOneById(dto.productId);
    await tx.populate(product.owner, ["userProfile"]);

    if (product.status === EProductStatus.SOLD) {
      throw new BadRequestException(PRODUCT_NOT_AVAILABLE_FOR_RENT_ERROR);
    }

    const renter = await this.usersService.findByIdOrThrow(renterId);

    if (product.owner.id === renter.id) {
      throw new ForbiddenException(CANNOT_RENT_OWN_PRODUCT_ERROR);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const now = new Date();
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

    const calculatedRentPrice = calculateRentPrice(
      product.rentPrice,
      product.rentalPeriod,
      start,
      end,
    );

    const rent = this.rentsRepository.createOne({
      product,
      renter,
      owner: product.owner,
      rentPrice: calculatedRentPrice,
      startDate: start,
      endDate: end,
    });

    product.status = EProductStatus.RENTED;

    await tx.flush();

    await this.notificationsService.createNotification(
      product.owner.id,
      ENotificationType.RENT_REQUEST,
      "New Rental Request",
      `User ${renter.email} wants to rent your "${product.title}"`,
      rent.id,
    );

    this.chatGateway.sendNotification(product.owner.id, {
      type: "RENT_REQUEST",
      rentId: rent.id,
      productTitle: product.title,
    });

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

  getRentsByProduct(productId: number, page = 1, limit = DEFAULT_RENTS_PAGE_SIZE) {
    return this.rentsRepository.getRentsByProductId(productId, page, limit);
  }
}
