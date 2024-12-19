import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CustomerService } from './customers/customer.service';
import { RentalService } from './rentals/rental.service';
import { ReminderService } from './tasks/reminder.service';
import {
  customer as CustomerModel,
  rental as RentalModel,
  Prisma,
} from '@prisma/client';

import { adjustDate } from './functions/adjustDate';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly customerService: CustomerService,
    private readonly rentalService: RentalService,
    private readonly reminderService: ReminderService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // --- ENDPOINTS --- //

  @Post('customers')
  async createCustomerRoute(
    @Body()
    customerData: {
      first_name: string;
      last_name: string;
      email: string;
      address: Prisma.addressCreateNestedOneWithoutCustomerInput;
      store: Prisma.storeCreateNestedOneWithoutCustomerInput;
    },
  ): Promise<CustomerModel> {
    const { first_name, last_name, email, address, store } = customerData;
    return this.customerService.createCustomer({
      first_name,
      last_name,
      email,
      address,
      store,
    });
  }

  @Patch('customer/:id')
  async updateCustomerRoute(
    @Param('id') id: number,
    @Body()
    updateData: {
      first_name: string;
      last_name: string;
      email: string;
      address: Prisma.addressUpdateOneRequiredWithoutCustomerNestedInput;
      store: Prisma.storeUpdateOneRequiredWithoutCustomerNestedInput;
    },
  ): Promise<CustomerModel> {
    return this.customerService.updateCustomer({
      where: { customer_id: Number(id) },
      data: updateData,
    });
  }

  // -- Permettra d'obtenir les locations ciblées en fonction de leur date de retour, pour ensuite envoyer les mails en conséquence
  // -- Toutes les dates de retours auront la même heure de rendue, à la seconde près, pour faciliter le fetch des locations selon leur date retour et d'envoyer un mail selon si la date de retour est dans 5 ou 3 jours.
  @Get('rentals')
  async findAllRentalsRoute(): Promise<any> {
    return this.reminderService.checkForUpcomingReturns();
  }

  @Post('rental')
  async createRentalRoute(
    @Body()
    rentalData: {
      rental_date: Date;
      return_date: Date;
      customer: Prisma.customerCreateNestedOneWithoutRentalInput;
      inventory: Prisma.inventoryCreateNestedOneWithoutRentalInput;
      staff: Prisma.staffCreateNestedOneWithoutRentalInput;
    },
  ): Promise<RentalModel> {
    const { rental_date, return_date, customer, inventory, staff } = rentalData;
    const returnDate = new Date(return_date);
    returnDate.setHours(23, 59, 59, 999);

    const oneWeekLater = adjustDate(rental_date, 7, 0, 0, 0, 0);
    const threeWeeksLater = adjustDate(rental_date, 21, 23, 59, 59, 999);

    if (returnDate < oneWeekLater || returnDate > threeWeeksLater) {
      throw new BadRequestException(
        'La date de retour doit être supérieure à une semaine et inférieure à trois semaines à partir de la date de la location',
      );
    }

    return this.rentalService.createRental({
      rental_date,
      return_date: returnDate,
      customer,
      inventory,
      staff,
    });
  }

  @Get('rentals/emails-sent')
  async getAllEmailsSentRoute() {
    return this.reminderService.getAllEmailsLogs();
  }
}
