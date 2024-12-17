import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { rental, Prisma } from '@prisma/client';

@Injectable()
export class RentalService {
  constructor(private prisma: PrismaService) {}

  // Effectuer une location :
  async createRental(data: Prisma.rentalCreateInput): Promise<rental> {
    return this.prisma.rental.create({
      data,
    });
  }
}
