import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { CustomerService } from './customers/customer.service';
import { RentalService } from './rentals/rental.service';
import {
  customer as CustomerModel,
  rental as RentalModel,
  Prisma,
} from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly rentalService: RentalService,
  ) {}

  // -- Endpoint pour ajouter un client
  @Post('customer')
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

  // - On veut d'abord trouver un client en particulier avant de pouvoir le modifier :
  @Get('customer/:id')
  async getCustomerById(@Param('id') id: number): Promise<CustomerModel> {
    return this.customerService.findOneCustomer({ customer_id: Number(id) });
  }

  // -- Endpoint pour modifier un client
  @Patch('customer/:id')
  async updateCustomerRoute(
    @Param('id') id: number,
    @Body()
    updateData: {
      first_name: string;
      last_name: string;
      address: Prisma.addressUpdateOneRequiredWithoutCustomerNestedInput;
      store: Prisma.storeUpdateOneRequiredWithoutCustomerNestedInput;
    },
  ): Promise<CustomerModel> {
    return this.customerService.updateCustomer({
      where: { customer_id: Number(id) },
      data: updateData,
    });
  }

  // -- Endpoint pour effectuer une location :
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

    const oneWeekLater = new Date(rental_date);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    // oneWeekLater.setHours(0, 0, 0, 0); // Définir l'heure à partir de minuit

    const threeWeeksLater = new Date(rental_date);
    threeWeeksLater.setDate(threeWeeksLater.getDate() + 21);
    // threeWeeksLater.setHours(23, 59, 59, 0); // Définir l'heure juste avant minuit

    if (returnDate < oneWeekLater || returnDate > threeWeeksLater) {
      throw new BadRequestException(
        'La date de retour doit être supérieure à une semaine et inférieure à trois semaines à partir de la date de la location',
      );
    }

    return this.rentalService.createRental({
      rental_date,
      return_date,
      customer,
      inventory,
      staff,
    });
  }
}
