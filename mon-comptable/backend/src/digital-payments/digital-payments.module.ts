import { Module } from '@nestjs/common';
import { DigitalPaymentsController } from './digital-payments.controller';
import { DigitalPaymentsService } from './digital-payments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [PrismaModule, AccountingModule],
  controllers: [DigitalPaymentsController],
  providers: [DigitalPaymentsService],
  exports: [DigitalPaymentsService],
})
export class DigitalPaymentsModule {}
