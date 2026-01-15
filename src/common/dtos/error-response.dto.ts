import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: [], isArray: true })
  errors!: string[];

  @ApiProperty({ example: "Bad Request" })
  message!: string;
}
