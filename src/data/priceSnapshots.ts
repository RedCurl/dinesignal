import type { PriceSnapshot } from '@/lib/types';

/**
 * Price snapshot history for ~50 menu items showing realistic price changes
 * over September 2024 – March 2025. Most items change 1-3 times with $0.50-$2.00 increases.
 */

let _sid = 0;
const snap = (menu_item_id: string, price: number, captured_at: string): PriceSnapshot => ({
  id: `snap-${++_sid}`,
  menu_item_id,
  price,
  captured_at,
});

export const priceSnapshots: PriceSnapshot[] = [
  // mi-1: Evvia Grilled Octopus — $17 → $18 → $19
  snap('mi-1', 17, '2024-09-01'),
  snap('mi-1', 18, '2024-11-15'),
  snap('mi-1', 19, '2025-02-01'),

  // mi-3: Evvia Lamb Chops — $39 → $41 → $42
  snap('mi-3', 39, '2024-09-01'),
  snap('mi-3', 41, '2024-12-01'),
  snap('mi-3', 42, '2025-02-15'),

  // mi-4: Evvia Branzino — $36 → $38
  snap('mi-4', 36, '2024-09-01'),
  snap('mi-4', 38, '2025-01-10'),

  // mi-14: Tamarine Shaking Beef — $30 → $31 → $32
  snap('mi-14', 30, '2024-09-01'),
  snap('mi-14', 31, '2024-11-20'),
  snap('mi-14', 32, '2025-01-15'),

  // mi-17: Tamarine Lemongrass Chicken — $22 → $23 → $24
  snap('mi-17', 22, '2024-09-01'),
  snap('mi-17', 23, '2024-12-10'),
  snap('mi-17', 24, '2025-03-01'),

  // mi-27: Oren's Falafel Plate — $15 → $16
  snap('mi-27', 15, '2024-09-01'),
  snap('mi-27', 16, '2025-01-05'),

  // mi-28: Oren's Chicken Shawarma — $17 → $18
  snap('mi-28', 17, '2024-09-01'),
  snap('mi-28', 18, '2024-12-15'),

  // mi-39: Nobu Black Cod Miso — $35 → $37 → $38
  snap('mi-39', 35, '2024-09-01'),
  snap('mi-39', 37, '2024-11-01'),
  snap('mi-39', 38, '2025-01-20'),

  // mi-44: Nobu Omakase — $78 → $82 → $85
  snap('mi-44', 78, '2024-09-01'),
  snap('mi-44', 82, '2024-11-15'),
  snap('mi-44', 85, '2025-02-01'),

  // mi-53: Pizzeria Delfina Margherita — $16 → $17 → $18
  snap('mi-53', 16, '2024-09-01'),
  snap('mi-53', 17, '2024-11-10'),
  snap('mi-53', 18, '2025-01-15'),

  // mi-54: Delfina Salsiccia — $19 → $20 → $21
  snap('mi-54', 19, '2024-09-01'),
  snap('mi-54', 20, '2024-12-05'),
  snap('mi-54', 21, '2025-02-20'),

  // mi-66: Protege Dry-Aged Ribeye — $54 → $56 → $58
  snap('mi-66', 54, '2024-09-01'),
  snap('mi-66', 56, '2024-11-20'),
  snap('mi-66', 58, '2025-02-10'),

  // mi-69: Protege Mushroom Risotto — $26 → $28
  snap('mi-69', 26, '2024-09-01'),
  snap('mi-69', 28, '2025-01-05'),

  // mi-79: Bird Dog Hamachi Tartare — $17 → $18 → $19
  snap('mi-79', 17, '2024-09-01'),
  snap('mi-79', 18, '2024-11-15'),
  snap('mi-79', 19, '2025-02-01'),

  // mi-82: Bird Dog Wagyu Donburi — $32 → $34
  snap('mi-82', 32, '2024-09-01'),
  snap('mi-82', 34, '2025-01-10'),

  // mi-92: Palo Alto Sol Carne Asada Burrito — $13 → $14 → $15
  snap('mi-92', 13, '2024-09-01'),
  snap('mi-92', 14, '2024-11-01'),
  snap('mi-92', 15, '2025-01-20'),

  // mi-95: Palo Alto Sol Fish Tacos — $14 → $15 → $16
  snap('mi-95', 14, '2024-09-01'),
  snap('mi-95', 15, '2024-12-10'),
  snap('mi-95', 16, '2025-03-01'),

  // mi-107: Vaso Azzurro Pappardelle Bolognese — $22 → $23 → $24
  snap('mi-107', 22, '2024-09-01'),
  snap('mi-107', 23, '2024-11-20'),
  snap('mi-107', 24, '2025-01-15'),

  // mi-111: Vaso Azzurro Osso Buco — $32 → $34
  snap('mi-111', 32, '2024-09-01'),
  snap('mi-111', 34, '2025-02-01'),

  // mi-118: The Counter Classic Burger — $12 → $13 → $14
  snap('mi-118', 12, '2024-09-01'),
  snap('mi-118', 13, '2024-11-15'),
  snap('mi-118', 14, '2025-01-10'),

  // mi-120: The Counter BBQ Bacon Burger — $15 → $16 → $17
  snap('mi-120', 15, '2024-09-01'),
  snap('mi-120', 16, '2024-12-01'),
  snap('mi-120', 17, '2025-02-15'),

  // mi-131: Joya Grilled Skirt Steak — $26 → $28
  snap('mi-131', 26, '2024-09-01'),
  snap('mi-131', 28, '2025-01-05'),

  // mi-135: Joya Seafood Paella — $28 → $30
  snap('mi-135', 28, '2024-09-01'),
  snap('mi-135', 30, '2025-02-10'),

  // mi-142: Siam Royal Pad Thai — $14 → $15 → $16
  snap('mi-142', 14, '2024-09-01'),
  snap('mi-142', 15, '2024-11-10'),
  snap('mi-142', 16, '2025-01-20'),

  // mi-144: Siam Royal Massaman Curry — $16 → $17 → $18
  snap('mi-144', 16, '2024-09-01'),
  snap('mi-144', 17, '2024-12-15'),
  snap('mi-144', 18, '2025-02-28'),

  // mi-155: Rangoon Ruby Tea Leaf Salad — $12 → $13 → $14
  snap('mi-155', 12, '2024-09-01'),
  snap('mi-155', 13, '2024-11-01'),
  snap('mi-155', 14, '2025-01-15'),

  // mi-159: Rangoon Ruby Mango Chicken — $16 → $17 → $18
  snap('mi-159', 16, '2024-09-01'),
  snap('mi-159', 17, '2024-12-05'),
  snap('mi-159', 18, '2025-02-15'),

  // mi-168: Sundance New York Strip — $52 → $54 → $56
  snap('mi-168', 52, '2024-09-01'),
  snap('mi-168', 54, '2024-11-20'),
  snap('mi-168', 56, '2025-02-01'),

  // mi-170: Sundance Bone-In Ribeye — $58 → $60 → $62
  snap('mi-170', 58, '2024-09-01'),
  snap('mi-170', 60, '2024-12-10'),
  snap('mi-170', 62, '2025-02-20'),

  // mi-182: Terun Margherita DOC — $15 → $16 → $17
  snap('mi-182', 15, '2024-09-01'),
  snap('mi-182', 16, '2024-11-15'),
  snap('mi-182', 17, '2025-01-10'),

  // mi-184: Terun Cacio e Pepe — $16 → $17 → $18
  snap('mi-184', 16, '2024-09-01'),
  snap('mi-184', 17, '2024-12-01'),
  snap('mi-184', 18, '2025-02-10'),

  // mi-199: Cascal Paella Valenciana — $22 → $24
  snap('mi-199', 22, '2024-09-01'),
  snap('mi-199', 24, '2025-01-15'),

  // mi-210: Sushi Tomi Sashimi Deluxe — $28 → $30 → $32
  snap('mi-210', 28, '2024-09-01'),
  snap('mi-210', 30, '2024-11-20'),
  snap('mi-210', 32, '2025-01-20'),

  // mi-213: Sushi Tomi Dragon Roll — $16 → $17 → $18
  snap('mi-213', 16, '2024-09-01'),
  snap('mi-213', 17, '2024-12-05'),
  snap('mi-213', 18, '2025-02-15'),

  // mi-247: Scratch Burger — $15 → $16 → $17
  snap('mi-247', 15, '2024-09-01'),
  snap('mi-247', 16, '2024-11-10'),
  snap('mi-247', 17, '2025-01-10'),

  // mi-259: Camper Wood-Fired Chicken — $26 → $28
  snap('mi-259', 26, '2024-09-01'),
  snap('mi-259', 28, '2025-01-15'),

  // mi-261: Camper Pan-Seared Trout — $24 → $26
  snap('mi-261', 24, '2024-09-01'),
  snap('mi-261', 26, '2025-02-01'),

  // mi-272: Bistro Vida Steak Frites — $28 → $30
  snap('mi-272', 28, '2024-09-01'),
  snap('mi-272', 30, '2025-01-20'),

  // mi-276: Bistro Vida Niçoise Salad — $16 → $17 → $18
  snap('mi-276', 16, '2024-09-01'),
  snap('mi-276', 17, '2024-12-10'),
  snap('mi-276', 18, '2025-02-15'),

  // mi-297: Left Bank Steak Frites — $30 → $32
  snap('mi-297', 30, '2024-09-01'),
  snap('mi-297', 32, '2025-01-10'),

  // mi-316: Zola Roasted Lamb Rack — $34 → $36
  snap('mi-316', 34, '2024-09-01'),
  snap('mi-316', 36, '2025-02-01'),

  // mi-327: Reposado Carnitas Tacos — $14 → $15 → $16
  snap('mi-327', 14, '2024-09-01'),
  snap('mi-327', 15, '2024-11-15'),
  snap('mi-327', 16, '2025-01-20'),

  // mi-339: Din Tai Fung Xiao Long Bao — $12 → $13 → $14
  snap('mi-339', 12, '2024-09-01'),
  snap('mi-339', 13, '2024-11-01'),
  snap('mi-339', 14, '2025-01-15'),

  // mi-344: Din Tai Fung Beef Noodle Soup — $16 → $17 → $18
  snap('mi-344', 16, '2024-09-01'),
  snap('mi-344', 17, '2024-12-10'),
  snap('mi-344', 18, '2025-02-20'),

  // mi-353: Gochi Yellowtail Carpaccio — $13 → $14 → $15
  snap('mi-353', 13, '2024-09-01'),
  snap('mi-353', 14, '2024-11-20'),
  snap('mi-353', 15, '2025-01-10'),

  // mi-357: Gochi Grilled Mackerel — $15 → $16 → $17
  snap('mi-357', 15, '2024-09-01'),
  snap('mi-357', 16, '2024-12-05'),
  snap('mi-357', 17, '2025-02-15'),

  // mi-381: Janta Chicken Tikka Masala — $16 → $17 → $18
  snap('mi-381', 16, '2024-09-01'),
  snap('mi-381', 17, '2024-11-15'),
  snap('mi-381', 18, '2025-01-20'),

  // mi-386: Janta Biryani — $17 → $18 → $19
  snap('mi-386', 17, '2024-09-01'),
  snap('mi-386', 18, '2024-12-01'),
  snap('mi-386', 19, '2025-02-10'),

  // mi-395: Darbar Chicken Tikka Masala — $15 → $16 → $17
  snap('mi-395', 15, '2024-09-01'),
  snap('mi-395', 16, '2024-11-10'),
  snap('mi-395', 17, '2025-01-15'),

  // mi-405: Korea Palace Bulgogi — $17 → $18 → $19
  snap('mi-405', 17, '2024-09-01'),
  snap('mi-405', 18, '2024-12-15'),
  snap('mi-405', 19, '2025-02-20'),

  // mi-410: Korea Palace Galbi — $22 → $24
  snap('mi-410', 22, '2024-09-01'),
  snap('mi-410', 24, '2025-01-10'),
];
