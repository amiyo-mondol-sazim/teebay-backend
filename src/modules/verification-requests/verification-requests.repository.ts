import { Injectable } from "@nestjs/common";

import type { VerificationRequest } from "@/common/entities/verification-requests.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class VerificationRequestsRepository extends CustomSQLBaseRepository<VerificationRequest> {}
