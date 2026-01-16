import type { EntityManager } from "@mikro-orm/postgresql";

export async function acquireLock(productId: number, em: EntityManager): Promise<boolean> {
  const result = await em.execute(`SELECT pg_try_advisory_xact_lock(${productId})`);
  return result?.[0]?.pg_try_advisory_xact_lock ?? false;
}
