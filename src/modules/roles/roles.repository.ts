import { Injectable } from "@nestjs/common";

import type { Role } from "@/common/entities/roles.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class RolesRepository extends CustomSQLBaseRepository<Role> {}
