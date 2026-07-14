// lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import logger from './logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------- Детекторы ----------
const SUSPICIOUS_AGENTS = ['sqlmap', 'nikto', 'nmap', 'masscan', 'burp suite', 'nessus', 'metasploit'];

function detectSuspiciousUserAgent(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent')?.toLowerCase() || '';
  return SUSPICIOUS_AGENTS.some(agent => ua.includes(agent.toLowerCase()));
}

function detectSqlInjection(input: string): boolean {
  if (!input) return false;
  const patterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b\s+\bINTO\b)/i,
    /(\bDROP\b\s+\bTABLE\b)/i,
    /(\bALTER\b\s+\bTABLE\b)/i,
    /(')\s*OR\s*('1'='1')/i,
    /(\bOR\b\s+('1'='1))/i,
    /(\bSLEEP\b\s*\(\s*\d+\s*\))/i,
    /(\bBENCHMARK\b\s*\(.*\))/i,
  ];
  return patterns.some(p => p.test(input));
}

async function recordAttack(request: NextRequest, reason: string) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const systemSessionId = '00000000-0000-0000-0000-000000000000';

    await prisma.analyticsSession.upsert({
      where: { id: systemSessionId },
      create: { id: systemSessionId, ip: 'system' },
      update: {},
    });

    await prisma.analyticsEvent.create({
      data: {
        sessionId: systemSessionId,
        type: 'attack',
        page: request.url,
        data: {
          ip,
          reason,
          userAgent: request.headers.get('user-agent') || '',
          timestamp: new Date().toISOString(),
        },
      },
    });
    console.log(`✅ Записана атака: ${reason} от ${ip}`);
  } catch (error) {
    console.error('❌ Ошибка записи атаки:', error);
  }
}
// --------------------------------

export async function apiHandler<T>({
  request,
  schema,
  handler,
}: {
  request: NextRequest;
  schema?: ZodSchema<T>;
  handler: (data: T, request: NextRequest) => Promise<NextResponse>;
}) {
  // 0. Проверка на подозрительный User-Agent и SQL-инъекции
  if (detectSuspiciousUserAgent(request)) {
    await recordAttack(request, 'Suspicious User-Agent');
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  const url = request.url || '';
  const query = url.split('?')[1] || '';
  if (detectSqlInjection(query)) {
    await recordAttack(request, 'SQL Injection pattern in URL');
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }

  // 1. Проверка Content-Type и размера
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      await recordAttack(request, 'Invalid Content-Type');
      return NextResponse.json(
        { error: 'Требуется application/json' },
        { status: 415 }
      );
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2 * 1024 * 1024) {
      await recordAttack(request, 'Payload too large');
      return NextResponse.json(
        { error: 'Тело запроса слишком большое' },
        { status: 413 }
      );
    }
  }

  // 2. Безопасный парсинг JSON + проверка SQL-инъекций в теле
  let body: any = {};
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
      // После парсинга проверяем строковые поля тела
      const bodyStr = JSON.stringify(body);
      if (detectSqlInjection(bodyStr)) {
        await recordAttack(request, 'SQL Injection pattern in body');
        return NextResponse.json(
          { error: 'Bad Request' },
          { status: 400 }
        );
      }
    } catch {
      await recordAttack(request, 'Invalid JSON');
      return NextResponse.json(
        { error: 'Некорректный JSON' },
        { status: 400 }
      );
    }
  }

  // 3. Валидация данных
  let validatedData: T;
  try {
    validatedData = schema ? schema.parse(body) : (body as T);
  } catch (error) {
    if (error instanceof ZodError) {
      await recordAttack(request, 'Validation failed');
      return NextResponse.json(
        {
          error: 'Ошибка валидации',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    throw error;
  }

  // 4. Выполнение основного обработчика
  try {
    return await handler(validatedData, request);
  } catch (error) {
    logger.error(`[API ${request.method}] ${request.url}`, {
      error,
      body: schema ? validatedData : undefined,
    });

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}