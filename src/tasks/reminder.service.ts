import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

import { adjustDate } from 'src/functions/adjustDate';

@Injectable()
export class ReminderService {
  constructor(
    private readonly prisma: PrismaService,
    private scheduleRegistery: SchedulerRegistry,
  ) {}
  private emailsRecordArr: string[] = [];
  private readonly logger = new Logger(ReminderService.name);

  @Cron('0 0 12 * * *', {
    name: 'reminders',
  })
  async checkForUpcomingReturns() {
    console.log('Cron Job exécuté à 12h00');

    const today = new Date();
    const inFiveDays = adjustDate(today, 5, 23, 59, 59, 999);
    const inThreeDays = adjustDate(today, 3, 23, 59, 59, 999);

    const allRentals = await this.prisma.rental.findMany({
      where: {
        OR: [
          {
            return_date: inThreeDays,
          },
          {
            return_date: inFiveDays,
          },
        ],
      },
    });

    for (const rental of allRentals) {
      if (rental.return_date.getTime() === inThreeDays.getTime()) {
        console.log(
          `Dernier rappel à l'intention du client n° ${rental.customer_id} : la date de retour de votre location ${rental.rental_id} est dans 3 jours.`,
        );
        const log = `${new Date().toISOString()} : email de rappel 2 (J-3) envoyé au client ${rental.customer_id}`;
        this.emailsRecordArr.push(log);
      } else if (rental.return_date.getTime() === inFiveDays.getTime()) {
        console.log(
          `Ceci est un rappel à l'intention du client n° ${rental.customer_id} : la date de retour de votre location ${rental.rental_id} est dans 5 jours.`,
        );
        const log = `${new Date().toISOString()} : email de rappel 1 (J-5) envoyé au client ${rental.customer_id}`;
        this.emailsRecordArr.push(log);
      } else {
        console.log(`${new Date().toISOString()} : pas d'emails envoyés.`);
      }
    }
  }

  getAllEmailsLogs() {
    return this.emailsRecordArr;
  }
}
