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
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { computePaginationMetadata } from "@/utils/pagination";

import { DEFAULT_SALES_PAGE_SIZE } from "./sales.constants";
import { CreateSaleDto } from "./sales.dtos";
import { SalesSerializer } from "./sales.serializer";
import { SalesService } from "./sales.service";
import type { SaleResponse, SalesListResponse } from "./sales.types";

@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("sales")
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesSerializer: SalesSerializer,
  ) {}

  @ApiBody({ type: CreateSaleDto })
  @Post("buy")
  async buyProduct(
    @Body() dto: CreateSaleDto,
    @CurrentUser() currentUser: User,
  ): Promise<SaleResponse> {
    const sale = await this.salesService.buyProduct(dto, currentUser.id);
    return this.salesSerializer.serialize(sale);
  }

  @Get("bought/:userId")
  async getBoughtByUser(
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = DEFAULT_SALES_PAGE_SIZE,
  ): Promise<SalesListResponse> {
    const [sales, totalCount] = await this.salesService.getBoughtByUser(
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
      data: this.salesSerializer.serializeMany(sales),
      meta,
    };
  }

  @Get("sold/:userId")
  async getSoldByUser(
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = DEFAULT_SALES_PAGE_SIZE,
  ): Promise<SalesListResponse> {
    const [sales, totalCount] = await this.salesService.getSoldByUser(
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
      data: this.salesSerializer.serializeMany(sales),
      meta,
    };
  }
}
