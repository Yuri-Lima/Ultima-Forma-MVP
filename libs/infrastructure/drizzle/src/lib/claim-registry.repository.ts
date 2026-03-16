import { and, eq, inArray, sql } from 'drizzle-orm';
import type {
  AssignClaimPermissionInput,
  ClaimDefinition,
  ClaimDefinitionVersion,
  ClaimPermission,
  ClaimRegistryRepositoryPort,
  CreateClaimDefinitionInput,
  CreateClaimVersionInput,
  ListClaimsFilters,
} from '@ultima-forma/domain-claims';
import {
  claimDefinitions,
  claimDefinitionVersions,
  partnerClaimPermissions,
} from './schema';
import type { DrizzleDB } from './drizzle.module';

export class ClaimRegistryRepository implements ClaimRegistryRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async findClaimByKey(key: string): Promise<ClaimDefinition | null> {
    const rows = await this.db
      .select()
      .from(claimDefinitions)
      .where(eq(claimDefinitions.key, key))
      .limit(1);
    return rows[0] ? this.toDefinition(rows[0]) : null;
  }

  async findClaimById(id: string): Promise<ClaimDefinition | null> {
    const rows = await this.db
      .select()
      .from(claimDefinitions)
      .where(eq(claimDefinitions.id, id))
      .limit(1);
    return rows[0] ? this.toDefinition(rows[0]) : null;
  }

  async listClaims(filters?: ListClaimsFilters): Promise<ClaimDefinition[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.namespace) {
      conditions.push(eq(claimDefinitions.namespace, filters.namespace));
    }
    if (filters?.sensitivityLevel) {
      conditions.push(
        eq(claimDefinitions.sensitivityLevel, filters.sensitivityLevel)
      );
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select()
      .from(claimDefinitions)
      .where(whereClause)
      .orderBy(claimDefinitions.namespace, claimDefinitions.key);

    return rows.map((r) => this.toDefinition(r));
  }

  async createClaimDefinition(
    input: CreateClaimDefinitionInput
  ): Promise<ClaimDefinition> {
    const [row] = await this.db
      .insert(claimDefinitions)
      .values({
        key: input.key,
        namespace: input.namespace,
        displayName: input.displayName,
        description: input.description ?? null,
        sensitivityLevel: input.sensitivityLevel,
      })
      .returning();

    if (!row) throw new Error('Failed to create claim definition');
    return this.toDefinition(row);
  }

  async createClaimVersion(
    input: CreateClaimVersionInput
  ): Promise<ClaimDefinitionVersion> {
    const maxResult = await this.db
      .select({ max: sql<number>`coalesce(max(${claimDefinitionVersions.version}), 0)` })
      .from(claimDefinitionVersions)
      .where(
        eq(claimDefinitionVersions.claimDefinitionId, input.claimDefinitionId)
      );
    const nextVersion = (maxResult[0]?.max ?? 0) + 1;

    const [row] = await this.db
      .insert(claimDefinitionVersions)
      .values({
        claimDefinitionId: input.claimDefinitionId,
        version: nextVersion,
        jsonSchema: input.jsonSchema,
      })
      .returning();

    if (!row) throw new Error('Failed to create claim version');
    return this.toVersion(row);
  }

  async findLatestVersion(
    claimDefinitionId: string
  ): Promise<ClaimDefinitionVersion | null> {
    const rows = await this.db
      .select()
      .from(claimDefinitionVersions)
      .where(eq(claimDefinitionVersions.claimDefinitionId, claimDefinitionId))
      .orderBy(sql`${claimDefinitionVersions.version} desc`)
      .limit(1);
    return rows[0] ? this.toVersion(rows[0]) : null;
  }

  async assignPermission(
    input: AssignClaimPermissionInput
  ): Promise<ClaimPermission> {
    const [row] = await this.db
      .insert(partnerClaimPermissions)
      .values({
        partnerId: input.partnerId,
        claimDefinitionId: input.claimDefinitionId,
        permissionType: input.permissionType,
      })
      .returning();

    if (!row) throw new Error('Failed to assign claim permission');
    return this.toPermission(row);
  }

  async findPermissions(
    partnerId: string,
    claimDefinitionIds: string[]
  ): Promise<ClaimPermission[]> {
    if (claimDefinitionIds.length === 0) return [];

    const rows = await this.db
      .select()
      .from(partnerClaimPermissions)
      .where(
        and(
          eq(partnerClaimPermissions.partnerId, partnerId),
          inArray(partnerClaimPermissions.claimDefinitionId, claimDefinitionIds)
        )
      );

    return rows.map((r) => this.toPermission(r));
  }

  async findClaimsByKeys(keys: string[]): Promise<ClaimDefinition[]> {
    if (keys.length === 0) return [];

    const rows = await this.db
      .select()
      .from(claimDefinitions)
      .where(inArray(claimDefinitions.key, keys));

    return rows.map((r) => this.toDefinition(r));
  }

  private toDefinition(
    row: typeof claimDefinitions.$inferSelect
  ): ClaimDefinition {
    return {
      id: row.id,
      key: row.key,
      namespace: row.namespace,
      displayName: row.displayName,
      description: row.description,
      sensitivityLevel: row.sensitivityLevel as ClaimDefinition['sensitivityLevel'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toVersion(
    row: typeof claimDefinitionVersions.$inferSelect
  ): ClaimDefinitionVersion {
    return {
      id: row.id,
      claimDefinitionId: row.claimDefinitionId,
      version: row.version,
      jsonSchema: row.jsonSchema as Record<string, unknown>,
      status: row.status as ClaimDefinitionVersion['status'],
      createdAt: row.createdAt,
    };
  }

  private toPermission(
    row: typeof partnerClaimPermissions.$inferSelect
  ): ClaimPermission {
    return {
      id: row.id,
      partnerId: row.partnerId,
      claimDefinitionId: row.claimDefinitionId,
      permissionType: row.permissionType as ClaimPermission['permissionType'],
      createdAt: row.createdAt,
    };
  }
}
