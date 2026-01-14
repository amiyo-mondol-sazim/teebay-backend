import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import { RentsRepository } from "@/modules/rents/rents.repository";

import { CustomBaseEntity } from "./custom-base.entity";
import { Product } from "./products.entity";
import { User } from "./users.entity";

@Entity({ tableName: "rents", repository: () => RentsRepository })
export class Rent extends CustomBaseEntity {
  [EntityRepositoryType]?: RentsRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => Product, { fieldName: "product_id" })
  product!: Product;

  @ManyToOne(() => User, { fieldName: "renter_id" })
  renter!: User;

  @ManyToOne(() => User, { fieldName: "owner_id" })
  owner!: User;

  @Property({ fieldName: "rent_price", type: "decimal", precision: 10, scale: 2 })
  rentPrice!: number;

  @Property({ fieldName: "start_date" })
  startDate!: Date;

  @Property({ fieldName: "end_date" })
  endDate!: Date;
}
