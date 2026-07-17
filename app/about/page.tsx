// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">О проекте</h1>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Что такое MOMENTO?</h2>
          <p>
            MOMENTO — это интеллектуальный помощник для владельцев и управляющих заведениями общественного питания.
            Проект помогает быстро оценить финансовое здоровье бизнеса, найти точки роста и получить конкретные рекомендации
            по улучшению ключевых показателей.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Возможности</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Экспресс-аудит</strong> — быстрая оценка бизнеса по 4 ключевым метрикам: выручка, прибыль, foodcost, ФОТ.</li>
            <li><strong>Расширенный аудит</strong> — детальное моделирование с настройкой зала, кухни, бара, аренды и локации.</li>
            <li><strong>Технологические карты / Foodcost</strong> — расчёт себестоимости блюд (в разработке).</li>
            <li><strong>История аудитов</strong> — сохранение и сравнение результатов проверок.</li>
            <li><strong>Диагностика</strong> — автоматическая проверка расчётов и целостности данных.</li>
            <li><strong>Маркетинг</strong> — инструменты для привлечения гостей (в разработке).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Для кого этот проект?</h2>
          <p>
            Для рестораторов, управляющих кафе, кофеен, столовых и dark kitchen, которые хотят:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Понимать, куда уходит выручка</li>
            <li>Контролировать foodcost и ФОТ</li>
            <li>Оценивать эффективность локации</li>
            <li>Планировать развитие на основе данных, а не интуиции</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Технологии</h2>
          <p>
            Проект построен на Next.js 16, TypeScript, Tailwind CSS и shadcn/ui.
            Данные хранятся локально в браузере и синхронизируются с сервером через API.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Контакты</h2>
          <p>
            По всем вопросам и предложениям пишите на{' '}
            <a href="mailto:hello@momento.ru" className="text-primary hover:underline">
              hello@momento.ru
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}