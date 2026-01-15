import { ApiProperty } from "@nestjs/swagger";

import type { PermissionResponse } from "@/permissions/permissions.dtos";

export class RoleResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-15T12:00:00Z" })
  updatedAt!: Date;

  @ApiProperty({ example: "ADMIN" })
  name!: string;
}

export class RolesWithUsersCount {
  @ApiProperty({ type: () => RoleResponse })
  role!: RoleResponse;

  @ApiProperty({ example: 5 })
  activeUsersCount!: number;

  @ApiProperty({ example: 2 })
  inactiveUsersCount!: number;
}

export class RolesWithUsersAndPermissionsResponse {
  roles!: RolesWithUsersCount[];
  permissions!: PermissionResponse[];
}

export class UpdateRolesPermissionsDto {
  @ApiProperty({ example: 1 })
  roleId!: number;

  @ApiProperty({ example: [1, 2], isArray: true })
  permissionsToRemoveIds!: number[];

  @ApiProperty({ example: [3, 4], isArray: true })
  permissionsToAddIds!: number[];
}
