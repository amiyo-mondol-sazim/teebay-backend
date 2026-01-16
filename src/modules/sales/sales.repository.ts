import { Injectable } from "@nestjs/common";

import { Sale } from "@/common/entities/sales.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class SalesRepository extends CustomSQLBaseRepository<Sale> {
  createOne(saleData: Partial<Sale>) {
    const sale = new Sale();
    this.em.assign(sale, saleData);
    this.em.persist(sale);
    return sale;
  }

  getBoughtByUserId(buyerId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("s")
      .select("*")
      .leftJoinAndSelect("s.product", "p")
      .leftJoinAndSelect("s.buyer", "b")
      .leftJoinAndSelect("b.userProfile", "bp")
      .leftJoinAndSelect("s.seller", "se")
      .leftJoinAndSelect("se.userProfile", "sp")
      .where({ buyer: buyerId })
      .orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  getSoldByUserId(sellerId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("s")
      .select("*")
      .leftJoinAndSelect("s.product", "p")
      .leftJoinAndSelect("s.buyer", "b")
      .leftJoinAndSelect("b.userProfile", "bp")
      .leftJoinAndSelect("s.seller", "se")
      .leftJoinAndSelect("se.userProfile", "sp")
      .where({ seller: sellerId })
      .orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }
}
