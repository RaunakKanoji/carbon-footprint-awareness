'use client';

export default function ProductCategoryMappingNotice() {
  return (
    <p className="rounded-lg border border-border-default bg-bg-base p-3 text-sm text-text-secondary">
      Product metadata comes from Open Food Facts when a barcode is available. If an exact product
      footprint is unavailable, the carbon estimate uses the closest verified category or a Carbon
      Compass fallback factor. You can delete scan history anytime.
    </p>
  );
}
