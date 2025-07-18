export interface ICause {
    id?: number;
    title: string;
    description: string;
    location: string;
    addressDestination: string;
    imageUrl: string;
    raisedAmount: string;
    goal: number;
    supporters: number;
    isClosed: boolean;
    eventsCount?: number;
}

export type ICauseId = ICause & { id: number };