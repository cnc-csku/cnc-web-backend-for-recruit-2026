import { t } from "elysia";

export const PaginationModal = {
  paginationQuery: t.Object({
    page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
    limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
  }),
  paginationResponse: t.Object({
    data: t.Array(t.Any()),
    meta: t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    }),
  }),
};

export type PaginationParams = typeof PaginationModal.paginationQuery.static;

export type PaginationResponse =
  typeof PaginationModal.paginationResponse.static;
