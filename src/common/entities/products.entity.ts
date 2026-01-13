import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { ProductsRepository } from "@/modules/products/products.repository";

import { ERentalPeriod } from "../enums/products.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";
@Entity({ tableName: "products", repository: () => ProductsRepository })
export class Product extends CustomBaseEntity {
  [EntityRepositoryType]?: ProductsRepository;
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ fieldName: "title" })
  title!: string;

  @Property({ fieldName: "description", type: "text" })
  description!: string;

  @Property({ fieldName: "categories", type: "text[]" })
  categories!: string[];

  @Property({ fieldName: "purchase_price", type: "decimal", precision: 10, scale: 2 })
  purchasePrice!: number;

  @Property({ fieldName: "rent_price", type: "decimal", precision: 10, scale: 2 })
  rentPrice!: number;

  @Property({ fieldName: "rental_period", type: "text" })
  rentalPeriod!: ERentalPeriod;

  @Property({ fieldName: "view_count", default: 0 })
  viewCount: number = 0;

  @ManyToOne(() => User, { fieldName: "owner_id" })
  owner!: User;
}
