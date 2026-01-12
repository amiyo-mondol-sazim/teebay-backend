import { SetMetadata } from "@nestjs/common";

import type { EUserRole } from "@/common/enums/roles.enums";

export const ROLES_KEY = "roles";
export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES_KEY, roles);
