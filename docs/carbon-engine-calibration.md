# Carbon Engine Calibration

The internal engine is the deterministic final fallback. Values are generalized MVP factors and
must be presented as estimates rather than product-specific measurements.

The calculation is `CO2e kg = normalized quantity × factor`. Transport quantity is divided by the
passenger count. Walking, cycling, and solar operational emissions use a zero-emission rule.

| Category | Factor | Unit | Value | Approximation | Confidence |
| --- | --- | --- | ---: | --- | --- |
| Transport | petrolCar | kg CO2e/km | 0.192 | Typical small petrol car distance factor | Medium |
| Transport | dieselCar | kg CO2e/km | 0.171 | Typical small diesel car distance factor | Medium |
| Transport | bus | kg CO2e/passenger-km | 0.105 | Average bus passenger distance | Medium |
| Transport | metro | kg CO2e/passenger-km | 0.035 | Average urban rail passenger distance | Medium |
| Transport | train | kg CO2e/passenger-km | 0.041 | Average rail passenger distance | Medium |
| Food | veganMeal | kg CO2e/meal | 0.70 | Broad meal average | Medium |
| Food | vegetarianMeal | kg CO2e/meal | 1.20 | Broad meal average | Medium |
| Food | chickenMeal | kg CO2e/meal | 2.50 | Broad meal average | Medium |
| Food | beefMeal | kg CO2e/meal | 7.00 | Broad meal average | Medium |
| Food | rice | kg CO2e/kg | 2.70 | Broad food LCA average | Medium |
| Food | milk | kg CO2e/litre | 1.40 | Broad dairy LCA average | Medium |
| Energy | indiaGrid | kg CO2e/kWh | 0.71 | India grid average approximation | Medium |
| Shopping | clothingItem | kg CO2e/item | 8.00 | Average clothing category | Low |
| Shopping | electronicsItem | kg CO2e/item | 120.00 | Broad electronics category | Low |
| Shopping | onlineOrder | kg CO2e/order | 3.50 | Average delivery/order estimate | Low |
| Waste | landfillWaste | kg CO2e/kg | 0.45 | General landfill treatment | Medium |
| Waste | recycling | kg CO2e/kg | 0.10 | General recycling operations | Medium |
| Waste | composting | kg CO2e/kg | 0.05 | General composting operations | Medium |
| Waste | plasticWaste | kg CO2e/kg | 0.35 | General plastic disposal | Low |
| Waste | paperWaste | kg CO2e/kg | 0.09 | General paper disposal | Low |
| Waste | foodWaste | kg CO2e/kg | 0.58 | General food waste treatment | Low |

Database emission factors take precedence when present. The in-code calibrated table guarantees
that supported MVP form options still work if a seed is missing. Future calibration should compare
the same normalized inputs against current CarbonSutra, Climatiq, and licensed LCA datasets, then
record source version and region without adding false precision.

