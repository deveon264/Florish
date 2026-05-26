export type FoodItem = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
};

export const FOOD_DATABASE: Record<string, FoodItem> = {
  // Proteins
  chicken: { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: "100g" },
  "chicken breast": { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: "100g" },
  salmon: { name: "Salmon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: "100g" },
  tuna: { name: "Tuna (100g)", calories: 132, protein: 29, carbs: 0, fat: 1, servingSize: "100g" },
  egg: { name: "Egg (1 large)", calories: 72, protein: 6, carbs: 0, fat: 5, servingSize: "1 egg" },
  eggs: { name: "Eggs (2 large)", calories: 144, protein: 12, carbs: 0, fat: 10, servingSize: "2 eggs" },
  beef: { name: "Ground Beef (100g)", calories: 217, protein: 26, carbs: 0, fat: 12, servingSize: "100g" },
  turkey: { name: "Turkey Breast (100g)", calories: 135, protein: 30, carbs: 0, fat: 1, servingSize: "100g" },
  shrimp: { name: "Shrimp (100g)", calories: 99, protein: 24, carbs: 0, fat: 0.3, servingSize: "100g" },
  tofu: { name: "Tofu (100g)", calories: 76, protein: 8, carbs: 2, fat: 4, servingSize: "100g" },

  // Grains
  rice: { name: "White Rice (1 cup cooked)", calories: 206, protein: 4, carbs: 45, fat: 0, servingSize: "1 cup" },
  "brown rice": { name: "Brown Rice (1 cup cooked)", calories: 216, protein: 5, carbs: 45, fat: 2, servingSize: "1 cup" },
  oats: { name: "Oatmeal (1 cup cooked)", calories: 154, protein: 6, carbs: 28, fat: 3, servingSize: "1 cup" },
  oatmeal: { name: "Oatmeal (1 cup cooked)", calories: 154, protein: 6, carbs: 28, fat: 3, servingSize: "1 cup" },
  bread: { name: "Bread (1 slice)", calories: 79, protein: 3, carbs: 15, fat: 1, servingSize: "1 slice" },
  pasta: { name: "Pasta (1 cup cooked)", calories: 220, protein: 8, carbs: 43, fat: 1, servingSize: "1 cup" },
  quinoa: { name: "Quinoa (1 cup cooked)", calories: 222, protein: 8, carbs: 39, fat: 4, servingSize: "1 cup" },

  // Vegetables
  broccoli: { name: "Broccoli (1 cup)", calories: 31, protein: 3, carbs: 6, fat: 0, servingSize: "1 cup" },
  spinach: { name: "Spinach (1 cup)", calories: 7, protein: 1, carbs: 1, fat: 0, servingSize: "1 cup" },
  salad: { name: "Garden Salad", calories: 20, protein: 1, carbs: 4, fat: 0, servingSize: "1 cup" },
  avocado: { name: "Avocado (half)", calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: "half" },
  sweet_potato: { name: "Sweet Potato (medium)", calories: 103, protein: 2, carbs: 24, fat: 0, servingSize: "1 medium" },
  "sweet potato": { name: "Sweet Potato (medium)", calories: 103, protein: 2, carbs: 24, fat: 0, servingSize: "1 medium" },

  // Fruits
  banana: { name: "Banana (medium)", calories: 105, protein: 1, carbs: 27, fat: 0, servingSize: "1 medium" },
  apple: { name: "Apple (medium)", calories: 95, protein: 0, carbs: 25, fat: 0, servingSize: "1 medium" },
  orange: { name: "Orange (medium)", calories: 62, protein: 1, carbs: 15, fat: 0, servingSize: "1 medium" },
  strawberries: { name: "Strawberries (1 cup)", calories: 49, protein: 1, carbs: 12, fat: 0, servingSize: "1 cup" },
  blueberries: { name: "Blueberries (1 cup)", calories: 84, protein: 1, carbs: 21, fat: 0, servingSize: "1 cup" },
  mango: { name: "Mango (1 cup)", calories: 107, protein: 1, carbs: 28, fat: 0, servingSize: "1 cup" },

  // Dairy
  milk: { name: "Whole Milk (1 cup)", calories: 149, protein: 8, carbs: 12, fat: 8, servingSize: "1 cup" },
  yogurt: { name: "Greek Yogurt (1 cup)", calories: 100, protein: 17, carbs: 6, fat: 0, servingSize: "1 cup" },
  "greek yogurt": { name: "Greek Yogurt (1 cup)", calories: 100, protein: 17, carbs: 6, fat: 0, servingSize: "1 cup" },
  cheese: { name: "Cheddar Cheese (1 oz)", calories: 113, protein: 7, carbs: 0, fat: 9, servingSize: "1 oz" },

  // Common meals
  pizza: { name: "Pizza (1 slice)", calories: 285, protein: 12, carbs: 36, fat: 10, servingSize: "1 slice" },
  burger: { name: "Burger (regular)", calories: 354, protein: 20, carbs: 29, fat: 17, servingSize: "1 burger" },
  salad_chicken: { name: "Chicken Salad", calories: 180, protein: 22, carbs: 8, fat: 7, servingSize: "1 serving" },
  "protein shake": { name: "Protein Shake", calories: 150, protein: 25, carbs: 8, fat: 3, servingSize: "1 shake" },
  smoothie: { name: "Protein Smoothie", calories: 200, protein: 15, carbs: 30, fat: 4, servingSize: "1 cup" },
  "peanut butter": { name: "Peanut Butter (2 tbsp)", calories: 190, protein: 8, carbs: 6, fat: 16, servingSize: "2 tbsp" },
  almonds: { name: "Almonds (1 oz)", calories: 164, protein: 6, carbs: 6, fat: 14, servingSize: "1 oz" },
  coffee: { name: "Black Coffee", calories: 5, protein: 0, carbs: 1, fat: 0, servingSize: "1 cup" },
  "coffee with milk": { name: "Coffee with Milk", calories: 45, protein: 2, carbs: 6, fat: 1.5, servingSize: "1 cup" },
  latte: { name: "Latte (medium)", calories: 190, protein: 13, carbs: 19, fat: 7, servingSize: "medium" },
};

export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  const results: FoodItem[] = [];

  for (const [key, item] of Object.entries(FOOD_DATABASE)) {
    if (key.includes(q) || item.name.toLowerCase().includes(q)) {
      if (!results.find((r) => r.name === item.name)) {
        results.push(item);
      }
    }
  }

  return results.slice(0, 5);
}

