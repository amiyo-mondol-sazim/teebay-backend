import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { SalesRepository } from "@/modules/sales/sales.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Product } from "./products.entity";
import { User } from "./users.entity";

@Entity({ tableName: "sales", repository: () => SalesRepository })
export class Sale extends CustomBaseEntity {
  [EntityRepositoryType]?: SalesRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @OneToOne(() => Product, { fieldName: "product_id", owner: true })
  product!: Product;

  @ManyToOne(() => User, { fieldName: "buyer_id" })
  buyer!: User;

  @ManyToOne(() => User, { fieldName: "seller_id" })
  seller!: User;

  @Property({ fieldName: "price", type: "decimal", precision: 10, scale: 2 })
  price!: number;
}
