import { Injectable } from "@nestjs/common";

import { Rent } from "@/common/entities/rents.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class RentsRepository extends CustomSQLBaseRepository<Rent> {
  createOne(rentData: Partial<Rent>) {
    const rent = new Rent();
    this.em.assign(rent, rentData);
    this.em.persist(rent);
    return rent;
  }

  getBorrowsByUserId(renterId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("r")
      .select("*")
      .leftJoinAndSelect("r.product", "p")
      .leftJoinAndSelect("r.renter", "rent")
      .leftJoinAndSelect("rent.userProfile", "rp")
      .leftJoinAndSelect("r.owner", "o")
      .leftJoinAndSelect("o.userProfile", "op")
      .where({ renter: renterId })
      .orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  getLentByUserId(ownerId: number, page: number, limit: number) {
    const qb = this.createQueryBuilder("r")
      .select("*")
      .leftJoinAndSelect("r.product", "p")
      .leftJoinAndSelect("r.renter", "rent")
      .leftJoinAndSelect("rent.userProfile", "rp")
      .leftJoinAndSelect("r.owner", "o")
      .leftJoinAndSelect("o.userProfile", "op")
      .where({ owner: ownerId })
      .orderBy({ createdAt: "DESC" });
    return this.retrievePaginatedRecordsByLimitAndOffset({ qb, page, limit });
  }

  findOverlappingRent(productId: number, startDate: Date, endDate: Date): Promise<Rent | null> {
    return this.findOne({
      product: productId,
      $and: [{ startDate: { $lt: endDate } }, { endDate: { $gt: startDate } }],
    });
  }
}
