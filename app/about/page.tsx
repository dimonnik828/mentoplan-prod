import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Code2, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'О проекте | MOMENTO',
  description: 'Узнайте больше о MOMENTO — интеллектуальном помощнике для рестораторов. Возможности, технологии, контакты.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">О проекте</h1>

      <div className="space-y-8">
        {/* Что такое MOMENTO */}
        <Card>
          <CardHeader>
            <CardTitle>Что такое MOMENTO?</CardTitle>
            <CardDescription>
              MOMENTO — это интеллектуальный помощник для владельцев и управляющих заведениями
              общественного питания. Проект помогает быстро оценить финансовое здоровье бизнеса,
              найти точки роста и получить конкретные рекомендации по улучшению ключевых показателей.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Возможности */}
        <Card>
          <CardHeader>
            <CardTitle>Возможности</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Экспресс-аудит</p>
                <p className="text-xs text-muted-foreground">
                  Быстрая оценка бизнеса по 4 ключевым метрикам: выручка, прибыль, foodcost, ФОТ.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Расширенный аудит</p>
                <p className="text-xs text-muted-foreground">
                  Детальное моделирование с настройкой зала, кухни, бара, аренды и локации.
                  Оценка аудитории и конкурентной среды.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Скоро</Badge>
              <div>
                <p className="font-medium text-sm">Технологические карты / Foodcost</p>
                <p className="text-xs text-muted-foreground">
                  Расчёт себестоимости блюд, управление рецептурами и технологиями приготовления.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Скоро</Badge>
              <div>
                <p className="font-medium text-sm">История аудитов</p>
                <p className="text-xs text-muted-foreground">
                  Сохранение и сравнение результатов проверок. Все данные хранятся на вашем устройстве.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Скоро</Badge>
              <div>
                <p className="font-medium text-sm">Диагностика</p>
                <p className="text-xs text-muted-foreground">
                  Автоматическая проверка расчётов и целостности данных.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Скоро</Badge>
              <div>
                <p className="font-medium text-sm">Маркетинг</p>
                <p className="text-xs text-muted-foreground">
                  Инструменты для привлечения гостей и анализа рекламных кампаний.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Для кого */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Для кого этот проект?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Для рестораторов, управляющих кафе, кофеен, столовых и dark kitchen, которые хотят:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Понимать, куда уходит выручка</li>
              <li>Контролировать foodcost и ФОТ</li>
              <li>Оценивать эффективность локации</li>
              <li>Планировать развитие на основе данных, а не интуиции</li>
            </ul>
          </CardContent>
        </Card>

        {/* Технологии */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Технологии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Проект построен на Next.js 16, TypeScript, Tailwind CSS и shadcn/ui.
              Данные аудитов хранятся локально в браузере и синхронизируются с сервером через защищённое API.
              Аналитика собирается в реальном времени для повышения качества сервиса.
            </p>
          </CardContent>
        </Card>

        {/* Контакты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Контакты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              По всем вопросам и предложениям:{' '}
              <a href="mailto:hello@mentoplan.ru" className="text-primary hover:underline">
                hello@mentoplan.ru
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}