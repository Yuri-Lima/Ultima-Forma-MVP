import { Module } from '@nestjs/common';
import type {
  PartnerRepositoryPort,
  PartnerSecurityRepositoryPort,
} from '@ultima-forma/domain-partner';
import type { ConsentRepositoryPort, ConsentPolicyRepositoryPort } from '@ultima-forma/domain-consent';
import type { ClaimRegistryRepositoryPort } from '@ultima-forma/domain-claims';
import type { WalletRepositoryPort } from '@ultima-forma/domain-wallet';
import type {
  AuditRepositoryPort,
  BillableEventRepositoryPort,
} from '@ultima-forma/domain-audit';
import {
  CreateConsumerUseCase,
  CreateIssuerUseCase,
  RotateIntegrationCredentialUseCase,
  UpdateConsumerUseCase,
  UpdateIssuerUseCase,
  ValidatePartnerSignatureUseCase,
  RegisterPartnerApiUsageUseCase,
  GetPartnerDashboardUseCase,
  ListPartnerRequestsUseCase,
  ManagePartnerWebhooksUseCase,
} from '@ultima-forma/application-partner';
import type { PartnerDashboardRepositoryPort } from '@ultima-forma/domain-partner';
import {
  CreateDataRequestUseCase,
  ApproveConsentUseCase,
  RejectConsentUseCase,
  ExpireRequestUseCase,
  GetDataRequestForUserUseCase,
  GetDataRequestResultForConsumerUseCase,
  RevokeConsentUseCase,
  GetConsentDetailUseCase,
  GetConsentHistoryUseCase,
  ValidateConsentPolicyUseCase,
} from '@ultima-forma/application-consent';
import {
  RegisterClaimDefinitionUseCase,
  ListClaimDefinitionsUseCase,
  ValidateClaimsAgainstRegistryUseCase,
  AssignClaimPermissionUseCase,
} from '@ultima-forma/application-claims';
import {
  RegisterUserSubjectUseCase,
  RegisterCredentialReferenceUseCase,
  CreatePresentationSessionUseCase,
  CompletePresentationSessionUseCase,
} from '@ultima-forma/application-wallet';
import type {
  WebhookDispatcherPort,
  WebhookSubscriptionRepositoryPort,
  WebhookDeliveryRepositoryPort,
} from '@ultima-forma/domain-webhook';
import type { JobRepositoryPort } from '@ultima-forma/domain-jobs';
import {
  DRIZZLE,
  type DrizzleDB,
  PartnerRepository,
  ConsentRepository,
  AuditRepository,
  BillableEventRepository,
  WebhookSubscriptionRepository,
  WebhookDeliveryRepository,
  PartnerSecurityRepository,
  ConsentPolicyRepository,
  ClaimRegistryRepository,
  PartnerDashboardRepository,
  WalletRepository,
  WebhookDispatcher,
  IngestRepository,
} from '@ultima-forma/infrastructure-drizzle';
import {
  AsyncWebhookDispatcher,
  JOB_REPOSITORY,
} from '@ultima-forma/infrastructure-queue';
import { getConfig } from '@ultima-forma/shared-config';
import { IssuersController } from './issuers.controller';
import { ConsumersController } from './consumers.controller';
import { IntegrationCredentialsController } from './integration-credentials.controller';
import { DataRequestsController } from './data-requests.controller';
import { ConsentsController } from './consents.controller';
import { ClaimsController } from './claims.controller';
import { PartnerController } from './partner.controller';
import { SubjectsController } from './subjects.controller';
import { PresentationsController } from './presentations.controller';
import { IngestController } from './ingest.controller';
import { ClientsController } from './clients.controller';
import {
  PartnerSignatureGuard,
  VALIDATE_PARTNER_SIGNATURE,
  REGISTER_PARTNER_API_USAGE,
  FEATURE_FLAG_SERVICE,
} from '../guards/partner-signature.guard';
import { FeatureFlagService } from '@ultima-forma/infrastructure-feature-flags';
import {
  PARTNER_REPOSITORY,
  PARTNER_SECURITY_REPOSITORY,
  CONSENT_REPOSITORY,
  CONSENT_POLICY_REPOSITORY,
  REVOKE_CONSENT,
  GET_CONSENT_DETAIL,
  GET_CONSENT_HISTORY,
  VALIDATE_CONSENT_POLICY,
  CLAIM_REGISTRY_REPOSITORY,
  REGISTER_CLAIM_DEFINITION,
  LIST_CLAIM_DEFINITIONS,
  VALIDATE_CLAIMS_AGAINST_REGISTRY,
  ASSIGN_CLAIM_PERMISSION,
  PARTNER_DASHBOARD_REPOSITORY,
  GET_PARTNER_DASHBOARD,
  LIST_PARTNER_REQUESTS,
  MANAGE_PARTNER_WEBHOOKS,
  WALLET_REPOSITORY,
  REGISTER_USER_SUBJECT,
  REGISTER_CREDENTIAL_REFERENCE,
  CREATE_PRESENTATION_SESSION,
  COMPLETE_PRESENTATION_SESSION,
  AUDIT_REPOSITORY,
  BILLABLE_EVENT_REPOSITORY,
  WEBHOOK_SUBSCRIPTION_REPOSITORY,
  WEBHOOK_DELIVERY_REPOSITORY,
  INGEST_REPOSITORY,
} from './tokens';

