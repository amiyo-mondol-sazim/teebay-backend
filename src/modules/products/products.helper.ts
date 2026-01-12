import type { PaginationMetadataResponse } from "../../common/dtos/pagination.dtos";

export function createPaginationMeta(
  totalCount: number,
  page: number,
  limit: number,
): PaginationMetadataResponse {
  return {
    totalItems: totalCount,
    itemsPerPage: limit,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPreviousPage: page > 1,
  };
}
