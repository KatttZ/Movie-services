// services callback functions
export type onSuccess<T> = (data: T) => void;
export type onError = (status: number, message: string) => void;


export interface PaginatedResponse<T> {
    data: T[];
    totalPages: number;
    currPage: number;
    count: number;
    limit: number;
}