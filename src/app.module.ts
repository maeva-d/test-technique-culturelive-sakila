import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerService } from './customers/customer.service';
import { RentalService } from './rentals/rental.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [CustomerService, RentalService, AppService],
})
export class AppModule {}
