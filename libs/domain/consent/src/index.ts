export {
  type RequestStatus,
  type ConsentStatus,
  type TrustLevel,
  type VerificationResult,
  type ReceiptData,
  type DataRequest,
  type RequestItem,
  type Consent,
  type ConsentReceipt,
  type DataRequestResultForConsumer,
} from './lib/consent.types';

export type {
  ConsentRepositoryPort,
  CreateDataRequestInput,
  DataRequestWithDetails,
} from './lib/consent.repository.port';
