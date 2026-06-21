export function buildOpenFoodFactsProductPayload(barcode: string) {
  return { barcode };
}

export function buildOpenFoodFactsSearchPayload(input: {
  query: string;
  page?: number;
  pageSize?: number;
}) {
  return {
    query: input.query.trim(),
    page: input.page ?? 1,
    pageSize: input.pageSize ?? 10,
  };
}
