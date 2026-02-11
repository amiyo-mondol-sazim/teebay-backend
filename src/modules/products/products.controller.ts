import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiQuery } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { EProductStatus } from "@/common/enums/products.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { computePaginationMetadata } from "@/utils/pagination";

import { DEFAULT_PRODUCTS_PAGE_SIZE } from "./products.constants";
import { CreateProductDto, GetProductsQueryDto, UpdateProductDto } from "./products.dtos";
import { ProductsSerializer } from "./products.serializer";
import { ProductsService } from "./products.service";
import type { ProductFilters, ProductResponse, ProductsListResponse } from "./products.types";

@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsSerializer: ProductsSerializer,
  ) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "status", required: false, enum: EProductStatus, enumName: "EProductStatus" })
  @ApiQuery({ name: "minPurchasePrice", required: false, type: Number })
  @ApiQuery({ name: "maxPurchasePrice", required: false, type: Number })
  @ApiQuery({ name: "minRentPrice", required: false, type: Number })
  @ApiQuery({ name: "maxRentPrice", required: false, type: Number })
  @ApiQuery({ name: "categories", required: false, type: String })
  async getAll(
    @Query() queryDto: GetProductsQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<ProductsListResponse> {
    const categories = queryDto.categories
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const filters: ProductFilters = {
      status: queryDto.status,
      categories,
      minPurchasePrice: queryDto.minPurchasePrice,
      maxPurchasePrice: queryDto.maxPurchasePrice,
      minRentPrice: queryDto.minRentPrice,
      maxRentPrice: queryDto.maxRentPrice,
      excludeOwnerId: currentUser.id,
    };

    const [products, totalCount] = await this.productsService.getAll(
      queryDto.page!,
      queryDto.limit!,
      filters,
    );

    const meta = computePaginationMetadata({
      page: queryDto.page!,
      limit: queryDto.limit!,
      totalItems: totalCount,
    });

    return {
      data: this.productsSerializer.serializeMany(products),
      meta,
    };
  }

  @Get("owner/:ownerId")
  async getByOwner(
    @Param("ownerId", ParseIntPipe) ownerId: number,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = DEFAULT_PRODUCTS_PAGE_SIZE,
  ): Promise<ProductsListResponse> {
    const [products, totalCount] = await this.productsService.getAllByOwnerId(ownerId, page, limit);
    const meta = computePaginationMetadata({
      page,
      limit,
      totalItems: totalCount,
    });
    return {
      data: this.productsSerializer.serializeMany(products),
      meta,
    };
  }

  @Get(":id")
  async getOneById(@Param("id", ParseIntPipe) id: number): Promise<ProductResponse> {
    const product = await this.productsService.getOneById(id);
    return this.productsSerializer.serialize(product);
  }

  @ApiBody({ type: CreateProductDto })
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() currentUser: User,
  ): Promise<ProductResponse> {
    const product = await this.productsService.createOne(dto, currentUser.id);
    return this.productsSerializer.serialize(product);
  }

  @ApiBody({ type: UpdateProductDto })
  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() currentUser: User,
  ): Promise<ProductResponse> {
    const product = await this.productsService.updateOne(id, dto, currentUser.id);
    return this.productsSerializer.serialize(product);
  }

  @Delete(":id")
  async delete(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.productsService.deleteOne(id, currentUser.id);
  }

  @Patch(":id/views")
  async incrementViews(@Param("id", ParseIntPipe) id: number): Promise<ProductResponse> {
    const product = await this.productsService.incrementViews(id);
    return this.productsSerializer.serialize(product);
  }
}
