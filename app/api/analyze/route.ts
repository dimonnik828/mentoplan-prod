// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  return apiHandler({
    request,
    handler: async (parsed: any) => {
      // Достаём только те поля, которые есть в Prisma-схеме
      // venueType из запроса здесь просто игнорируется
      const {
        name, address, totalArea, hallArea, seats, staffCount,
        avgCheck, revenue, rent, utilities, payroll,
        managementCosts, costOfGoods, otherExpenses,
      } = parsed;

      // Безопасные дефолты
      const safeRevenue = revenue || 0;
      const safeRent = rent || 0;
      const safeUtilities = utilities || 0;
      const safePayroll = payroll || 0;
      const safeManagement = managementCosts || 0;
      const safeCOGS = costOfGoods || 0;
      const safeOther = otherExpenses || 0;

      // Серверный пересчёт процентов
      const foodCostPercent = safeRevenue ? Math.round((safeCOGS / safeRevenue) * 100) : 0;
      const payrollPercent = safeRevenue ? Math.round((safePayroll / safeRevenue) * 100) : 0;
      const rentPercent = safeRevenue ? Math.round((safeRent / safeRevenue) * 100) : 0;
      const utilitiesPercent = safeRevenue ? Math.round((safeUtilities / safeRevenue) * 100) : 0;
      const managementPercent = safeRevenue ? Math.round((safeManagement / safeRevenue) * 100) : 0;
      const otherPercent = safeRevenue ? Math.round((safeOther / safeRevenue) * 100) : 0;

      const operatingProfit = safeRevenue - safeRent - safeUtilities - safePayroll - safeManagement - safeCOGS - safeOther;
      const profitPercent = safeRevenue ? Math.round((operatingProfit / safeRevenue) * 100) : 0;

      const healthIndex = Math.min(100, Math.max(0, Math.round(
        100
        - (rentPercent > 14 ? (rentPercent - 14) * 2 : 0)
        - (payrollPercent > 25 ? (payrollPercent - 25) * 1.5 : 0)
        - (foodCostPercent > 32 ? (foodCostPercent - 32) * 1.2 : 0)
        + (profitPercent > 10 ? (profitPercent - 10) * 2 : 0)
      )));

      // Создаём запись, передавая ВСЕ обязательные поля
      const audit = await prisma.audit.create({
        data: {
          name: name || 'Без названия',
          address: address || 'Адрес не указан', // Обязательное поле (String)
          totalArea: totalArea || 0,
          hallArea: hallArea || 0,
          seats: seats || 0,
          staffCount: staffCount || 0,
          avgCheck: avgCheck || 0,
          revenue: safeRevenue,                   // Обязательное поле (Int)
          rent: safeRent,
          utilities: safeUtilities,
          payroll: safePayroll,
          managementCosts: safeManagement,
          costOfGoods: safeCOGS,
          otherExpenses: safeOther,
          foodCostPercent,
          payrollPercent,
          rentPercent,
          utilitiesPercent,
          managementPercent,
          otherPercent,
          profitPercent,
          healthIndex,
          profitAbsolute: operatingProfit,
          recommendations: {},                    // Обязательное поле (Json) — ВОТ ОН ВИНОВНИК 500-й ОШИБКИ
        },
      });

      return NextResponse.json({ success: true, data: audit }, { status: 201 });
    },
  });
}