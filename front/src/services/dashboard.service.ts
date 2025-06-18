import { ServiceResult } from "./service.result";
import { TicketService } from "./tickets.service";
import { EventService } from "./events.service";
import { CauseService } from "./causes.service";

export interface DashboardStats {
  eventsAttended: number;
  totalDonated: number;
  causesSupported: number;
  nftTickets: number;
}

export interface RecentActivity {
  id: string;
  type: 'ticket' | 'donation';
  title: string;
  date: Date;
  amount: number;
  charityAmount?: number;
  txId?: string;
  status: 'completed' | 'upcoming' | 'attended';
  // For tickets
  ticketPrice?: number;
  nftId?: string;
  // For donations
  cause?: string;
}

export class DashboardService {

  static async getUserStats(walletAddress: string): Promise<ServiceResult<DashboardStats>> {
    try {
      // Récupérer les tickets de l'utilisateur
      const ticketsResult = await TicketService.getTicketsByBuyer(walletAddress);

      if (ticketsResult.errorCode !== 0 || !ticketsResult.result) {
        return ServiceResult.success({
          eventsAttended: 0,
          totalDonated: 0,
          causesSupported: 0,
          nftTickets: 0
        });
      }

      const tickets = ticketsResult.result;

      // Calculer les statistiques
      const eventsAttended = tickets.filter(ticket => {
        if (!ticket.event) return false;
        const eventDate = new Date(ticket.event.date);
        return eventDate < new Date(); // Événements passés
      }).length;

      const totalDonated = tickets.reduce((sum, ticket) => {
        return sum + ticket.totalAmount;
      }, 0);

      const nftTickets = tickets.filter(ticket => ticket.nftTokenId).length;

      // Obtenir les causes uniques supportées
      const uniqueCauses = new Set(
        tickets
          .map(ticket => ticket.event?.id)
          .filter(Boolean)
      );
      const causesSupported = uniqueCauses.size;

      return ServiceResult.success({
        eventsAttended,
        totalDonated,
        causesSupported,
        nftTickets
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      return ServiceResult.failed();
    }
  }

  static async getUserActivity(walletAddress: string): Promise<ServiceResult<RecentActivity[]>> {
    try {
      const ticketsResult = await TicketService.getTicketsByBuyer(walletAddress);

      if (ticketsResult.errorCode !== 0 || !ticketsResult.result) {
        return ServiceResult.success([]);
      }

      const activities: RecentActivity[] = ticketsResult.result.map(ticket => {
        const eventDate = new Date(ticket.event?.date || ticket.createdAt);
        const isUpcoming = eventDate > new Date();

        return {
          id: ticket.id!.toString(),
          type: 'ticket' as const,
          title: ticket.event?.title || 'Unknown Event',
          date: eventDate,
          amount: ticket.totalAmount,
          charityAmount: ticket.totalAmount * 0.3, // Assume 30% goes to charity
          txId: ticket.transactionHash,
          status: isUpcoming ? 'upcoming' : 'attended',
          ticketPrice: ticket.totalAmount,
          nftId: ticket.nftTokenId
        };
      });

      // Trier par date décroissante
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());

      return ServiceResult.success(activities);

    } catch (error) {
      console.error('Error fetching user activity:', error);
      return ServiceResult.failed();
    }
  }

  static async getUserTickets(walletAddress: string): Promise<ServiceResult<any[]>> {
    try {
      const ticketsResult = await TicketService.getTicketsByBuyer(walletAddress);

      if (ticketsResult.errorCode !== 0 || !ticketsResult.result) {
        return ServiceResult.success([]);
      }

      const nftTickets = ticketsResult.result
        .filter(ticket => ticket.nftTokenId)
        .map(ticket => ({
          id: ticket.nftTokenId!,
          eventTitle: ticket.event?.title || 'Unknown Event',
          date: new Date(ticket.event?.date || ticket.createdAt),
          image: ticket.event?.imageUrl || 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
          status: new Date(ticket.event?.date || ticket.createdAt) > new Date() ? 'active' : 'used',
          txId: ticket.transactionHash,
          ticketId: ticket.id
        }));

      return ServiceResult.success(nftTickets);

    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return ServiceResult.failed();
    }
  }
}
