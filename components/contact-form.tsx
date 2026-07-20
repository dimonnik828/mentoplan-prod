'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, MessageSquare, Loader2, Send } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: '', message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      setStatus('success');
      setName('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Что-то пошло не так');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Написать нам
        </CardTitle>
        <CardDescription>
          Ваше сообщение сразу придёт нам в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm">
            ✅ Спасибо! Сообщение отправлено. Мы скоро ответим.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ваше имя (необязательно)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <textarea
                placeholder="Ваше сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="pl-9 min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {status === 'error' && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <Button type="submit" disabled={status === 'loading'} className="w-full">
              {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Отправить
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}