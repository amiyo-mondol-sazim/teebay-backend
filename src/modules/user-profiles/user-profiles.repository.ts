import { Injectable } from "@nestjs/common";

import type { UserProfile } from "@/common/entities/user-profiles.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class UserProfilesRepository extends CustomSQLBaseRepository<UserProfile> {}
