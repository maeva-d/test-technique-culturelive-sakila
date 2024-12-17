import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
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

    return this.rentalService.createRental({
      rental_date,
      return_date,
      customer,
      inventory,
      staff,
    });
  }
}
