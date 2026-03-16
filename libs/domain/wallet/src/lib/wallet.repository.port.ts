import type {
  CreateCredentialReferenceInput,
  CreatePresentationSessionInput,
  CreateUserSubjectInput,
  CredentialReference,
  PresentationSession,
  UserSubject,
} from './wallet.types';

export interface WalletRepositoryPort {
  createUserSubject(input: CreateUserSubjectInput): Promise<UserSubject>;
  findUserSubjectById(id: string): Promise<UserSubject | null>;
  findByTenantAndExternalRef(
    tenantId: string,
    externalSubjectRef: string
  ): Promise<UserSubject | null>;
  createCredentialReference(
    input: CreateCredentialReferenceInput
  ): Promise<CredentialReference>;
  listCredentialsBySubject(
    userSubjectId: string
  ): Promise<CredentialReference[]>;
  createPresentationSession(
    input: CreatePresentationSessionInput
  ): Promise<PresentationSession>;
  findPresentationSessionById(
    id: string
  ): Promise<PresentationSession | null>;
  completePresentationSession(
    id: string
  ): Promise<PresentationSession>;
}
