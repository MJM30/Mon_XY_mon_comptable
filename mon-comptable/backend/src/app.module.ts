import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AccessModule } from './access/access.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ClientsModule } from './clients/clients.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProductsModule } from './products/products.module';
import { ActivityModule } from './activity/activity.module';
import { UsersModule } from './users/users.module';

// Extensions majeures
import { AccountingModule } from './accounting/accounting.module';
import { AnalyticalModule } from './analytical/analytical.module';
import { DigitalPaymentsModule } from './digital-payments/digital-payments.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AccessModule,
    DashboardModule,
    InvoicesModule,
    PaymentsModule,
    TransactionsModule,
    ClientsModule,
    SuppliersModule,
    ProductsModule,
    ActivityModule,
    UsersModule,
    // Modules étendus
    AccountingModule,
    AnalyticalModule,
    DigitalPaymentsModule,
  ],
})
export class AppModule {}
