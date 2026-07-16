// lib/validations.ts
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Утилиты
// ---------------------------------------------------------------------------

/** Строковое поле, обрезанное и очищенное от пробелов по краям */
const trimmedString = () => z.string().trim();

/** Положительное целое число */
const positiveInt = (max = 1_000_000_000) =>
  z.number().int().min(1).max(max);

/** Неотрицательное число (может быть 0) */
const nonNegativeNumber = (max = 1_000_000_000) =>
  z.number().min(0).max(max);

/** Дата в виде строки ISO (YYYY-MM-DD) */
const isoDate = () =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)');

// ---------------------------------------------------------------------------
// Схема для POST /api/analyze
// ---------------------------------------------------------------------------

export const analyzeSchema = z.object({
  name: trimmedString().optional(),
  address: trimmedString().optional(),
  venueType: z.enum(['restaurant', 'coffee', 'cafe', 'canteen', 'fastfood', 'darkkitchen']).optional(),
  totalArea: positiveInt(50000),
  hallArea: nonNegativeNumber(50000),
  seats: nonNegativeNumber(10000),
  staffCount: nonNegativeNumber(10000),
  avgCheck: nonNegativeNumber(100000),
  revenue: nonNegativeNumber(1_000_000_000),
  rent: nonNegativeNumber(100_000_000),
  utilities: nonNegativeNumber(100_000_000),
  payroll: nonNegativeNumber(100_000_000),
  managementCosts: nonNegativeNumber(100_000_000),
  costOfGoods: nonNegativeNumber(1_000_000_000),
  otherExpenses: nonNegativeNumber(100_000_000),
  price: z.number().optional(), // поле, которое может приходить от дашборда
});

// ---------------------------------------------------------------------------
// Схема для POST /api/audits (создание аудита)
// ---------------------------------------------------------------------------

export const auditCreateSchema = z.object({
  name: trimmedString().optional(),
  address: trimmedString().optional(),
  venueType: z.enum(['restaurant', 'coffee', 'cafe', 'canteen', 'fastfood', 'darkkitchen']).optional(),
  totalArea: positiveInt(50000),
  hallArea: nonNegativeNumber(50000),
  seats: nonNegativeNumber(10000),
  staffCount: nonNegativeNumber(10000),
  avgCheck: nonNegativeNumber(100000),
  revenue: nonNegativeNumber(1_000_000_000),
  rent: nonNegativeNumber(100_000_000),
  utilities: nonNegativeNumber(100_000_000),
  payroll: nonNegativeNumber(100_000_000),
  managementCosts: nonNegativeNumber(100_000_000),
  costOfGoods: nonNegativeNumber(1_000_000_000),
  otherExpenses: nonNegativeNumber(100_000_000),
  price: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Схема для PUT /api/audits/[id] (обновление аудита)
// ---------------------------------------------------------------------------

export const auditUpdateSchema = auditCreateSchema.partial().extend({
  id: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Схема для GET /api/audits/latest (query-параметры)
// ---------------------------------------------------------------------------

export const auditLatestQuerySchema = z.object({
  // пока без параметров, но можно добавить, например, фильтр по дате
});

// ---------------------------------------------------------------------------
// Схема для POST /api/admin/ttk (создание ТТК)
// ---------------------------------------------------------------------------

export const ttkCreateSchema = z.object({
  name: trimmedString().min(1, 'Название обязательно'),
  description: trimmedString().optional(),
  price: nonNegativeNumber(1_000_000),
  categoryId: z.string().uuid().optional(),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        quantity: positiveInt(10000),
      })
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Схема для PUT /api/admin/ttk/[id] (обновление ТТК)
// ---------------------------------------------------------------------------

export const ttkUpdateSchema = ttkCreateSchema.partial();

// ---------------------------------------------------------------------------
// Схема для POST /api/ingredients (создание ингредиента)
// ---------------------------------------------------------------------------

export const ingredientCreateSchema = z.object({
  name: trimmedString().min(1, 'Название ингредиента обязательно'),
  unit: z.enum(['kg', 'g', 'l', 'ml', 'pcs']),
  pricePerUnit: nonNegativeNumber(1_000_000),
});

// ---------------------------------------------------------------------------
// Схема для PUT /api/ingredients/[id] (обновление ингредиента)
// ---------------------------------------------------------------------------

export const ingredientUpdateSchema = ingredientCreateSchema.partial();

// ---------------------------------------------------------------------------
// Схема для POST /api/categories (создание категории)
// ---------------------------------------------------------------------------

export const categoryCreateSchema = z.object({
  name: trimmedString().min(1, 'Название категории обязательно'),
  parentId: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// Схема для PUT /api/categories/[id] (обновление категории)
// ---------------------------------------------------------------------------

export const categoryUpdateSchema = categoryCreateSchema.partial();

// ---------------------------------------------------------------------------
// Общая схема для идентификаторов в URL
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().min(1),
});