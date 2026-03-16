import { eq } from 'drizzle-orm';
import type {
  ConsentPolicy,
  ConsentPolicyRepositoryPort,
  CreateConsentPolicyInput,
} from '@ultima-forma/domain-consent';
import { consentPolicies } from './schema';
import type { DrizzleDB } from './drizzle.module';

export class ConsentPolicyRepository implements ConsentPolicyRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async findPolicyByTenantId(tenantId: string): Promise<ConsentPolicy | null> {
    const rows = await this.db
      .select()
      .from(consentPolicies)
      .where(eq(consentPolicies.tenantId, tenantId))
      .limit(1);
    const row = rows[0];
    return row ? this.toPolicy(row) : null;
  }

  async findPolicyById(id: string): Promise<ConsentPolicy | null> {
    const rows = await this.db
      .select()
      .from(consentPolicies)
      .where(eq(consentPolicies.id, id))
      .limit(1);
    const row = rows[0];
    return row ? this.toPolicy(row) : null;
  }

  async createPolicy(input: CreateConsentPolicyInput): Promise<ConsentPolicy> {
    const [row] = await this.db
      .insert(consentPolicies)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        maxDurationHours: input.maxDurationHours,
        allowedClaims: input.allowedClaims,
        jurisdiction: input.jurisdiction ?? null,
      })
      .returning();

    if (!row) throw new Error('Failed to create consent policy');
    return this.toPolicy(row);
  }

  private toPolicy(
    row: typeof consentPolicies.$inferSelect
  ): ConsentPolicy {
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      maxDurationHours: row.maxDurationHours,
      allowedClaims: (row.allowedClaims as string[]) ?? [],
      jurisdiction: row.jurisdiction,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
