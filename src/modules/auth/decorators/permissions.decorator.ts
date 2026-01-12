import { SetMetadata } from "@nestjs/common";

import type { EPermission } from "@/common/enums/roles.enums";

export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: EPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
