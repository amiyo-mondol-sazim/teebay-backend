import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { computePaginationMetadata } from "@/utils/pagination";

import { DEFAULT_RENTS_PAGE_SIZE } from "./rents.constants";
import { CreateRentDto } from "./rents.dtos";
import { RentsSerializer } from "./rents.serializer";
import { RentsService } from "./rents.service";
import type { RentResponse, RentsListResponse } from "./rents.types";

@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("rents")
export class RentsController {
  constructor(
    private readonly rentsService: RentsService,
    private readonly rentsSerializer: RentsSerializer,
  ) {}

  @Post()
  async createRent(
    @Body() dto: CreateRentDto,
    @CurrentUser() currentUser: User,
  ): Promise<RentResponse> {
    const rent = await this.rentsService.createRent(dto, currentUser.id);
    return this.rentsSerializer.serialize(rent);
  }

  @Get("borrows/:userId")
  async getBorrowsByUser(
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = DEFAULT_RENTS_PAGE_SIZE,
  ): Promise<RentsListResponse> {
    const [rents, totalCount] = await this.rentsService.getBorrowsByUser(
      userId,
      currentUser.id,
      page,
      limit,
    );
    const meta = computePaginationMetadata({
      page,
      limit,
      totalItems: totalCount,
    });
    return {
      data: this.rentsSerializer.serializeMany(rents),
      meta,
    };
  }

  @Get("lents/:userId")
  async getLentByUser(
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = DEFAULT_RENTS_PAGE_SIZE,
  ): Promise<RentsListResponse> {
    const [rents, totalCount] = await this.rentsService.getLentByUser(
      userId,
      currentUser.id,
      page,
      limit,
    );
    const meta = computePaginationMetadata({
      page,
      limit,
      totalItems: totalCount,
    });
    return {
      data: this.rentsSerializer.serializeMany(rents),
      meta,
    };
  }
}
