import { SetMetadata } from '@nestjs/common';
import { SKIP_PARTNER_AUTH_KEY } from './partner-signature.guard';

export const SkipPartnerAuth = () => SetMetadata(SKIP_PARTNER_AUTH_KEY, true);
