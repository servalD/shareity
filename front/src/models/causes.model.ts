export interface ICause {
    id?: number;
    title: string;
    description: string;
    location: string;
    goal: number;
    supporters: number;
    isClosed: boolean;
}

export type ICauseId = ICause & { id: number };