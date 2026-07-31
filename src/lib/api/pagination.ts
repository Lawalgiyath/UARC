export interface PaginationMeta {
    page: number;

    limit: number;

    total: number;

    totalPages: number;

    hasNextPage: boolean;

    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];

    pagination: PaginationMeta;
}

export function createPagination(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const totalPages =
        Math.max(
            1,
            Math.ceil(total / limit)
        );

    return {
        page,

        limit,

        total,

        totalPages,

        hasNextPage:
            page < totalPages,

        hasPreviousPage:
            page > 1,
    };
}