/** Base de comidas con información nutricional por 100 g (o 100 ml en bebidas).
 * Valores aproximados de referencia. El usuario puede sumar comidas propias. */
export interface Food {
  name: string;
  cat: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  custom?: boolean;
}

export const FOOD_DB: Food[] = [
  // Proteínas
  { name: 'Pechuga de pollo cocida', cat: 'Proteínas', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Carne de res magra cocida', cat: 'Proteínas', kcal: 217, protein: 26, carbs: 0, fat: 12 },
  { name: 'Lomo de cerdo cocido', cat: 'Proteínas', kcal: 143, protein: 26, carbs: 0, fat: 4 },
  { name: 'Pavo pechuga', cat: 'Proteínas', kcal: 135, protein: 29, carbs: 0, fat: 1 },
  { name: 'Merluza cocida', cat: 'Proteínas', kcal: 90, protein: 18, carbs: 0, fat: 1.5 },
  { name: 'Salmón', cat: 'Proteínas', kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Atún al agua (lata)', cat: 'Proteínas', kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { name: 'Camarones', cat: 'Proteínas', kcal: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { name: 'Huevo entero', cat: 'Proteínas', kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Clara de huevo', cat: 'Proteínas', kcal: 52, protein: 11, carbs: 0.7, fat: 0.2 },

  // Lácteos y huevos
  { name: 'Yogur griego natural', cat: 'Lácteos', kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: 'Yogur natural', cat: 'Lácteos', kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'Leche entera', cat: 'Lácteos', kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Leche descremada', cat: 'Lácteos', kcal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  { name: 'Quesillo / cottage', cat: 'Lácteos', kcal: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: 'Queso fresco', cat: 'Lácteos', kcal: 174, protein: 12, carbs: 4, fat: 12 },
  { name: 'Queso gauda', cat: 'Lácteos', kcal: 356, protein: 25, carbs: 2, fat: 27 },

  // Cereales y legumbres
  { name: 'Arroz blanco cocido', cat: 'Cereales', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Arroz integral cocido', cat: 'Cereales', kcal: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: 'Avena (cruda)', cat: 'Cereales', kcal: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Pan integral', cat: 'Cereales', kcal: 247, protein: 13, carbs: 41, fat: 3.4 },
  { name: 'Pan blanco / marraqueta', cat: 'Cereales', kcal: 270, protein: 8, carbs: 55, fat: 1.5 },
  { name: 'Fideos cocidos', cat: 'Cereales', kcal: 158, protein: 6, carbs: 31, fat: 0.9 },
  { name: 'Papa cocida', cat: 'Cereales', kcal: 87, protein: 2, carbs: 20, fat: 0.1 },
  { name: 'Quinoa cocida', cat: 'Cereales', kcal: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'Choclo / maíz', cat: 'Cereales', kcal: 96, protein: 3.4, carbs: 21, fat: 1.5 },
  { name: 'Tortilla de maíz', cat: 'Cereales', kcal: 218, protein: 5.7, carbs: 45, fat: 2.5 },
  { name: 'Lentejas cocidas', cat: 'Legumbres', kcal: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'Porotos cocidos', cat: 'Legumbres', kcal: 127, protein: 9, carbs: 23, fat: 0.5 },
  { name: 'Garbanzos cocidos', cat: 'Legumbres', kcal: 164, protein: 9, carbs: 27, fat: 2.6 },

  // Frutas
  { name: 'Plátano / banana', cat: 'Frutas', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Manzana', cat: 'Frutas', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Naranja', cat: 'Frutas', kcal: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: 'Pera', cat: 'Frutas', kcal: 57, protein: 0.4, carbs: 15, fat: 0.1 },
  { name: 'Frutilla', cat: 'Frutas', kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { name: 'Arándanos', cat: 'Frutas', kcal: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: 'Uvas', cat: 'Frutas', kcal: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { name: 'Kiwi', cat: 'Frutas', kcal: 61, protein: 1.1, carbs: 15, fat: 0.5 },
  { name: 'Sandía', cat: 'Frutas', kcal: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  { name: 'Palta / aguacate', cat: 'Frutas', kcal: 160, protein: 2, carbs: 9, fat: 15 },

  // Verduras
  { name: 'Brócoli', cat: 'Verduras', kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Espinaca', cat: 'Verduras', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: 'Tomate', cat: 'Verduras', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Lechuga', cat: 'Verduras', kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: 'Zanahoria', cat: 'Verduras', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: 'Zapallo italiano', cat: 'Verduras', kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { name: 'Pimentón', cat: 'Verduras', kcal: 31, protein: 1, carbs: 6, fat: 0.3 },
  { name: 'Pepino', cat: 'Verduras', kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: 'Cebolla', cat: 'Verduras', kcal: 40, protein: 1.1, carbs: 9, fat: 0.1 },
  { name: 'Poroto verde', cat: 'Verduras', kcal: 31, protein: 1.8, carbs: 7, fat: 0.2 },

  // Grasas y frutos secos
  { name: 'Almendras', cat: 'Grasas', kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { name: 'Nueces', cat: 'Grasas', kcal: 654, protein: 15, carbs: 14, fat: 65 },
  { name: 'Maní', cat: 'Grasas', kcal: 567, protein: 26, carbs: 16, fat: 49 },
  { name: 'Mantequilla de maní', cat: 'Grasas', kcal: 588, protein: 25, carbs: 20, fat: 50 },
  { name: 'Semillas de chía', cat: 'Grasas', kcal: 486, protein: 17, carbs: 42, fat: 31 },
  { name: 'Aceite de oliva', cat: 'Grasas', kcal: 884, protein: 0, carbs: 0, fat: 100 },

  // Snacks y otros
  { name: 'Proteína whey (polvo)', cat: 'Suplementos', kcal: 375, protein: 75, carbs: 10, fat: 6 },
  { name: 'Barra de proteína', cat: 'Snacks', kcal: 350, protein: 30, carbs: 40, fat: 10 },
  { name: 'Chocolate amargo 70%', cat: 'Snacks', kcal: 598, protein: 7.8, carbs: 46, fat: 43 },
  { name: 'Galletas de arroz', cat: 'Snacks', kcal: 387, protein: 8, carbs: 82, fat: 3 },
  { name: 'Miel', cat: 'Snacks', kcal: 304, protein: 0.3, carbs: 82, fat: 0 },

  // Bebidas
  { name: 'Jugo de naranja', cat: 'Bebidas', kcal: 45, protein: 0.7, carbs: 10, fat: 0.2 },
  { name: 'Bebida cola', cat: 'Bebidas', kcal: 42, protein: 0, carbs: 10.6, fat: 0 },
  { name: 'Bebida cola zero', cat: 'Bebidas', kcal: 0, protein: 0, carbs: 0, fat: 0 },
  { name: 'Leche de almendras s/azúcar', cat: 'Bebidas', kcal: 15, protein: 0.6, carbs: 0.6, fat: 1.2 },
  { name: 'Café negro', cat: 'Bebidas', kcal: 1, protein: 0.1, carbs: 0, fat: 0 },
  { name: 'Cerveza', cat: 'Bebidas', kcal: 43, protein: 0.5, carbs: 3.6, fat: 0 },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Busca en la base (+ comidas propias) por nombre o categoría. */
export function searchFoods(query: string, custom: Food[] = []): Food[] {
  const all = [...custom, ...FOOD_DB];
  const q = norm(query.trim());
  if (!q) return all.slice(0, 40);
  return all.filter((f) => norm(f.name).includes(q) || norm(f.cat).includes(q)).slice(0, 40);
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Macros de una porción en gramos a partir de los valores por 100 g. */
export function macrosFor(food: Food, grams: number): Macros {
  const k = grams / 100;
  return {
    kcal: Math.round(food.kcal * k),
    protein: Math.round(food.protein * k * 10) / 10,
    carbs: Math.round(food.carbs * k * 10) / 10,
    fat: Math.round(food.fat * k * 10) / 10,
  };
}
