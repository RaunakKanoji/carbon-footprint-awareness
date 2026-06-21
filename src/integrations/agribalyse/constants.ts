export const AGRIBALYSE_PROVIDER = 'AGRIBALYSE' as const;

export const DEFAULT_AGRIBALYSE_VERSION = process.env.AGRIBALYSE_DATA_VERSION || '3.2';

export const AGRIBALYSE_SOURCE_NAME = process.env.AGRIBALYSE_SOURCE_NAME || 'AGRIBALYSE';

export const AGRIBALYSE_UNIT = 'kg';

export const AGRIBALYSE_COLUMN_ALIASES = {
  agribalyseId: [
    'agribalyse_id',
    'Agribalyse ID',
    'Code AGB',
    'Ciqual  AGB',
    'Ciqual AGB',
    'ID',
    'id',
  ],
  ciqualCode: [
    'ciqual_code',
    'CIQUAL code',
    'Code CIQUAL',
    'Ciqual  code',
    'Ciqual code',
    'ciqual',
  ],
  foodCode: ['food_code', 'Food code', 'Code'],
  name: [
    'name',
    'Name',
    'Food name',
    'Nom du Produit en Français',
    'Nom du Produit',
    'Nom Français',
    'Nom',
    'LCI Name',
    'Product name',
  ],
  nameFr: [
    'name_fr',
    'Nom du Produit en Français',
    'Nom Français',
    'Nom du Produit',
    'Nom',
    'French name',
  ],
  nameEn: ['name_en', 'LCI Name', 'Name', 'English name', 'Product name'],
  category: [
    'category',
    'Category',
    "Groupe d'aliment",
    'Groupe',
    'Group',
    'Food group',
  ],
  subCategory: [
    'sub_category',
    'Sub-category',
    "Sous-groupe d'aliment",
    'Sous-groupe',
    'Sub group',
  ],
  groupName: ['group_name', 'Group name', "Groupe d'aliment", 'Groupe', 'Food group'],
  climateChangeKgCo2ePerKg: [
    'climate_change',
    'Climate change',
    'kg CO2 eq/kg',
    'kgCO2e/kg',
    'Climate change kg CO2 eq/kg',
    'Changement climatique',
    'EF 3.1',
    'Score unique EF',
  ],
  unit: ['unit', 'Unit', 'Unité'],
} as const;

export function isAgribalysePlaygroundEnabled() {
  return process.env.ENABLE_DEV_API_PLAYGROUND === 'true';
}
