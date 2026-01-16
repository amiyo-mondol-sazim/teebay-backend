import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class RentsSerializer extends AbstractBaseSerializer {
  protected serializeOneOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    populate: ["product", "renter", "owner", "renter.userProfile", "owner.userProfile"],
    exclude: [
      "product.sale",
      "product.owner",
      "renter.password",
      "owner.password",
      "renter.createdAt",
      "owner.createdAt",
      "renter.updatedAt",
      "renter.userProfile.role",
      "renter.userProfile.createdAt",
      "renter.userProfile.email",
      "renter.userProfile.updatedAt",
      "owner.userProfile.role",
      "owner.userProfile.createdAt",
      "owner.userProfile.email",
      "owner.userProfile.updatedAt",
      "owner.updatedAt",
    ],
  };

  protected serializeManyOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    populate: ["product", "renter", "owner", "renter.userProfile", "owner.userProfile"],
    exclude: [
      "product.sale",
      "product.owner",
      "renter.password",
      "owner.password",
      "renter.createdAt",
      "owner.createdAt",
      "renter.updatedAt",
      "renter.userProfile.role",
      "renter.userProfile.createdAt",
      "renter.userProfile.email",
      "renter.userProfile.updatedAt",
      "owner.userProfile.role",
      "owner.userProfile.createdAt",
      "owner.userProfile.email",
      "owner.userProfile.updatedAt",
      "owner.updatedAt",
    ],
  };
}
