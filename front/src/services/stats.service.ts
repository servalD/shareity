import { ServiceResult } from "./service.result";
import { EventService } from "./events.service";
import { CauseService } from "./causes.service";
import { TicketService } from "./tickets.service";

export interface GlobalStats {
  eventsCreated: number;
  fundsRaised: number;
  causesSupported: number;
  nftTicketsSold: number;
}

export class StatsService {
  
  static async getGlobalStats(): Promise<ServiceResult<GlobalStats>> {
    try {
      // Récupérer tous les événements
      const eventsResult = await EventService.getAllEvents();
      const events = eventsResult.result || [];
      
      // Récupérer toutes les causes
      const causesResult = await CauseService.getAllCauses();
      const causes = causesResult.result || [];
      
      // Calculer les statistiques
      const eventsCreated = events.length;
      const causesSupported = causes.length;
      
      // Calculer les fonds levés (somme de tous les prix des tickets vendus)
      let fundsRaised = 0;
      let nftTicketsSold = 0;
      
      // Pour chaque événement, calculer les fonds levés estimés
      for (const event of events) {
        // Estimer le nombre de tickets vendus par événement (peut être amélioré avec de vraies données)
        // Pour l'instant, on peut utiliser une estimation basée sur la capacité ou récupérer les vraies données des tickets
        
        // Si on a accès aux tickets par événement, on peut calculer précisément
        try {
          const ticketsResult = await TicketService.getTicketsByEvent(event.id!);
          if (ticketsResult.result) {
            const eventTickets = ticketsResult.result;
            nftTicketsSold += eventTickets.length;
            
            // Calculer les fonds pour cet événement
            const eventFunds = eventTickets.reduce((sum, ticket) => sum + ticket.totalAmount, 0);
            fundsRaised += eventFunds;
          }
        } catch (error) {
          // Si on ne peut pas récupérer les tickets, utiliser une estimation
          console.warn(`Could not fetch tickets for event ${event.id}:`, error);
        }
      }

      return ServiceResult.success({
        eventsCreated,
        fundsRaised: Math.round(fundsRaised * 100) / 100, // Arrondir à 2 décimales
        causesSupported,
        nftTicketsSold
      });

    } catch (error) {
      console.error('Error fetching global stats:', error);
      // Retourner des statistiques par défaut en cas d'erreur
      return ServiceResult.success({
        eventsCreated: 0,
        fundsRaised: 0,
        causesSupported: 0,
        nftTicketsSold: 0
      });
    }
  }

  static formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M XRP`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K XRP`;
    } else {
      return `${amount} XRP`;
    }
  }

  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toString();
    }
  }
}
