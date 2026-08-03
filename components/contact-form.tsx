'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ContactForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Аноним', message: message.trim() }),
      });

      if (res.ok) {
        toast.success('Сообщение отправлено! Мы ответим вам в ближайшее время.');
        setName('');
        setMessage('');
      } else {
        toast.error('Ошибка отправки. Попробуйте позже.');
      }
    } catch {
      toast.error('Ошибка сети. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Ваше имя (необязательно)</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Петров"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Сообщение</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишите ваш вопрос или предложение..."
          rows={4}
          required
        />
      </div>
      <Button type="submit" disabled={loading || !message.trim()}>
        {loading ? 'Отправка...' : 'Отправить сообщение'}
      </Button>
    </form>
  );
}