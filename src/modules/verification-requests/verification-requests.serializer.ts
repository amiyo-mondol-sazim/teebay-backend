import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";
import type { TSerializationOptions } from "@/common/serializers/abstract-base-serializer.types";

@Injectable()
export class VerificationRequestsSerializer extends AbstractBaseSerializer {
  override serializeOneOptions: TSerializationOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["expiresAt"],
  };
}
