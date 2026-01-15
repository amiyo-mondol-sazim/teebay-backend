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
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { computePaginationMetadata } from "@/utils/pagination";

import { DEFAULT_PRODUCTS_PAGE_SIZE } from "./products.constants";
import { CreateProductDto, UpdateProductDto } from "./products.dtos";
import { ProductsSerializer } from "./products.serializer";
import { ProductsService } from "./products.service";
import type { ProductResponse, ProductsListResponse } from "./products.types";

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
  @ApiQuery({ name: "categories", required: false, type: String })
  async getAll(
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = DEFAULT_PRODUCTS_PAGE_SIZE,
    @Query("categories") categoriesParam?: string,
  ): Promise<ProductsListResponse> {
    const categories = categoriesParam
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const [products, totalCount] = await this.productsService.getAll(page, limit, categories);
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
