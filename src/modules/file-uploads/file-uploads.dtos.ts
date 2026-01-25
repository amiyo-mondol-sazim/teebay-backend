import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  ValidateNested,
} from "class-validator";

import { EAllowedMimeTypes } from "./file-uploads.enums";

export class PresignedUrlFile {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: EAllowedMimeTypes, enumName: "EAllowedMimeTypes" })
  @IsEnum(EAllowedMimeTypes)
  type!: EAllowedMimeTypes;

  @ApiProperty({ example: 5242880 })
  @IsNumber()
  @IsPositive()
  @Max(5 * 1024 * 1024) // 5MB
  maxSize!: number;
}

export class PresignedUrlFileDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PresignedUrlFile)
  files!: PresignedUrlFile[];
}

export class PresignedUrlResponse extends PresignedUrlFile {
  signedUrl!: string;
}
