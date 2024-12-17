// import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule'; // Import du décorateur Cron
// import { PrismaService } from '../prisma.service';
// // import { formatDistance } from 'date-fns'; // Pour formater les dates

// @Injectable()
// export class ReminderService {
//   constructor(private readonly prisma: PrismaService) {}

//   // Cette méthode s'exécutera chaque jour à 9h
//   @Cron('0 9 * * *')
//   async checkForUpcomingReturns() {
//     const today = new Date();
//     const fiveDaysLater = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 jours plus tard
//     const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 jours plus tard

//     // Récupérer les utilisateurs avec des prêts dont la date de retour est dans 5 ou 3 jours
//     const users = await this.prisma.customer.findMany({
//       include: {
//         loans: true,
//       },
//     });

//     for (const user of users) {
//       for (const loan of user.loans) {
//         const daysUntilReturn = Math.floor(
//           (new Date(loan.returnDate).getTime() - today.getTime()) /
//             (1000 * 60 * 60 * 24),
//         );

//         if (daysUntilReturn === 5) {
//           this.sendEmailReminder(user, 5); // Rappel pour 5 jours
//         } else if (daysUntilReturn === 3) {
//           this.sendEmailReminder(user, 3); // Rappel pour 3 jours
//         }
//       }
//     }
//   }

//   // Simuler l'envoi d'un email avec un console.log
//   sendEmailReminder(user, daysBeforeReturn) {
//     console.log(
//       `Rappel pour ${user.name} (${user.email}): Votre livre est à rendre dans ${daysBeforeReturn} jours.`,
//     );
//   }
// }
