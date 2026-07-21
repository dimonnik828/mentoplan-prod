// app/privacy/page.tsx
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Database, Cookie, Gauge, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | MOMENTO',
  description: 'Политика конфиденциальности сервиса MOMENTO — какие данные мы собираем и как их используем.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Общие положения */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Общие положения</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Настоящая Политика конфиденциальности описывает, какие данные собирает сервис
            MOMENTO (mentoplan.ru), как они используются и защищаются. Используя наш сервис, вы
            соглашаетесь с условиями данной Политики. Если вы не согласны, пожалуйста, прекратите
            использование сервиса.
          </CardContent>
        </Card>

        {/* Какие данные собираем */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-4 w-4 text-primary" />
              2. Какие данные мы собираем
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-medium text-foreground mb-1">Технические данные (автоматически)</h4>
              <p>
                Когда вы пользуетесь сайтом, мы автоматически собираем обезличенную техническую
                информацию: тип события (просмотр страницы, клик, скролл, ошибка), путь страницы,
                время события, а также некоторые технические параметры (тег и класс элемента при клике,
                глубина скролла, сообщение и номер строки при ошибке, длительность API-запросов).
                Эти данные не содержат ваших личных идентификаторов (имени, email, IP-адреса) и
                используются исключительно для улучшения работы сервиса.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Данные аудитов (с вашего согласия)</h4>
              <p>
                При заполнении формы аудита вы указываете коммерческие показатели: название заведения,
                адрес, выручку, зарплаты, аренду и другие финансовые параметры. Эти данные хранятся в
                защищённой базе данных и доступны только вам. Мы не передаём их третьим лицам и не
                используем для рекламы.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Данные форм обратной связи</h4>
              <p>
                Если вы отправляете сообщение через форму «Написать нам», мы получаем текст сообщения
                и, опционально, ваше имя. Email не запрашивается. Эти данные используются только для
                ответа на ваш вопрос и не сохраняются в базе данных дольше, чем это необходимо.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Как используем */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-4 w-4 text-primary" />
              3. Как мы используем данные
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-1">
              <li>Улучшение интерфейса и производительности сервиса</li>
              <li>Расчёт показателей аудита и формирование рекомендаций</li>
              <li>Выявление и исправление технических ошибок</li>
              <li>Защита от атак и несанкционированного доступа</li>
              <li>Анализ посещаемости через агрегированную статистику</li>
            </ul>
          </CardContent>
        </Card>

        {/* Передача третьим лицам */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4. Передача третьим лицам</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Мы используем Яндекс.Метрику для получения обезличенной статистики посещаемости. Данные,
            собираемые Яндекс.Метрикой, обрабатываются в соответствии с их собственной Политикой
            конфиденциальности (yandex.ru/legal/confidential). Коммерческие данные аудитов не
            передаются третьим лицам ни при каких обстоятельствах, за исключением случаев,
            предусмотренных законодательством РФ.
          </CardContent>
        </Card>

        {/* Хранение данных */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">5. Хранение данных</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Данные аудитов хранятся в защищённой базе данных на территории Российской Федерации. Срок
            хранения — пока вы активно пользуетесь сервисом. Вы можете запросить удаление своих данных
            в любое время через форму обратной связи. После удаления данные не подлежат восстановлению.
          </CardContent>
        </Card>

        {/* Cookie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cookie className="h-4 w-4 text-primary" />
              6. Файлы Cookie
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p className="mb-2">
              Мы используем следующие файлы cookie:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>mentoplan_cookie_consent</strong> — хранит информацию о вашем согласии на
                использование cookie (срок действия — 1 год)
              </li>
              <li>
                <strong>_ym_uid, _ym_d, _ym_isad и другие</strong> — технические cookie Яндекс.Метрики
                для анализа посещаемости
              </li>
            </ul>
            <p className="mt-2">
              Вы можете отключить cookie в настройках браузера, однако это может повлиять на
              корректность работы сервиса.
            </p>
          </CardContent>
        </Card>

        {/* Права пользователя */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">7. Ваши права</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-1">
              <li>Отказаться от использования cookie в настройках браузера</li>
              <li>Запросить экспорт ваших данных аудитов</li>
              <li>Потребовать полного удаления ваших данных</li>
              <li>Отозвать согласие на обработку данных</li>
            </ul>
            <p className="mt-2">
              Для реализации любого из этих прав свяжитесь с нами через форму обратной связи на
              странице «О проекте».
            </p>
          </CardContent>
        </Card>

        {/* Контакты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4 text-primary" />
              8. Контакты
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            <p>
              По всем вопросам, связанным с обработкой данных, вы можете обратиться к нам:
            </p>
            <p className="mt-1">
              📧 <a href="mailto:hello@mentoplan.ru" className="text-primary hover:underline">hello@mentoplan.ru</a>
            </p>
            <p className="mt-1">
              🌐 Форма обратной связи на странице <a href="/about" className="text-primary hover:underline">«О проекте»</a>
            </p>
          </CardContent>
        </Card>

        <Separator />

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} MOMENTO. Все права защищены.
        </p>
      </div>
    </div>
  );
}