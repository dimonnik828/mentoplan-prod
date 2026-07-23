import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Code2, Mail, TrendingUp, PieChart, ChefHat, Wrench, Megaphone, Clock, ShieldAlert } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'О проекте | MOMENTO',
  description: 'MOMENTO — интеллектуальный помощник для рестораторов, который помогает быстро оценить финансовое здоровье бизнеса, найти точки роста и получить конкретные рекомендации.',
};

const features = [
  {
    icon: Clock,
    title: 'Экспресс-аудит',
    status: 'available' as const,
    benefit: 'Моментальная диагностика',
    description: 'За 3 минуты вы получаете ключевые метрики: рентабельность, долю foodcost и ФОТ. Система сразу подсветит критические зоны и даст первые рекомендации, не требуя долгой настройки. Идеально для быстрой проверки перед оперативными решениями.',
  },
  {
    icon: TrendingUp,
    title: 'Расширенный аудит',
    status: 'available' as const,
    benefit: 'Глубокий анализ с прогнозом',
    description:
    'Моделируйте зал, кухню, бар, локацию и аренду. Оценивайте реальную ёмкость рынка, влияние конкурентов и потенциальную прибыль. Вы сможете рассчитать, как изменения штата, меню или цен повлияют на выручку и прибыль, и увидеть потенциал роста до принятия решений.',
  },
  {
    icon: ChefHat,
    title: 'Технологические карты / Foodcost',
    status: 'soon' as const,
    benefit: 'Учёт каждой тарелки',
    description: 'Автоматизируйте расчёт себестоимости каждого блюда. Управляйте рецептурами и технологией приготовления. Знайте реальную маржинальность меню ещё до того, как блюдо попадёт к гостю.',
  },
  {
    icon: PieChart,
    title: 'История аудитов',
    status: 'soon' as const,
    benefit: 'Следите за динамикой бизнеса',
    description: 'Сохраняйте результаты всех проверок. Сравнивайте показатели по месяцам, отслеживайте тренды. Вы будете видеть, как ваши решения влияют на прибыль, и доказывать эффективность партнёрам или инвесторам.',
  },
  {
    icon: Wrench,
    title: 'Диагностика',
    status: 'soon' as const,
    benefit: 'Автоматический поиск узких мест',
    description: 'Система сама проверяет целостность ваших данных и логику расчётов. Вы получите список подозрительных показателей с пояснениями — без привлечения бухгалтера или консультанта.',
  },
  {
    icon: Megaphone,
    title: 'Маркетинг',
    status: 'soon' as const,
    benefit: 'Привлекайте больше гостей',
    description: 'Инструменты для анализа рекламных каналов, планирования акций и оценки окупаемости маркетинга. Вы сможете чётко видеть, откуда приходят посетители и сколько это стоит.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">MOMENTO — ваш партнёр в ресторанном бизнесе</h1>
      <p className="text-muted-foreground text-lg mb-10">
        Интеллектуальный помощник, который превращает данные в прибыль
      </p>

      <div className="space-y-12">
        {/* Возможности */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Что MOMENTO умеет уже сейчас</h2>
          <div className="space-y-6">
            {features.map(({ icon: Icon, title, status, benefit, description }) => (
              <div key={title} className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    {status === 'available' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">Доступно</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                        Скоро
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{benefit}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              MOMENTO создан для владельцев и управляющих заведений общепита — от небольших кофеен до крупных ресторанных сетей. Если вы хотите:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>понимать, куда уходит выручка, без помощи финансиста,</li>
              <li>контролировать foodcost и ФОТ, чтобы увеличить маржу,</li>
              <li>оценивать локацию перед открытием или переездом,</li>
              <li>принимать решения на основе данных, а не интуиции, —</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              вы по адресу. Мы не даём абстрактных советов. Мы даём цифры и конкретные шаги.
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
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}