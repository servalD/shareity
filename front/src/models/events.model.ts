export interface IEvent {
    id?: number;
    title: string;
    description: string;
    date: string;
    city: string;
    country: string;
    maxAttendees: number;
    attendees: number;
    ticketPrice: number;
    imageUrl: string;
    causeId: number;
}

export interface IEventWithCause extends IEvent {
    cause?: {
        id: number;
        title: string;
        description: string;
    };
}

export type IEventId = IEvent & { id: number };
export type IEventWithCauseId = IEventWithCause & { id: number };
