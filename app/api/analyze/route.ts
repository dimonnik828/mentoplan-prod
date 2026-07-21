import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name, address, totalArea, hallArea, seats, staffCount,
      avgCheck, revenue, rent, utilities, payroll,
      managementCosts, costOfGoods, otherExpenses,
    } = body;

    const safeRevenue = Number(revenue) || 0;
    const safeRent = Number(rent) || 0;
    const safeUtilities = Number(utilities) || 0;
    const safePayroll = Number(payroll) || 0;
    const safeManagement = Number(managementCosts) || 0;
    const safeCOGS = Number(costOfGoods) || 0;
    const safeOther = Number(otherExpenses) || 0;

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

    const audit = await prisma.audit.create({
      data: {
        name: name || 'Без названия',
        address: address || 'Адрес не указан',
        totalArea: Number(totalArea) || 0,
        hallArea: Number(hallArea) || 0,
        seats: Number(seats) || 0,
        staffCount: Number(staffCount) || 0,
        avgCheck: Number(avgCheck) || 0,
        revenue: safeRevenue,
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
        recommendations: {
          development: ["Расширить меню", "Запустить доставку"],
          management: ["Оптимизировать смены", "Ввести KPI"],
          advertising: ["Таргетированная реклама", "SMM-продвижение"],
          finance: ["Снизить foodcost на 5%", "Пересмотреть арендную ставку"],
        },
        checklists: [
          {
            title: "Ежедневные проверки",
            items: ["Включить оборудование", "Проверить остатки продуктов", "Провести планёрку"],
          },
        ],
        adResources: [
          {
            name: "Яндекс.Директ",
            link: "https://direct.yandex.ru",
            description: "Контекстная реклама для привлечения гостей",
          },
        ],
      },
    });

    return NextResponse.json({ success: true, data: audit }, { status: 201 });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Ошибка анализа' }, { status: 500 });
  }
}