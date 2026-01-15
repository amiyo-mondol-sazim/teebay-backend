import { ApiProperty } from "@nestjs/swagger";

import { IsEmail, IsString, MinLength } from "class-validator";

import type { TokenizedUser } from "@/modules/users/users.dtos";

export class SignInDto {
  @ApiProperty({ example: "user@example.com" })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsString()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: "password123" })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class SendForgotPasswordEmailResponse {
  @ApiProperty({ example: "Password reset email sent successfully" })
  message!: string;
}

export class SignInResponse {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  accessToken!: string;
  user!: TokenizedUser;
}
