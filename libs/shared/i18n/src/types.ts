/**
 * Type definitions for i18n translation keys.
 * Use these for autocomplete and compile-time safety.
 */
export type CommonKeys =
  | 'buttons.submit'
  | 'buttons.cancel'
  | 'errors.generic'
  | 'loading';

export type OpsKeys =
  | 'nav.requests'
  | 'nav.audit'
  | 'nav.profileUpdates'
  | 'nav.webhooks'
  | 'profileUpdates.title'
  | 'profileUpdates.loading'
  | 'profileUpdates.error'
  | 'profileUpdates.noResults'
  | 'requests.title'
  | 'requests.loading'
  | 'requests.error'
  | 'audit.title'
  | 'audit.loading'
  | 'audit.error'
  | 'webhooks.title'
  | 'webhooks.loading'
  | 'webhooks.error';

export type PartnerKeys = 'title' | 'subtitle';

export type UserKeys =
  | 'home.title'
  | 'home.subtitle'
  | 'consent.title'
  | 'consent.approve'
  | 'consent.reject'
  | 'consent.loading'
  | 'consent.errorNotFound'
  | 'consent.errorLoad'
  | 'consent.approved.title'
  | 'consent.approved.subtitle'
  | 'consent.rejected.title'
  | 'consent.rejected.subtitle'
  | 'consent.back'
  | 'consent.dataRequest'
  | 'consent.corsHint';

export type ApiErrorKeys =
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'PARTNER_NOT_FOUND'
  | 'PARTNER_INACTIVE'
  | 'ISSUER_NOT_FOUND'
  | 'CONSUMER_NOT_FOUND'
  | 'CONSUMER_INACTIVE'
  | 'INVALID_INPUT'
  | 'CLAIMS_OUT_OF_SCOPE'
  | 'CONSENT_NOT_FOUND'
  | 'REQUEST_NOT_FOUND'
  | 'REQUEST_EXPIRED'
  | 'DATA_REQUEST_NOT_FOUND'
  | 'ISSUER_UPDATE_FAILED'
  | 'CONSUMER_UPDATE_FAILED'
  | 'WEBHOOK_SUBSCRIPTION_CREATE_FAILED'
  | 'WEBHOOK_DELIVERY_CREATE_FAILED'
  | 'AUDIT_APPEND_FAILED'
  | 'BILLABLE_APPEND_FAILED';
