import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsString, MaxLength, MinLength } from "class-validator";

import type { UserProfile } from "@/common/entities/user-profiles.entity";

import { RoleResponse } from "../roles/roles.dtos";

export class UserProfileDto implements Pick<UserProfile, "firstName" | "lastName"> {
  @ApiProperty({ example: "John" })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstName!: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastName!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  roleId!: number;
}

export class SelfRegisterUserProfileDto extends OmitType(UserProfileDto, ["roleId"]) {}

export class UpdateUserProfileDto extends OmitType(PartialType(UserProfileDto), ["roleId"]) {}

export class UserProfileResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  updatedAt!: Date;

  @ApiProperty({ example: "John" })
  firstName!: string;

  @ApiProperty({ example: "Doe" })
  lastName!: string;

  @ApiProperty({ example: "john.doe@example.com" })
  email!: string;

  @ApiProperty({ type: () => RoleResponse })
  role!: RoleResponse;
}
