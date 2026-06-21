# API Usage Audit

| API | Purpose | Status | Used by | Working | Unused reason | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| CarbonSutra | Transport, electricity, flight and other carbon estimates | Integrated, primary where supported | Log activity, carbon estimator, carbon tools | Requires configured endpoints and authenticated tests | Not unused | Climatiq, then internal factors |
| Climatiq | Global mapped emission factors | Integrated, secondary provider | Activity estimator, product and food mappings | Live health check passes when key and mappings are configured | Some categories lack active mappings | Internal factors |
| Carbon Interface | Vehicle, electricity, flight, shipping and fuel estimates | Integrated but unavailable | Developer diagnostics only | Failing HTTP 401 because account email is unconfirmed | Intentionally excluded from production-critical flows | CarbonSutra, Climatiq, internal factors |
| OpenRouteService | Geocoding, route distance and route comparison | Integrated and used | Commute tracker and route estimate routes | Live health check passes with configured key | Not unused | Manual distance entry |
| Open Food Facts | Barcode and packaged-food metadata | Integrated and used | Product scanner and food product flow | Live health check passes | Coverage depends on barcode contributors | Manual product/category entry |
| Agribalyse | Local food LCA factors | Integrated and used when mapped | Food factor search, barcode food estimates | Local dataset is available; mapping coverage varies | Unmatched foods cannot use exact factors | Climatiq or internal food category |
| Carbon Compass internal engine | Deterministic category estimates | Active final fallback | All standard activity forms, receipts, products | Working locally without external keys | Not unused | None required |
| OpenAI / Gemini | Carbon Coach responses | Optional, provider selected from environment | Coach conversations | Depends on configured key | Local response generator is used when absent/failing | Data-aware local coach response |

No additional external API is required for the MVP. Next work should improve mappings and account
configuration rather than add providers.