export {
  REVOKE_CONSENT,
  GET_CONSENT_DETAIL,
  GET_CONSENT_HISTORY,
  REGISTER_CLAIM_DEFINITION,
  LIST_CLAIM_DEFINITIONS,
  ASSIGN_CLAIM_PERMISSION,
  REGISTER_USER_SUBJECT,
  REGISTER_CREDENTIAL_REFERENCE,
  CREATE_PRESENTATION_SESSION,
  COMPLETE_PRESENTATION_SESSION,
  WALLET_REPOSITORY,
  GET_PARTNER_DASHBOARD,
  LIST_PARTNER_REQUESTS,
  MANAGE_PARTNER_WEBHOOKS,
} from './tokens';

@Module({
  imports: [],
  controllers: [
    IssuersController,
    ConsumersController,
    IntegrationCredentialsController,
    DataRequestsController,
    ConsentsController,
    ClaimsController,
    PartnerController,
    SubjectsController,
    PresentationsController,
    IngestController,
    ClientsController,
  ],
  exports: [PartnerSignatureGuard],
  providers: [
    {
      provide: PARTNER_REPOSITORY,
      useFactory: (db: DrizzleDB) => new PartnerRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: WEBHOOK_SUBSCRIPTION_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookSubscriptionRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: WEBHOOK_DELIVERY_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WebhookDeliveryRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: WebhookDispatcher,
      useFactory: (
        subRepo: WebhookSubscriptionRepositoryPort,
        delRepo: WebhookDeliveryRepositoryPort,
        jobRepo: JobRepositoryPort
      ) => new AsyncWebhookDispatcher(subRepo, delRepo, jobRepo),
      inject: [
        WEBHOOK_SUBSCRIPTION_REPOSITORY,
        WEBHOOK_DELIVERY_REPOSITORY,
        JOB_REPOSITORY,
      ],
    },
    {
      provide: CreateIssuerUseCase,
      useFactory: (repo: PartnerRepositoryPort) => new CreateIssuerUseCase(repo),
      inject: [PARTNER_REPOSITORY],
    },
    {
      provide: CreateConsumerUseCase,
      useFactory: (repo: PartnerRepositoryPort) =>
        new CreateConsumerUseCase(repo),
      inject: [PARTNER_REPOSITORY],
    },
    {
      provide: UpdateIssuerUseCase,
      useFactory: (
        repo: PartnerRepositoryPort,
        auditRepo: AuditRepositoryPort,
        dispatcher: WebhookDispatcherPort
      ) => new UpdateIssuerUseCase(repo, auditRepo, dispatcher),
      inject: [PARTNER_REPOSITORY, AUDIT_REPOSITORY, WebhookDispatcher],
    },
    {
      provide: UpdateConsumerUseCase,
      useFactory: (
        repo: PartnerRepositoryPort,
        auditRepo: AuditRepositoryPort,
        dispatcher: WebhookDispatcherPort
      ) => new UpdateConsumerUseCase(repo, auditRepo, dispatcher),
      inject: [PARTNER_REPOSITORY, AUDIT_REPOSITORY, WebhookDispatcher],
    },
    {
      provide: RotateIntegrationCredentialUseCase,
      useFactory: (repo: PartnerRepositoryPort) => {
        const config = getConfig();
        return new RotateIntegrationCredentialUseCase(
          repo,
          config.credentialEncryptionKey || undefined
        );
      },
      inject: [PARTNER_REPOSITORY],
    },
    {
      provide: PARTNER_SECURITY_REPOSITORY,
      useFactory: (db: DrizzleDB) => {
        const config = getConfig();
        return new PartnerSecurityRepository(db, config.credentialEncryptionKey);
      },
      inject: [DRIZZLE],
    },
    {
      provide: VALIDATE_PARTNER_SIGNATURE,
      useFactory: (
        securityRepo: PartnerSecurityRepositoryPort,
        partnerRepo: PartnerRepositoryPort
      ) => new ValidatePartnerSignatureUseCase(securityRepo, partnerRepo),
      inject: [PARTNER_SECURITY_REPOSITORY, PARTNER_REPOSITORY],
    },
    {
      provide: REGISTER_PARTNER_API_USAGE,
      useFactory: (securityRepo: PartnerSecurityRepositoryPort) =>
        new RegisterPartnerApiUsageUseCase(securityRepo),
      inject: [PARTNER_SECURITY_REPOSITORY],
    },
    {
      provide: FEATURE_FLAG_SERVICE,
      useFactory: () => new FeatureFlagService(),
    },
    PartnerSignatureGuard,
    {
      provide: CONSENT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new ConsentRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: AUDIT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new AuditRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: BILLABLE_EVENT_REPOSITORY,
      useFactory: (db: DrizzleDB) => new BillableEventRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: CreateDataRequestUseCase,
      useFactory: (
        consentRepo: ConsentRepositoryPort,
        partnerRepo: PartnerRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) =>
        new CreateDataRequestUseCase(consentRepo, partnerRepo, auditRepo),
      inject: [CONSENT_REPOSITORY, PARTNER_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: ApproveConsentUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort,
        billableRepo: BillableEventRepositoryPort
      ) => new ApproveConsentUseCase(repo, auditRepo, billableRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY, BILLABLE_EVENT_REPOSITORY],
    },
    {
      provide: RejectConsentUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) => new RejectConsentUseCase(repo, auditRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: ExpireRequestUseCase,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) => new ExpireRequestUseCase(repo, auditRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: GetDataRequestForUserUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetDataRequestForUserUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: GetDataRequestResultForConsumerUseCase,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetDataRequestResultForConsumerUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: CONSENT_POLICY_REPOSITORY,
      useFactory: (db: DrizzleDB) => new ConsentPolicyRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: REVOKE_CONSENT,
      useFactory: (
        repo: ConsentRepositoryPort,
        auditRepo: AuditRepositoryPort
      ) => new RevokeConsentUseCase(repo, auditRepo),
      inject: [CONSENT_REPOSITORY, AUDIT_REPOSITORY],
    },
    {
      provide: GET_CONSENT_DETAIL,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetConsentDetailUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: GET_CONSENT_HISTORY,
      useFactory: (repo: ConsentRepositoryPort) =>
        new GetConsentHistoryUseCase(repo),
      inject: [CONSENT_REPOSITORY],
    },
    {
      provide: VALIDATE_CONSENT_POLICY,
      useFactory: (policyRepo: ConsentPolicyRepositoryPort) =>
        new ValidateConsentPolicyUseCase(policyRepo),
      inject: [CONSENT_POLICY_REPOSITORY],
    },
    {
      provide: CLAIM_REGISTRY_REPOSITORY,
      useFactory: (db: DrizzleDB) => new ClaimRegistryRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: REGISTER_CLAIM_DEFINITION,
      useFactory: (repo: ClaimRegistryRepositoryPort) =>
        new RegisterClaimDefinitionUseCase(repo),
      inject: [CLAIM_REGISTRY_REPOSITORY],
    },
    {
      provide: LIST_CLAIM_DEFINITIONS,
      useFactory: (repo: ClaimRegistryRepositoryPort) =>
        new ListClaimDefinitionsUseCase(repo),
      inject: [CLAIM_REGISTRY_REPOSITORY],
    },
    {
      provide: VALIDATE_CLAIMS_AGAINST_REGISTRY,
      useFactory: (repo: ClaimRegistryRepositoryPort) =>
        new ValidateClaimsAgainstRegistryUseCase(repo),
      inject: [CLAIM_REGISTRY_REPOSITORY],
    },
    {
      provide: ASSIGN_CLAIM_PERMISSION,
      useFactory: (repo: ClaimRegistryRepositoryPort) =>
        new AssignClaimPermissionUseCase(repo),
      inject: [CLAIM_REGISTRY_REPOSITORY],
    },
    {
      provide: PARTNER_DASHBOARD_REPOSITORY,
      useFactory: (db: DrizzleDB) => new PartnerDashboardRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: GET_PARTNER_DASHBOARD,
      useFactory: (
        dashRepo: PartnerDashboardRepositoryPort,
        partnerRepo: PartnerRepositoryPort
      ) => new GetPartnerDashboardUseCase(dashRepo, partnerRepo),
      inject: [PARTNER_DASHBOARD_REPOSITORY, PARTNER_REPOSITORY],
    },
    {
      provide: LIST_PARTNER_REQUESTS,
      useFactory: (dashRepo: PartnerDashboardRepositoryPort) =>
        new ListPartnerRequestsUseCase(dashRepo),
      inject: [PARTNER_DASHBOARD_REPOSITORY],
    },
    {
      provide: MANAGE_PARTNER_WEBHOOKS,
      useFactory: (
        dashRepo: PartnerDashboardRepositoryPort,
        partnerRepo: PartnerRepositoryPort
      ) => new ManagePartnerWebhooksUseCase(dashRepo, partnerRepo),
      inject: [PARTNER_DASHBOARD_REPOSITORY, PARTNER_REPOSITORY],
    },
    {
      provide: WALLET_REPOSITORY,
      useFactory: (db: DrizzleDB) => new WalletRepository(db),
      inject: [DRIZZLE],
    },
    {
      provide: REGISTER_USER_SUBJECT,
      useFactory: (walletRepo: WalletRepositoryPort) =>
        new RegisterUserSubjectUseCase(walletRepo),
      inject: [WALLET_REPOSITORY],
    },
    {
      provide: REGISTER_CREDENTIAL_REFERENCE,
      useFactory: (walletRepo: WalletRepositoryPort) =>
        new RegisterCredentialReferenceUseCase(walletRepo),
      inject: [WALLET_REPOSITORY],
    },
    {
      provide: CREATE_PRESENTATION_SESSION,
      useFactory: (
        walletRepo: WalletRepositoryPort,
        consentRepo: ConsentRepositoryPort
      ) => new CreatePresentationSessionUseCase(walletRepo, consentRepo),
      inject: [WALLET_REPOSITORY, CONSENT_REPOSITORY],
    },
    {
      provide: COMPLETE_PRESENTATION_SESSION,
      useFactory: (walletRepo: WalletRepositoryPort) =>
        new CompletePresentationSessionUseCase(walletRepo),
      inject: [WALLET_REPOSITORY],
    },
    {
      provide: INGEST_REPOSITORY,
      useFactory: (db: DrizzleDB) => new IngestRepository(db),
      inject: [DRIZZLE],
    },
  ],
})
export class V1Module {}
