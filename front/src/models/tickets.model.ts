export interface ITicket {
    id?: number;
    eventId: number;
    buyerAddress: string;
    totalAmount: number;
    nftTokenId?: string;
    transactionHash?: string;
    createdAt: string;
}

export interface ITicketWithEvent extends ITicket {
    event?: {
        id: number;
        title: string;
        description: string;
        date: string;
        city: string;
        country: string;
        ticketPrice: number;
        imageUrl: string;
    };
}

export type ITicketId = ITicket & { id: number };
export type ITicketWithEventId = ITicketWithEvent & { id: number };

export interface IEventAvailability {
    available: number;
    total: number;
    price: number;
} 