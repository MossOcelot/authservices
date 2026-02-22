export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function buildPaginationOptions(
  page: number,
  limit: number,
): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
