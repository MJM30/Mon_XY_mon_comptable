import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ACCREDITATION_KEY = 'require_accreditation';
export const RequireAccreditation = () => SetMetadata(REQUIRE_ACCREDITATION_KEY, true);
