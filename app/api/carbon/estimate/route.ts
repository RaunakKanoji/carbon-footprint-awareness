import { z } from 'zod';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import {
  estimateElectricity,
  estimateFlight,
  estimateVehicleByType,
} from '@/src/server/carbon/carbon.service';
import {
  estimateElectricityWithCarbonInterface,
  estimateFlightWithCarbonInterface,
  estimateFuelCombustionWithCarbonInterface,
  estimateShippingWithCarbonInterface,
  estimateVehicleWithCarbonInterface,
} from '@/src/server/carbon/carbon-interface.service';
import {
  estimateElectricityWithClimatiq,
  estimateFuelWithClimatiq,
  estimateProductWeightWithClimatiq,
  estimateSpendWithClimatiq,
  estimateTransportWithClimatiq,
} from '@/src/server/carbon/climatiq.service';
import { saveCarbonActivity } from '@/src/server/carbon/activity.service';
import { getCurrentUser } from '@/src/lib/auth';
import { prisma } from '@/src/db/prisma';
import { handleNewActivityLog } from '@/src/lib/gamification/progress';
import {
  activityEstimatePersistenceData,
  estimateActivityCarbon,
  toActivityCategory,
} from '@/src/server/carbon/activity-estimation.service';

const standardActivityEstimateSchema = z.object({
  category: z.enum(['TRANSPORT', 'FOOD', 'ENERGY', 'SHOPPING', 'WASTE']),
  subType: z.string().min(1),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().optional(),
  passengers: z.coerce.number().int().min(1).optional(),
  region: z.string().optional(),
  note: z.string().optional(),
  save: z.boolean().optional().default(true),
});

const carbonSutraTransportEstimateSchema = z.object({
  category: z.literal('TRANSPORT'),
  provider: z.literal('CARBONSUTRA').optional(),
  method: z.literal('vehicleType').default('vehicleType'),
  vehicleType: z.string().min(1),
  distanceValue: z.coerce.number().positive(),
  distanceUnit: z.enum(['km', 'mi']),
  fuelType: z.enum(['Diesel', 'Petrol', 'Unknown']).optional(),
  includeWtt: z.boolean().optional(),
  note: z.string().optional(),
});

const carbonSutraElectricityEstimateSchema = z.object({
  category: z.literal('ELECTRICITY'),
  provider: z.literal('CARBONSUTRA').optional(),
  countryName: z.string().min(1),
  electricityValue: z.coerce.number().positive(),
  electricityUnit: z.enum(['kWh', 'MWh']),
  note: z.string().optional(),
});

