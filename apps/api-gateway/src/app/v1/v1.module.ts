import { Module } from '@nestjs/common';
import type {
  PartnerRepositoryPort,
  PartnerSecurityRepositoryPort,
} from '@ultima-forma/domain-partner';
import type { ConsentRepositoryPort } from '@ultima-forma/domain-consent';
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
  RegisterClaimDefinitionUseCase,
  ListClaimDefinitionsUseCase,
  ValidateClaimsAgainstRegistryUseCase,
  AssignClaimPermissionUseCase,
  RegisterUserSubjectUseCase,
  RegisterCredentialReferenceUseCase,
  CreatePresentationSessionUseCase,
  CompletePresentationSessionUseCase,
} from '@ultima-forma/application-consent';
import type { WalletRepositoryPort } from '@ultima-forma/domain-consent';
import type {
  ConsentPolicyRepositoryPort,
  ClaimRegistryRepositoryPort,
} from '@ultima-forma/domain-consent';
import type { WebhookDispatcherPort } from '@ultima-forma/domain-webhook';
import {
  DRIZZLE,
  type DrizzleDB,
  PartnerRepository,
  ConsentRepository,
  AuditRepository,
  BillableEventRepository,
  WebhookSubscriptionRepository,
  WebhookDeliveryRepository,
  WebhookDispatcher,
  PartnerSecurityRepository,
  ConsentPolicyRepository,
  ClaimRegistryRepository,
  PartnerDashboardRepository,
  WalletRepository,
} from '@ultima-forma/infrastructure-drizzle';
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
import {
  PartnerSignatureGuard,
  VALIDATE_PARTNER_SIGNATURE,
  REGISTER_PARTNER_API_USAGE,
} from '../guards/partner-signature.guard';

export const PARTNER_REPOSITORY = 'PARTNER_REPOSITORY';
export const PARTNER_SECURITY_REPOSITORY = 'PARTNER_SECURITY_REPOSITORY';
export const CONSENT_REPOSITORY = 'CONSENT_REPOSITORY';
export const CONSENT_POLICY_REPOSITORY = 'CONSENT_POLICY_REPOSITORY';
export const REVOKE_CONSENT = 'REVOKE_CONSENT';
export const GET_CONSENT_DETAIL = 'GET_CONSENT_DETAIL';
export const GET_CONSENT_HISTORY = 'GET_CONSENT_HISTORY';
export const VALIDATE_CONSENT_POLICY = 'VALIDATE_CONSENT_POLICY';
export const CLAIM_REGISTRY_REPOSITORY = 'CLAIM_REGISTRY_REPOSITORY';
export const REGISTER_CLAIM_DEFINITION = 'REGISTER_CLAIM_DEFINITION';
export const LIST_CLAIM_DEFINITIONS = 'LIST_CLAIM_DEFINITIONS';
export const VALIDATE_CLAIMS_AGAINST_REGISTRY = 'VALIDATE_CLAIMS_AGAINST_REGISTRY';
export const ASSIGN_CLAIM_PERMISSION = 'ASSIGN_CLAIM_PERMISSION';
export const PARTNER_DASHBOARD_REPOSITORY = 'PARTNER_DASHBOARD_REPOSITORY';
export const GET_PARTNER_DASHBOARD = 'GET_PARTNER_DASHBOARD';
export const LIST_PARTNER_REQUESTS = 'LIST_PARTNER_REQUESTS';
export const MANAGE_PARTNER_WEBHOOKS = 'MANAGE_PARTNER_WEBHOOKS';
export const WALLET_REPOSITORY = 'WALLET_REPOSITORY';
export const REGISTER_USER_SUBJECT = 'REGISTER_USER_SUBJECT';
export const REGISTER_CREDENTIAL_REFERENCE = 'REGISTER_CREDENTIAL_REFERENCE';
export const CREATE_PRESENTATION_SESSION = 'CREATE_PRESENTATION_SESSION';
export const COMPLETE_PRESENTATION_SESSION = 'COMPLETE_PRESENTATION_SESSION';
export const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';
export const BILLABLE_EVENT_REPOSITORY = 'BILLABLE_EVENT_REPOSITORY';
export const WEBHOOK_SUBSCRIPTION_REPOSITORY = 'WEBHOOK_SUBSCRIPTION_REPOSITORY';
export const WEBHOOK_DELIVERY_REPOSITORY = 'WEBHOOK_DELIVERY_REPOSITORY';

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
      useFactory: (subRepo: unknown, delRepo: unknown) =>
        new WebhookDispatcher(
          subRepo as WebhookSubscriptionRepository,
          delRepo as WebhookDeliveryRepository
        ),
      inject: [WEBHOOK_SUBSCRIPTION_REPOSITORY, WEBHOOK_DELIVERY_REPOSITORY],
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
  ],
})
export class V1Module {}
