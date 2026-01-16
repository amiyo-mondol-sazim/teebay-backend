import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class SalesSerializer extends AbstractBaseSerializer {
  protected serializeOneOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    populate: ["product", "buyer", "seller", "buyer.userProfile", "seller.userProfile"],
    exclude: [
      "product.sale",
      "product.owner",
      "buyer.password",
      "seller.password",
      "buyer.createdAt",
      "seller.createdAt",
      "buyer.updatedAt",
      "buyer.userProfile.role",
      "buyer.userProfile.createdAt",
      "buyer.userProfile.email",
      "buyer.userProfile.updatedAt",
      "seller.userProfile.role",
      "seller.userProfile.createdAt",
      "seller.userProfile.email",
      "seller.userProfile.updatedAt",
      "seller.updatedAt",
    ],
  };

  protected serializeManyOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    populate: ["product", "buyer", "seller", "buyer.userProfile", "seller.userProfile"],
    exclude: [
      "product.sale",
      "product.owner",
      "buyer.password",
      "seller.password",
      "buyer.createdAt",
      "seller.createdAt",
      "buyer.updatedAt",
      "buyer.userProfile.role",
      "buyer.userProfile.createdAt",
      "buyer.userProfile.email",
      "buyer.userProfile.updatedAt",
      "seller.userProfile.role",
      "seller.userProfile.createdAt",
      "seller.userProfile.email",
      "seller.userProfile.updatedAt",
      "seller.updatedAt",
    ],
  };
}
