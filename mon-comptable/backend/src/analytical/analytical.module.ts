import { Module } from '@nestjs/common';
import { AnalyticalController } from './analytical.controller';
import { AnalyticalService } from './analytical.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticalController],
  providers: [AnalyticalService],
  exports: [AnalyticalService],
})
export class AnalyticalModule {}
