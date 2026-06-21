export function getCandidateCategoryTags(product: {
  categoryTags: string[];
  categories: string[];
}) {
  return [
    ...product.categoryTags,
    ...product.categories.map((category) => category.toLowerCase().replace(/\s+/g, '-')),
  ];
}
