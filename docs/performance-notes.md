# Performance Notes

## Optimized

- Dashboard queries request limited fields and recent records rather than full histories.
- External carbon estimates and route/product lookups use existing database caches.
- Live activity estimates are debounced and abort stale requests.
- Heavy chart clients remain dynamically loaded where already configured.
- Server components perform authenticated database reads and pass minimal serializable data.
- Product scans, activity lists, and weekly summaries use explicit limits or bounded date ranges.

## Known slow dependencies

- Open Food Facts search and barcode lookup depend on a public external service.
- OpenRouteService route comparison can require several network calculations.
- CarbonSutra and Climatiq latency varies by provider availability and mapping configuration.
- AI coach latency depends on the configured model provider.

## Fallback behavior

External carbon provider failure falls through to calibrated internal factors. Route failures retain
manual-distance entry. Product metadata failure retains manual category estimation. Coach provider
failure uses a local response generated from stored user data.

## Further optimization

- Add pagination to long activity and owned-product histories.
- Cache generated weekly reviews until underlying logs change.
- Move remaining large dashboard-only experimental code out of the client bundle.
- Add request-level tracing before tuning external provider timeouts.

