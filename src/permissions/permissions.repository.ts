import { Injectable } from "@nestjs/common";

import type { Permission } from "@/common/entities/permissions.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class PermissionsRepository extends CustomSQLBaseRepository<Permission> {}
