# API Integration

Carbon Compass uses the existing provider stack; no additional MVP API is required.

## Provider responsibilities

| Provider | User-facing responsibility |
| --- | --- |
| CarbonSutra | Primary transport and electricity estimates |
| Climatiq | Secondary transport/electricity estimates and mapped shopping/product factors |
| OpenRouteService | Route, geocoding, distance, and travel-mode comparison |
| Open Food Facts | Barcode-based food and packaged-product metadata |
| Agribalyse | Local food life-cycle factors where a reliable mapping or match exists |
| Carbon Compass internal engine | Stable final fallback for all activity-form options |
| Carbon Interface | Optional developer integration; disabled for MVP-critical flows |

## Fallback order

The standard activity estimator uses:

1. CarbonSutra where the activity is supported.
2. Climatiq where an active factor mapping exists.
3. Category-specific data integrations in their dedicated flows.
4. Calibrated Carbon Compass factors.

Walking, cycling, and solar operational emissions return zero without calling an external carbon
provider. Provider failures are logged on the server and are not returned verbatim to users.

## User flows

- Transport: OpenRouteService provides route distance in the commuting flow. CarbonSutra estimates
  supported vehicle/transit activity, Climatiq is attempted next, and the internal distance factor
  is the final fallback.
- Food: barcode flows use Open Food Facts metadata and try Agribalyse before mapped Climatiq/manual
  factors. The standard meal form uses calibrated fallback factors when no reliable product-level
  mapping is available.
- Energy: CarbonSutra is primary, Climatiq is secondary, and the regional internal electricity
  factor is final.
- Shopping and products: exact barcode footprint data is used when available. Otherwise, the item
  is mapped to the closest product category and estimated with Climatiq or the internal engine.
- Waste: suitable mapped external factors may be added through Climatiq; all current form choices
  have internal factors and therefore remain loggable.

## Stored estimate metadata

Activity logs store the provider, confidence, fallback state, method, factor/reference identifiers,
normalized input, source endpoint/dataset information, and the provider response where available.
API keys remain server-only.

## MVP limitations

- Climatiq requires active, non-placeholder mappings for each activity type.
- Agribalyse accuracy depends on an imported dataset and reliable product/category mappings.
- Open Food Facts metadata and product footprint coverage vary by barcode.
- General product-category estimates are averages, not product carbon footprints.
- Carbon Interface is retained for diagnostics and future repair but is not part of critical
  fallback chains.

