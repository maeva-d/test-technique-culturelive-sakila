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
  private readonly logger = new Logger(ReminderService.name);

  @Cron('0 0 12 * * *', {
    name: 'reminders',
  })
  async checkForUpcomingReturns() {
    console.log('Cron Job exécuté');

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
      if (rental.return_date.getTime() === inThreeDays.getTime())
        console.log(
          `Dernier rappel à l'intention du client n° ${rental.customer_id} : la date de retour de votre location ${rental.rental_id} est dans 3 jours.`,
        );
      else if (rental.return_date.getTime() === inFiveDays.getTime())
        console.log(
          `Ceci est un rappel à l'intention du client n° ${rental.customer_id} : la date de retour de votre location ${rental.rental_id} est dans 5 jours.`,
        );
    }
  }

  getCrons() {
    const jobs = this.scheduleRegistery.getCronJob('reminders');
    console.log(jobs);
    //     jobs.forEach((value, key) => {
    //       let next;
    //       try {
    //         next = value.nextDates();
    //       } catch (error) {
    //         next = error;
    //       }
    //       //   this.logger.log(`job : ${key} -> next : ${next}`);
    //       console.log(`job : ${key} -> next : ${next}`);
    //     });
  }
}
