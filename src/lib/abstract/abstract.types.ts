import { ConferenceTrack, SubmissionStatus, PresentationPreference } from "@prisma/client";


export interface SubmissionListQuery {
    page: number;

    pageSize: number;

    search?: string;

    track?: ConferenceTrack;

    reviewStatus?: SubmissionStatus;
    presentationPreference?: PresentationPreference;
}

export interface PaginationMeta {
    page: number;

    pageSize: number;

    totalItems: number;

    totalPages: number;
}

export interface PaginatedSubmissionDto<T> {
    items: T[];

    pagination: PaginationMeta;
}