export function estimateFromDescription(description: string): FoodItem | null {
  const q = description.toLowerCase().trim();

  // Try exact match first
  if (FOOD_DATABASE[q]) return FOOD_DATABASE[q]!;

  // Try partial matches
  for (const [key, item] of Object.entries(FOOD_DATABASE)) {
    if (q.includes(key) || key.includes(q)) {
      return item;
    }
  }

  // Generic estimates
  if (q.includes("salad")) return { name: description, calories: 150, protein: 8, carbs: 12, fat: 6, servingSize: "1 serving" };
  if (q.includes("sandwich")) return { name: description, calories: 320, protein: 18, carbs: 38, fat: 10, servingSize: "1 sandwich" };
  if (q.includes("soup")) return { name: description, calories: 150, protein: 8, carbs: 18, fat: 4, servingSize: "1 bowl" };
  if (q.includes("stir fry") || q.includes("stir-fry")) return { name: description, calories: 280, protein: 20, carbs: 28, fat: 8, servingSize: "1 serving" };
  if (q.includes("wrap")) return { name: description, calories: 350, protein: 22, carbs: 35, fat: 12, servingSize: "1 wrap" };
  if (q.includes("bowl")) return { name: description, calories: 400, protein: 25, carbs: 45, fat: 12, servingSize: "1 bowl" };

  return null;
}
