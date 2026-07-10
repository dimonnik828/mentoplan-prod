'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TTKFormProps {
  initialData?: any;
  isEdit?: boolean;
  id?: string;
}

export default function TTKForm({ initialData, isEdit = false, id }: TTKFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    ingredients: [],
    technology: '',
    presentation: '',
    storage: '',
    quality: '',
    type: 'блюдо',
    category: '',
    proteins: '',
    fats: '',
    carbs: '',
    calories: '',
    engineer: '',
    responsible: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        ingredients: initialData.ingredients || [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientsChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, ingredients: parsed }));
    } catch (e) {
      // невалидный JSON
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/admin/ttk/${id}` : '/api/admin/ttk';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'my-super-secret-key',
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      router.push('/admin/ttk');
    } else {
      alert('Ошибка сохранения');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="block font-medium">Название *</label>
        <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block font-medium">Номер</label>
        <input name="number" value={formData.number} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block font-medium">Ингредиенты (JSON) *</label>
        <textarea
          name="ingredients"
          value={JSON.stringify(formData.ingredients, null, 2)}
          onChange={(e) => handleIngredientsChange(e.target.value)}
          className="w-full p-2 border rounded font-mono text-sm"
          rows={8}
          required
        />
      </div>
      <div>
        <label className="block font-medium">Технология *</label>
        <textarea name="technology" value={formData.technology} onChange={handleChange} className="w-full p-2 border rounded" rows={4} required />
      </div>
      <div>
        <label className="block font-medium">Презентация</label>
        <textarea name="presentation" value={formData.presentation} onChange={handleChange} className="w-full p-2 border rounded" rows={2} />
      </div>
      <div>
        <label className="block font-medium">Хранение</label>
        <textarea name="storage" value={formData.storage} onChange={handleChange} className="w-full p-2 border rounded" rows={2} />
      </div>
      <div>
        <label className="block font-medium">Качество</label>
        <textarea name="quality" value={formData.quality} onChange={handleChange} className="w-full p-2 border rounded" rows={2} />
      </div>
      <div>
        <label className="block font-medium">Тип</label>
        <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="блюдо">Блюдо</option>
          <option value="заготовка">Заготовка</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Категория</label>
        <input name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>Белки</label><input name="proteins" value={formData.proteins} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div><label>Жиры</label><input name="fats" value={formData.fats} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div><label>Углеводы</label><input name="carbs" value={formData.carbs} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div><label>Калории</label><input name="calories" value={formData.calories} onChange={handleChange} className="w-full p-2 border rounded" /></div>
      </div>
      <div>
        <label>Инженер-технолог</label>
        <input name="engineer" value={formData.engineer} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div>
        <label>Ответственный</label>
        <input name="responsible" value={formData.responsible} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {isEdit ? 'Обновить' : 'Создать'}
      </button>
    </form>
  );
}