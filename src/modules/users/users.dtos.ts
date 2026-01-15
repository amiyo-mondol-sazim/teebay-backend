import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";

import { Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";

import { PaginatedResponse, PaginationArgsDto } from "@/common/dtos/pagination.dtos";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import type { ITokenizedUser } from "@/modules/auth/auth.interfaces";

import {
  SelfRegisterUserProfileDto,
  UserProfileDto,
  UserProfileResponse,
} from "../user-profiles/user-profiles.dtos";

export class RegisterUserDto implements Pick<User, "email" | "password"> {
  @ApiProperty({ example: "user@example.com" })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123", required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string = process.env.DEFAULT_PASSWORD as string;

  @ApiProperty({ type: () => UserProfileDto })
  @IsObject()
  @ValidateNested()
  @Type(() => UserProfileDto)
  userProfile!: UserProfileDto;
}

export class SelfRegisterUserDto extends OmitType(RegisterUserDto, ["userProfile"]) {
  @IsObject()
  @ValidateNested()
  @Type(() => SelfRegisterUserProfileDto)
  userProfile!: SelfRegisterUserProfileDto;
}

export class UpdateUserDto extends PickType(PartialType(RegisterUserDto), ["password"]) {}

export class UpdateUserAsSuperuserDto extends UpdateUserDto {
  @IsOptional()
  @IsEnum(EUserState)
  @ApiProperty({ enum: EUserState, enumName: "EUserState", example: EUserState.ACTIVE })
  state?: EUserState;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1 })
  roleId?: number;
}

export class SuperuserFindAllUsersParams extends PaginationArgsDto {
  @ApiProperty({ enum: EUserState, enumName: "EUserState" })
  @IsOptional()
  @IsEnum(EUserState)
  state?: EUserState;
}

export class UserResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  updatedAt!: Date;

  @ApiProperty({ type: () => UserProfileResponse })
  userProfile!: UserProfileResponse;
}

export class SuperuserUserResponse extends UserResponse {
  @ApiProperty({ enum: EUserState, enumName: "EUserState" })
  state!: EUserState;
}

export class TokenizedUser implements ITokenizedUser {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  claimId!: number;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole", example: EUserRole.ADMIN })
  claim!: EUserRole;

  @ApiProperty({ example: 1 })
  userProfileId!: number;

  @ApiProperty({ example: "user@example.com" })
  email!: string;
}

export class SuperuserFindAllUserResponse extends PaginatedResponse {
  data!: SuperuserUserResponse[];
}
