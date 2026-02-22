import { FindOptionsWhere, ILike } from 'typeorm';

export function buildFilterOptions<T extends object>(
  filters: Record<string, unknown>,
): FindOptionsWhere<T> {
  const where = {} as FindOptionsWhere<T>;

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    (where as Record<string, unknown>)[key] =
      typeof value === 'string' ? ILike(`%${value}%`) : value;
  }

  return where;
}
