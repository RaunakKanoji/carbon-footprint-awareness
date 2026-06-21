export function normalizeBarcode(input: string) {
  return input.replace(/\s+/g, '').trim();
}

export function isValidBarcode(input: string) {
  const barcode = normalizeBarcode(input);

  if (!/^\d+$/.test(barcode)) return false;

  return barcode.length >= 8 && barcode.length <= 14;
}
