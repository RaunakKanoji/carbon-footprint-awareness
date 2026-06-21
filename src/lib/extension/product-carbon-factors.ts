export type ProductCarbonCategory =
  | 'clothing_tshirt'
  | 'clothing_jeans'
  | 'clothing_shoes'
  | 'clothing_jacket'
  | 'electronics_phone'
  | 'electronics_laptop'
  | 'electronics_accessory'
  | 'grocery_packaged_food'
  | 'grocery_fresh_produce'
  | 'grocery_dairy'
  | 'grocery_meat'
  | 'home_furniture'
  | 'home_appliance'
  | 'beauty_personal_care'
  | 'books_stationery'
  | 'generic_low'
  | 'generic_medium'
  | 'generic_high';

export const productCarbonFactorsKg: Record<ProductCarbonCategory, number> = {
  clothing_tshirt: 6.5,
  clothing_jeans: 25,
  clothing_shoes: 14,
  clothing_jacket: 30,
  electronics_phone: 70,
  electronics_laptop: 250,
  electronics_accessory: 5,
  grocery_packaged_food: 1.5,
  grocery_fresh_produce: 0.5,
  grocery_dairy: 2.5,
  grocery_meat: 8,
  home_furniture: 80,
  home_appliance: 120,
  beauty_personal_care: 2,
  books_stationery: 1,
  generic_low: 1,
  generic_medium: 8,
  generic_high: 30,
};

export const categoryKeywords: Record<Exclude<ProductCarbonCategory, 'generic_low' | 'generic_medium' | 'generic_high'>, string[]> = {
  clothing_tshirt: ['t-shirt', 'tshirt', 'tee', 'shirt', 'top', 'polo'],
  clothing_jeans: ['jeans', 'denim', 'trouser', 'pants'],
  clothing_shoes: ['shoe', 'sneaker', 'trainer', 'boot', 'heel', 'sandal', 'footwear', 'crocs', 'slippers'],
  clothing_jacket: ['jacket', 'coat', 'blazer', 'sweater', 'hoodie', 'cardigan', 'pullover', 'windbreaker'],
  electronics_phone: ['phone', 'smartphone', 'iphone', 'pixel', 'samsung galaxy', 'oneplus'],
  electronics_laptop: ['laptop', 'macbook', 'notebook', 'chromebook'],
  electronics_accessory: ['charger', 'cable', 'case', 'headphone', 'earphone', 'airpods', 'mouse', 'keyboard', 'adapter', 'power bank'],
  grocery_meat: ['chicken', 'meat', 'beef', 'mutton', 'fish', 'salmon', 'tuna', 'pork', 'lamb', 'turkey', 'shrimp', 'seafood'],
  grocery_dairy: ['milk', 'cheese', 'butter', 'paneer', 'yogurt', 'curd', 'cream', 'ghee'],
  grocery_packaged_food: ['packaged', 'chips', 'biscuit', 'cookie', 'cereal', 'pasta', 'noodle', 'sauce', 'jam', 'snack', 'chocolate', 'puffcorn', 'bread', 'soda', 'coke'],
  grocery_fresh_produce: ['apple', 'banana', 'orange', 'potato', 'onion', 'tomato', 'vegetable', 'fruit', 'salad', 'spinach', 'carrot', 'cucumber', 'lemon'],
  home_furniture: ['sofa', 'chair', 'table', 'bed', 'desk', 'wardrobe', 'cupboard', 'furniture', 'couch', 'bookshelf'],
  home_appliance: ['refrigerator', 'fridge', 'washing machine', 'dryer', 'oven', 'microwave', 'dishwasher', 'vacuum', 'ac', 'air conditioner', 'television', 'tv', 'fan'],
  beauty_personal_care: ['shampoo', 'soap', 'lotion', 'cream', 'perfume', 'makeup', 'lipstick', 'face wash', 'deodorant', 'toothpaste'],
  books_stationery: ['book', 'notebook', 'pen', 'pencil', 'paper', 'diary', 'marker', 'stapler'],
};

export function inferCategoryByName(name: string, price?: number): ProductCarbonCategory {
  const lowercaseName = name.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowercaseName.includes(keyword))) {
      return category as ProductCarbonCategory;
    }
  }

  // Generic fallback based on price if available
  if (price !== undefined) {
    if (price > 15000) return 'generic_high';
    if (price > 2000) return 'generic_medium';
  }

  return 'generic_low';
}
