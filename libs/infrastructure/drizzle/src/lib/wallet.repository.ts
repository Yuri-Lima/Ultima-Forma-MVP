import { and, eq } from 'drizzle-orm';
import type {
  CreateCredentialReferenceInput,
  CreatePresentationSessionInput,
  CreateUserSubjectInput,
  CredentialReference,
  PresentationSession,
  UserSubject,
  WalletRepositoryPort,
} from '@ultima-forma/domain-wallet';
import {
  credentialReferences,
  presentationSessions,
  userSubjects,
} from './schema';
import type { DrizzleDB } from './drizzle.module';

export class WalletRepository implements WalletRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async createUserSubject(input: CreateUserSubjectInput): Promise<UserSubject> {
    const [row] = await this.db
      .insert(userSubjects)
      .values({
        tenantId: input.tenantId,
        externalSubjectRef: input.externalSubjectRef,
      })
      .returning();
    if (!row) throw new Error('Failed to create user subject');
    return this.toSubject(row);
  }

  async findUserSubjectById(id: string): Promise<UserSubject | null> {
    const rows = await this.db
      .select()
      .from(userSubjects)
      .where(eq(userSubjects.id, id))
      .limit(1);
    return rows[0] ? this.toSubject(rows[0]) : null;
  }

  async findByTenantAndExternalRef(
    tenantId: string,
    externalSubjectRef: string
  ): Promise<UserSubject | null> {
    const rows = await this.db
      .select()
      .from(userSubjects)
      .where(
        and(
          eq(userSubjects.tenantId, tenantId),
          eq(userSubjects.externalSubjectRef, externalSubjectRef)
        )
      )
      .limit(1);
    return rows[0] ? this.toSubject(rows[0]) : null;
  }

  async createCredentialReference(
    input: CreateCredentialReferenceInput
  ): Promise<CredentialReference> {
    const [row] = await this.db
      .insert(credentialReferences)
      .values({
        userSubjectId: input.userSubjectId,
        issuerId: input.issuerId,
        claimDefinitionId: input.claimDefinitionId ?? null,
        externalCredentialRef: input.externalCredentialRef,
        issuedAt: input.issuedAt ?? null,
        expiresAt: input.expiresAt ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create credential reference');
    return this.toCredential(row);
  }

  async listCredentialsBySubject(
    userSubjectId: string
  ): Promise<CredentialReference[]> {
    const rows = await this.db
      .select()
      .from(credentialReferences)
      .where(eq(credentialReferences.userSubjectId, userSubjectId))
      .orderBy(credentialReferences.createdAt);
    return rows.map((r) => this.toCredential(r));
  }

  async createPresentationSession(
    input: CreatePresentationSessionInput
  ): Promise<PresentationSession> {
    const [row] = await this.db
      .insert(presentationSessions)
      .values({
        dataRequestId: input.dataRequestId,
        userSubjectId: input.userSubjectId,
      })
      .returning();
    if (!row) throw new Error('Failed to create presentation session');
    return this.toSession(row);
  }

  async findPresentationSessionById(
    id: string
  ): Promise<PresentationSession | null> {
    const rows = await this.db
      .select()
      .from(presentationSessions)
      .where(eq(presentationSessions.id, id))
      .limit(1);
    return rows[0] ? this.toSession(rows[0]) : null;
  }

  async completePresentationSession(
    id: string
  ): Promise<PresentationSession> {
    const now = new Date();
    const [row] = await this.db
      .update(presentationSessions)
      .set({ status: 'completed', completedAt: now })
      .where(eq(presentationSessions.id, id))
      .returning();
    if (!row) throw new Error('Presentation session not found');
    return this.toSession(row);
  }

  private toSubject(row: typeof userSubjects.$inferSelect): UserSubject {
    return {
      id: row.id,
      tenantId: row.tenantId,
      externalSubjectRef: row.externalSubjectRef,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toCredential(
    row: typeof credentialReferences.$inferSelect
  ): CredentialReference {
    return {
      id: row.id,
      userSubjectId: row.userSubjectId,
      issuerId: row.issuerId,
      claimDefinitionId: row.claimDefinitionId,
      externalCredentialRef: row.externalCredentialRef,
      status: row.status as CredentialReference['status'],
      issuedAt: row.issuedAt,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  }

  private toSession(
    row: typeof presentationSessions.$inferSelect
  ): PresentationSession {
    return {
      id: row.id,
      dataRequestId: row.dataRequestId,
      userSubjectId: row.userSubjectId,
      status: row.status as PresentationSession['status'],
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
    };
  }
}
