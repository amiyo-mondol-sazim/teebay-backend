import { User } from "@/common/entities/users.entity";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CurrentUser } from "@/modules/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
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
import type {
  CreateProductDto,
  ProductResponse,
  ProductsListResponse,
  UpdateProductDto,
} from "./products.dtos";
import { ProductsSerializer } from "./products.serializer";
import { ProductsService } from "./products.service";
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productsSerializer: ProductsSerializer,
  ) {}
  @Get(":id")
  async getOneById(@Param("id", ParseIntPipe) id: number): Promise<ProductResponse> {
    const product = await this.productsService.getOneById(id);
    return this.productsSerializer.serialize(product);
  }
  @Get()
  async getAll(
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
  ): Promise<ProductsListResponse> {
    const [products, totalCount] = await this.productsService.getAll(page, limit);
    return {
      data: products.map((p) => this.productsSerializer.serialize(p)),
      totalCount,
      page,
      limit,
    };
  }
  @Get("owner/:ownerId")
  async getByOwner(
    @Param("ownerId", ParseIntPipe) ownerId: number,
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
  ): Promise<ProductsListResponse> {
    const [products, totalCount] = await this.productsService.getAllByOwnerId(ownerId, page, limit);
    return {
      data: products.map((p) => this.productsSerializer.serialize(p)),
      totalCount,
      page,
      limit,
    };
  }
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() currentUser: User,
  ): Promise<ProductResponse> {
    const product = await this.productsService.createOne(dto, currentUser.id);
    return this.productsSerializer.serialize(product);
  }
  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    const product = await this.productsService.updateOne(id, dto);
    return this.productsSerializer.serialize(product);
  }
  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.productsService.deleteOne(id);
  }
  @Post(":id/views")
  async incrementViews(@Param("id", ParseIntPipe) id: number): Promise<ProductResponse> {
    const product = await this.productsService.incrementViews(id);
    return this.productsSerializer.serialize(product);
  }
}
