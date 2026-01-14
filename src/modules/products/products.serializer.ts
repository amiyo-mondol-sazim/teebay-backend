import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class ProductsSerializer extends AbstractBaseSerializer {
  protected serializeOneOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    populate: ["owner.userProfile"],
    exclude: [
      "owner.password",
      "owner.email",
      "owner.createdAt",
      "owner.updatedAt",
      "owner.userProfile.id",
      "owner.userProfile.role",
      "owner.userProfile.email",
      "owner.userProfile.createdAt",
      "owner.userProfile.updatedAt",
    ],
  };

  protected serializeManyOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["owner"],
  };
}
