import { ApiProperty } from "@nestjs/swagger";

import {
  EVerificationRequestStatus,
  EVerificationRequestType,
} from "@/common/enums/verification-requests.enums";

export class VerifyByTokenResponse {
  @ApiProperty({ example: "Verification successful" })
  message!: string;
}

export class VerificationRequestResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  updatedAt!: Date;

  @ApiProperty({ example: "token_abc_123" })
  token!: string;

  @ApiProperty({
    enum: EVerificationRequestStatus,
    enumName: "EVerificationRequestStatus",
    example: EVerificationRequestStatus.ACTIVE,
  })
  status!: EVerificationRequestStatus;

  @ApiProperty({
    enum: EVerificationRequestType,
    enumName: "EVerificationRequestType",
    example: EVerificationRequestType.EMAIL_VERIFICATION,
  })
  type!: EVerificationRequestType;

  @ApiProperty({ example: { id: 1 } })
  user!: { id: number };
}
