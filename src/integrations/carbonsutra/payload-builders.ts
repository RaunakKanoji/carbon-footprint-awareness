import type {
  CarbonSutraEcommerceShipmentPayload,
  CarbonSutraElectricityPayload,
  CarbonSutraFlightPayload,
  CarbonSutraFreightPayload,
  CarbonSutraFuelPayload,
  CarbonSutraHotelPayload,
  CarbonSutraVehicleModelPayload,
  CarbonSutraVehicleTypePayload,
} from './types';

const yesNo = (value: boolean | undefined, fallback: 'Y' | 'N' = 'Y') =>
  value === undefined ? fallback : value ? 'Y' : 'N';

export function buildVehicleTypePayload(input: {
  vehicleType: string;
  distanceValue: number;
  distanceUnit: 'km' | 'mi';
  fuelType?: 'Diesel' | 'Petrol' | 'Unknown';
  includeWtt?: boolean;
}): CarbonSutraVehicleTypePayload {
  return {
    vehicle_type: input.vehicleType,
    distance_value: input.distanceValue,
    distance_unit: input.distanceUnit,
    fuel_type: input.fuelType ?? 'Unknown',
    include_wtt: yesNo(input.includeWtt),
  };
}

export function buildVehicleModelPayload(input: {
  vehicleMake: string;
  vehicleModel: string;
  distanceValue: number;
  distanceUnit: 'km' | 'mi';
}): CarbonSutraVehicleModelPayload {
  return {
    vehicle_make: input.vehicleMake,
    vehicle_model: input.vehicleModel,
    distance_value: input.distanceValue,
    distance_unit: input.distanceUnit,
  };
}

export function buildElectricityPayload(input: {
  countryName: string;
  electricityValue: number;
  electricityUnit: 'kWh' | 'MWh';
}): CarbonSutraElectricityPayload {
  return {
    country_name: input.countryName,
    electricity_value: input.electricityValue,
    electricity_unit: input.electricityUnit,
  };
}

export function buildFlightPayload(input: {
  from: string;
  to: string;
  flightClass?: 'Economy' | 'Premium' | 'Business' | 'First' | 'Average';
  roundTrip?: boolean;
  includeRadiativeForcing?: boolean;
  includeWtt?: boolean;
  passengers?: number;
}): CarbonSutraFlightPayload {
  return {
    iata_airport_from: input.from.toUpperCase(),
    iata_airport_to: input.to.toUpperCase(),
    flight_class: input.flightClass ?? 'Economy',
    round_trip: yesNo(input.roundTrip, 'N'),
    add_rf: yesNo(input.includeRadiativeForcing),
    include_wtt: yesNo(input.includeWtt),
    number_of_passengers: input.passengers ?? 1,
  };
}

export function buildFuelPayload(input: {
  fuelUsage?: 'commercial' | 'industrial' | 'transport' | 'residential';
  fuelName: string;
  fuelValue: number;
}): CarbonSutraFuelPayload {
  const fuelNameAliases: Record<string, string> = {
    Petrol: 'Regular Petrol',
  };

  return {
    fuel_usage: input.fuelUsage ?? 'transport',
    fuel_name: fuelNameAliases[input.fuelName] ?? input.fuelName,
    fuel_value: input.fuelValue,
  };
}

// CarbonSutra hotel endpoint uses ISO 3166-1 alpha-2 country codes
// and an integer for hotel_rating (1 = budget, 3 = average, 5 = luxury).
const HOTEL_RATING_MAP: Record<string, number> = {
  budget: 1,
  economy: 1,
  '1': 1,
  '2': 2,
  average: 3,
  standard: 3,
  '3': 3,
  superior: 4,
  '4': 4,
  luxury: 5,
  premium: 5,
  '5': 5,
};

export function buildHotelPayload(input: {
  /** ISO 3166-1 alpha-2 country code, e.g. 'IN', 'US', 'GB' */
  countryCode: string;
  cityName?: string;
  /** 'Budget' | 'Average' | 'Luxury' OR a numeric string '1'-'5' OR an integer */
  hotelRating?: string | number;
  nights: number;
  rooms?: number;
}): CarbonSutraHotelPayload {
  let ratingInt: number | undefined;
  if (input.hotelRating !== undefined) {
    if (typeof input.hotelRating === 'number') {
      ratingInt = Math.round(input.hotelRating);
    } else {
      ratingInt = HOTEL_RATING_MAP[String(input.hotelRating).toLowerCase()] ?? 3;
    }
  }
  return {
    country_code: input.countryCode.toUpperCase(),
    city_name: input.cityName,
    hotel_rating: ratingInt,
    number_of_nights: input.nights,
    number_of_rooms: input.rooms ?? 1,
  };
}

export function buildFreightPayload(input: {
  transportMode: string;
  distanceValue: number;
  freightWeightKg: number;
}): CarbonSutraFreightPayload {
  return {
    transport_mode: input.transportMode,
    freight_weight: input.freightWeightKg,
    distance_value: input.distanceValue,
  };
}

export function buildEcommerceShipmentPayload(input: {
  originCountryCode: string;
  destinationCountryCode: string;
  originPostalCode?: string;
  destinationPostalCode?: string;
  packageWeightKg: number;
  includeRf?: boolean;
  includeWtt?: boolean;
}): CarbonSutraEcommerceShipmentPayload {
  return {
    origin_country_code: input.originCountryCode,
    destination_country_code: input.destinationCountryCode,
    origin_postal_code: input.originPostalCode,
    destination_postal_code: input.destinationPostalCode,
    package_weight: input.packageWeightKg,
    add_rf: yesNo(input.includeRf, 'N'),
    include_wtt: yesNo(input.includeWtt),
  };
}
