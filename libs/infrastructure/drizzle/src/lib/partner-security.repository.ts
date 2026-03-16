import { and, eq, lt } from 'drizzle-orm';
import type {
  PartnerSecurityRepositoryPort,
  RecordApiUsageInput,
  ActiveCredentialSecret,
} from '@ultima-forma/domain-partner';
import { integrationCredentials, partnerApiNonces, partnerApiUsage } from './schema';
import type { DrizzleDB } from './drizzle.module';
import { decryptSecret } from './crypto.utils';

export class PartnerSecurityRepository
  implements PartnerSecurityRepositoryPort
{
  constructor(
    private readonly db: DrizzleDB,
    private readonly encryptionKey: string
  ) {}

  async findActiveCredentialSecret(
    partnerId: string
  ): Promise<ActiveCredentialSecret | null> {
    const rows = await this.db
      .select({
        credentialId: integrationCredentials.id,
        encryptedSecret: integrationCredentials.encryptedSecret,
      })
      .from(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.partnerId, partnerId),
          eq(integrationCredentials.status, 'active')
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row || !row.encryptedSecret) return null;

    try {
      const secret = decryptSecret(row.encryptedSecret, this.encryptionKey);
      return { credentialId: row.credentialId, secret };
    } catch {
      return null;
    }
  }

  async isNonceUsed(nonceHash: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: partnerApiNonces.id })
      .from(partnerApiNonces)
      .where(eq(partnerApiNonces.nonceHash, nonceHash))
      .limit(1);
    return rows.length > 0;
  }

  async storeNonce(
    partnerId: string,
    nonceHash: string,
    expiresAt: Date
  ): Promise<void> {
    await this.db.insert(partnerApiNonces).values({
      partnerId,
      nonceHash,
      expiresAt,
    });
  }

  async recordApiUsage(input: RecordApiUsageInput): Promise<void> {
    await this.db.insert(partnerApiUsage).values({
      partnerId: input.partnerId,
      route: input.route,
      method: input.method,
      statusCode: input.statusCode,
      correlationId: input.correlationId ?? null,
      responseTimeMs: input.responseTimeMs ?? null,
    });
  }

  async cleanExpiredNonces(): Promise<number> {
    const result = await this.db
      .delete(partnerApiNonces)
      .where(lt(partnerApiNonces.expiresAt, new Date()))
      .returning({ id: partnerApiNonces.id });
    return result.length;
  }
}
