import { AppController } from './app.controller';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

import { AppService } from './app.service';
import { CustomerService } from './customers/customer.service';
import { RentalService } from './rentals/rental.service';
import { ReminderService } from './tasks/reminder.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [CustomerService, RentalService, ReminderService, AppService],
})
export class AppModule {}
