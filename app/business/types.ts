// app/business/types.ts

export interface Category {
  id: string;
  name: string;
  timePerDish: number; // минут на 1 блюдо
  price: number;       // рублей за 1 блюдо
}

export interface CommonSettings {
  shiftHours: number;
  loadFactor: number; // 0–1
}

export interface KitchenResult {
  availableTime: number; // минут
  categories: Category[];
  optimalMix: {
    categoryId: string;
    dishes: number;
    timeUsed: number;
    revenue: number;
  }[];
  totalDishes: number;
  totalRevenue: number;
  utilization: number; // % использования времени
}

export interface CoffeeResult {
  maxDrinks: number;
  revenue: number;
}

export interface HallResult {
  maxGuests: number;
  revenue: number;
}

export interface Summary {
  kitchenRevenue: number;
  coffeeRevenue: number;
  hallRevenue: number;
  totalRevenue: number;
  bottleneck: 'kitchen' | 'coffee' | 'hall' | null;
  recommendation: string;
}