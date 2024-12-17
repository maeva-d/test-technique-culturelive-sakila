import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { customer, Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  // Création d'un client
  async createCustomer(data: Prisma.customerCreateInput): Promise<customer> {
    return this.prisma.customer.create({
      data,
    });
  }

  // Trouver le client à modifier
  async findOneCustomer(
    customerWhereUniqueInput: Prisma.customerWhereUniqueInput,
  ): Promise<customer | null> {
    return this.prisma.customer.findUnique({
      where: customerWhereUniqueInput,
    });
  }

  // Modifier un client
  async updateCustomer(params: {
    where: Prisma.customerWhereUniqueInput;
    data: Prisma.customerUpdateInput;
  }): Promise<customer> {
    const { where, data } = params;

    return this.prisma.customer.update({
      where,
      data,
    });
  }
}
