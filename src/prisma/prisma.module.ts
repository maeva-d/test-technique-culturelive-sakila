import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Assure-toi que PrismaService est bien défini

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporte PrismaService pour qu'il soit utilisé dans d'autres modules
})
export class PrismaModule {}