const carbonSutraFlightEstimateSchema = z
  .object({
    category: z.literal('FLIGHT'),
    provider: z.literal('CARBONSUTRA').optional(),
    from: z.string().length(3).transform((value) => value.toUpperCase()),
    to: z.string().length(3).transform((value) => value.toUpperCase()),
    flightClass: z.enum(['Economy', 'Premium', 'Business', 'First', 'Average']).optional(),
    roundTrip: z.boolean().optional(),
    includeRadiativeForcing: z.boolean().optional(),
    includeWtt: z.boolean().optional(),
    passengers: z.coerce.number().int().min(1).optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.from !== data.to, {
    message: 'From and to airports cannot be the same',
    path: ['to'],
  });

const carbonInterfaceVehicleEstimateSchema = z.object({
  category: z.literal('TRANSPORT'),
  provider: z.literal('CARBON_INTERFACE').optional(),
  vehicleModelId: z.string().min(1),
  distanceValue: z.coerce.number().positive(),
  distanceUnit: z.enum(['mi', 'km']),
  note: z.string().optional(),
});

const carbonInterfaceElectricityEstimateSchema = z.object({
  category: z.literal('ELECTRICITY'),
  provider: z.literal('CARBON_INTERFACE').optional(),
  country: z.string().min(2).max(2).transform((value) => value.toLowerCase()),
  state: z
    .string()
    .min(2)
    .max(2)
    .transform((value) => value.toLowerCase())
    .optional(),
  electricityValue: z.coerce.number().positive(),
  electricityUnit: z.enum(['kwh', 'mwh']),
  note: z.string().optional(),
});

const carbonInterfaceFlightEstimateSchema = z
  .object({
    category: z.literal('FLIGHT'),
    provider: z.literal('CARBON_INTERFACE').optional(),
    passengers: z.coerce.number().int().min(1),
    legs: z
      .array(
        z.object({
          departureAirport: z.string().length(3).transform((value) => value.toLowerCase()),
          destinationAirport: z.string().length(3).transform((value) => value.toLowerCase()),
        }),
      )
      .min(1),
    distanceUnit: z.enum(['mi', 'km']).optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) =>
      data.legs.every((leg) => leg.departureAirport !== leg.destinationAirport),
    {
      message: 'Flight origin and destination cannot be the same',
      path: ['legs'],
    },
  );

const carbonInterfaceShippingEstimateSchema = z.object({
  category: z.literal('SHIPPING'),
  provider: z.literal('CARBON_INTERFACE').optional(),
  weightValue: z.coerce.number().positive(),
  weightUnit: z.enum(['g', 'lb', 'kg', 'mt']),
  distanceValue: z.coerce.number().positive(),
  distanceUnit: z.enum(['mi', 'km']),
  transportMethod: z.enum(['ship', 'train', 'truck', 'plane']),
  note: z.string().optional(),
});

const carbonInterfaceFuelEstimateSchema = z.object({
  category: z.literal('FUEL'),
  provider: z.literal('CARBON_INTERFACE').optional(),
  fuelSourceType: z.string().min(1),
  fuelSourceUnit: z.string().min(1),
  fuelSourceValue: z.coerce.number().positive(),
  note: z.string().optional(),
});

const climatiqTransportEstimateSchema = z.object({
  category: z.literal('TRANSPORT'),
  provider: z.literal('CLIMATIQ'),
  mappingKey: z.string().min(1),
  distanceValue: z.coerce.number().positive(),
  distanceUnit: z.enum(['m', 'km', 'mi']),
  note: z.string().optional(),
});

const climatiqElectricityEstimateSchema = z.object({
  category: z.literal('ELECTRICITY'),
  provider: z.literal('CLIMATIQ'),
  mappingKey: z.string().min(1),
  energyValue: z.coerce.number().positive(),
  energyUnit: z.enum(['Wh', 'kWh', 'MWh']),
  note: z.string().optional(),
});

const climatiqFuelEstimateSchema = z
  .object({
    category: z.literal('FUEL'),
    provider: z.literal('CLIMATIQ'),
    mappingKey: z.string().min(1),
    volumeValue: z.coerce.number().positive().optional(),
    volumeUnit: z.string().optional(),
    energyValue: z.coerce.number().positive().optional(),
    energyUnit: z.enum(['Wh', 'kWh', 'MWh', 'MJ', 'GJ']).optional(),
    weightValue: z.coerce.number().positive().optional(),
    weightUnit: z.enum(['g', 'kg', 't', 'lb']).optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.volumeValue || data.energyValue || data.weightValue, {
    message: 'Fuel estimates require volume, energy, or weight',
    path: ['volumeValue'],
  });

const climatiqShoppingEstimateSchema = z.object({
  category: z.literal('SHOPPING'),
  provider: z.literal('CLIMATIQ'),
  mappingKey: z.string().min(1),
  moneyValue: z.coerce.number().positive(),
  moneyUnit: z.string().min(1),
  spentYear: z.coerce.number().int().optional(),
  note: z.string().optional(),
});

const climatiqProductEstimateSchema = z.object({
  category: z.literal('PRODUCT'),
  provider: z.literal('CLIMATIQ'),
  mappingKey: z.string().min(1),
  weightValue: z.coerce.number().positive(),
  weightUnit: z.enum(['g', 'kg', 't', 'lb']),
  note: z.string().optional(),
});

const estimateSchema = z.union([
  standardActivityEstimateSchema,
  climatiqTransportEstimateSchema,
  climatiqElectricityEstimateSchema,
  climatiqFuelEstimateSchema,
  climatiqShoppingEstimateSchema,
  climatiqProductEstimateSchema,
  carbonSutraTransportEstimateSchema,
  carbonSutraElectricityEstimateSchema,
  carbonSutraFlightEstimateSchema,
  carbonInterfaceVehicleEstimateSchema,
  carbonInterfaceElectricityEstimateSchema,
  carbonInterfaceFlightEstimateSchema,
  carbonInterfaceShippingEstimateSchema,
  carbonInterfaceFuelEstimateSchema,
]);

export async function POST(req: Request) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = estimateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid activity payload',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const input = parsed.data;

    if ('subType' in input && 'quantity' in input) {
      const estimate = await estimateActivityCarbon(input);
      let activity = null;

      if (input.save) {
        activity = await prisma.activityLog.create({
          data: {
            userId: dbUser.id,
            category: toActivityCategory(input.category),
            subType: input.subType,
            activityType: input.subType,
            quantity: input.quantity,
            unit: estimate.unit,
            co2eKg: estimate.co2eKg,
            ...activityEstimatePersistenceData(estimate),
            note: input.note ?? null,
          },
        });

        await handleNewActivityLog(activity);

        revalidatePath('/dashboard');
        revalidatePath('/insights');
      }

      return NextResponse.json({
        success: true,
        estimate,
        activity: activity
          ? {
              id: activity.id,
              category: activity.category,
              activityType: activity.activityType,
              co2eKg: activity.co2eKg,
              provider: activity.provider,
              createdAt: activity.createdAt.toISOString(),
            }
          : null,
      });
    }

    let estimate;
    let activity;

    if (input.provider === 'CLIMATIQ' && input.category === 'TRANSPORT') {
      estimate = await estimateTransportWithClimatiq({
        mappingKey: input.mappingKey,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'TRANSPORT',
        activityType: input.mappingKey,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
        note: input.note,
        estimate,
      });
    } else if (input.provider === 'CLIMATIQ' && input.category === 'ELECTRICITY') {
      estimate = await estimateElectricityWithClimatiq({
        mappingKey: input.mappingKey,
        energyValue: input.energyValue,
        energyUnit: input.energyUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'ELECTRICITY',
        activityType: input.mappingKey,
        energyValue: input.energyValue,
        energyUnit: input.energyUnit,
        note: input.note,
        estimate,
      });
    } else if (input.provider === 'CLIMATIQ' && input.category === 'FUEL') {
      estimate = await estimateFuelWithClimatiq({
        mappingKey: input.mappingKey,
        volumeValue: input.volumeValue,
        volumeUnit: input.volumeUnit,
        energyValue: input.energyValue,
        energyUnit: input.energyUnit,
        weightValue: input.weightValue,
        weightUnit: input.weightUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'FUEL',
        activityType: input.mappingKey,
        quantityValue: input.volumeValue ?? input.energyValue ?? input.weightValue,
        quantityUnit: input.volumeUnit ?? input.energyUnit ?? input.weightUnit,
        note: input.note,
        estimate,
      });
    } else if (input.provider === 'CLIMATIQ' && input.category === 'SHOPPING') {
      estimate = await estimateSpendWithClimatiq({
        mappingKey: input.mappingKey,
        moneyValue: input.moneyValue,
        moneyUnit: input.moneyUnit,
        spentYear: input.spentYear,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'SHOPPING',
        activityType: input.mappingKey,
        moneyValue: input.moneyValue,
        moneyUnit: input.moneyUnit,
        note: input.note,
        estimate,
      });
    } else if (input.provider === 'CLIMATIQ' && input.category === 'PRODUCT') {
      estimate = await estimateProductWeightWithClimatiq({
        mappingKey: input.mappingKey,
        weightValue: input.weightValue,
        weightUnit: input.weightUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'PRODUCT',
        activityType: input.mappingKey,
        weightValue: input.weightValue,
        weightUnit: input.weightUnit,
        note: input.note,
        estimate,
      });
    } else if (input.category === 'TRANSPORT' && 'vehicleModelId' in input) {
      estimate = await estimateVehicleWithCarbonInterface({
        vehicleModelId: input.vehicleModelId,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'TRANSPORT',
        activityType: 'vehicle',
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
        note: input.note,
        estimate,
      });
    } else if (input.category === 'ELECTRICITY' && 'country' in input) {
      estimate = await estimateElectricityWithCarbonInterface({
        country: input.country,
        state: input.state,
        electricityValue: input.electricityValue,
        electricityUnit: input.electricityUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'ELECTRICITY',
        activityType: 'electricity',
        energyValue: input.electricityValue,
        energyUnit: input.electricityUnit,
        country: input.country,
        region: input.state,
        note: input.note,
        estimate,
      });
    } else if (input.category === 'FLIGHT' && 'legs' in input) {
      estimate = await estimateFlightWithCarbonInterface({
        passengers: input.passengers,
        legs: input.legs,
        distanceUnit: input.distanceUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'FLIGHT',
        activityType: input.legs
          .map((leg) => `${leg.departureAirport}-${leg.destinationAirport}`)
          .join(', '),
        quantityValue: input.passengers,
        quantityUnit: 'passenger',
        note: input.note,
        estimate,
      });
    } else if (input.category === 'SHIPPING') {
      estimate = await estimateShippingWithCarbonInterface({
        weightValue: input.weightValue,
        weightUnit: input.weightUnit,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
        transportMethod: input.transportMethod,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'SHIPPING',
        activityType: input.transportMethod,
        weightValue: input.weightValue,
        weightUnit: input.weightUnit,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
        note: input.note,
        estimate,
      });
    } else if (input.category === 'FUEL') {
      estimate = await estimateFuelCombustionWithCarbonInterface({
        fuelSourceType: input.fuelSourceType,
        fuelSourceUnit: input.fuelSourceUnit,
        fuelSourceValue: input.fuelSourceValue,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'FUEL',
        activityType: input.fuelSourceType,
        quantityValue: input.fuelSourceValue,
        quantityUnit: input.fuelSourceUnit,
        note: input.note,
        estimate,
      });
    } else if (input.category === 'TRANSPORT') {
      estimate = await estimateVehicleByType({
        vehicleType: input.vehicleType,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
        fuelType: input.fuelType,
        includeWtt: input.includeWtt,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'TRANSPORT',
        activityType: input.vehicleType,
        distanceValue: input.distanceValue,
        distanceUnit: input.distanceUnit,
        note: input.note,
        estimate,
      });
    } else if (input.category === 'ELECTRICITY') {
      estimate = await estimateElectricity({
        countryName: input.countryName,
        electricityValue: input.electricityValue,
        electricityUnit: input.electricityUnit,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'ELECTRICITY',
        activityType: 'electricity',
        energyValue: input.electricityValue,
        energyUnit: input.electricityUnit,
        country: input.countryName,
        note: input.note,
        estimate,
      });
    } else {
      estimate = await estimateFlight({
        from: input.from,
        to: input.to,
        flightClass: input.flightClass,
        roundTrip: input.roundTrip,
        includeRadiativeForcing: input.includeRadiativeForcing,
        includeWtt: input.includeWtt,
        passengers: input.passengers,
      });
      activity = await saveCarbonActivity({
        userId: dbUser.id,
        category: 'FLIGHT',
        activityType: `${input.from}-${input.to}`,
        quantityValue: input.passengers ?? 1,
        quantityUnit: 'passenger',
        note: input.note,
        estimate,
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/insights');
    revalidatePath('/profile');
    revalidatePath('/challenges');

    return NextResponse.json({
      activity: {
        id: activity.id,
        category: activity.category,
        activityType: activity.activityType,
        co2eKg: activity.co2eKg,
        provider: activity.provider,
        createdAt: activity.createdAt.toISOString(),
      },
      estimate: {
        co2eKg: estimate.co2eKg,
        fromCache: estimate.fromCache,
      },
    });
  } catch (error) {
    console.error('Carbon estimate failed', {
      provider: 'CARBON',
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Could not calculate this activity right now. Please check the values and try again.',
      },
      { status: 500 },
    );
  }
}
