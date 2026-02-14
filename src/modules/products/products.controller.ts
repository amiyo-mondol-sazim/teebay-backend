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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { computePaginationMetadata } from "@/utils/pagination";

import { DEFAULT_PRODUCTS_PAGE_SIZE } from "./products.constants";
import { CreateProductDto, GetProductsQueryDto, UpdateProductDto } from "./products.dtos";
import { ProductsSerializer } from "./products.serializer";
import { ProductsService } from "./products.service";
import type { ProductFilters, ProductResponse, ProductsListResponse } from "./products.types";

@ApiTags("Products")
@ApiBearerAuth()
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsSerializer: ProductsSerializer,
  ) {}

  @ApiOperation({ summary: "Get all products with filters" })
  @Get()
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

  @ApiOperation({ summary: "Get products by owner ID" })
  @ApiParam({ name: "ownerId", type: Number, description: "Owner user ID" })
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

  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({ name: "id", type: Number, description: "Product ID" })
  @Get(":id")
  async getOneById(@Param("id", ParseIntPipe) id: number): Promise<ProductResponse> {
    const product = await this.productsService.getOneById(id);
    return this.productsSerializer.serialize(product);
  }

  @ApiOperation({ summary: "Create a new product" })
  @ApiBody({ type: CreateProductDto })
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() currentUser: User,
  ): Promise<ProductResponse> {
    const product = await this.productsService.createOne(dto, currentUser.id);
    return this.productsSerializer.serialize(product);
  }

  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", type: Number, description: "Product ID" })
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

  @ApiOperation({ summary: "Delete a product" })
  @ApiParam({ name: "id", type: Number, description: "Product ID" })
  @Delete(":id")
  async delete(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    await this.productsService.deleteOne(id, currentUser.id);
  }

  @ApiOperation({ summary: "Increment product view count" })
  @ApiParam({ name: "id", type: Number, description: "Product ID" })
  @Patch(":id/views")
  async incrementViews(@Param("id", ParseIntPipe) id: number): Promise<ProductResponse> {
    const product = await this.productsService.incrementViews(id);
    return this.productsSerializer.serialize(product);
  }
}
