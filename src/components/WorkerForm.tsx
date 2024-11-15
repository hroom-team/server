import React, { useState, lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import type { Worker } from '../types/worker';
import { workerTemplates } from '../templates/workerTemplates';

// Lazy load Monaco Editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface WorkerFormProps {
  worker?: Worker;
  onSubmit: (worker: Partial<Worker>) => void;
  onClose: () => void;
}

export function WorkerForm({ worker, onSubmit, onClose }: WorkerFormProps) {
  const [formData, setFormData] = useState<Partial<Worker>>({
    name: '',
    description: '',
    code: '',
    interval: 60000,
    template: '',
    ...worker
  });

  const handleTemplateChange = (templateId: string) => {
    if (templateId && workerTemplates[templateId as keyof typeof workerTemplates]) {
      const template = workerTemplates[templateId as keyof typeof workerTemplates];
      setFormData(prev => ({
        ...prev,
        template: templateId,
        code: template.code,
        name: template.name,
        description: template.description
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {worker ? 'Редактировать воркер' : 'Создать воркер'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Шаблон
              </label>
              <select
                value={formData.template || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите шаблон</option>
                {Object.entries(workerTemplates).map(([id, template]) => (
                  <option key={id} value={id}>{template.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Интервал (мс)
              </label>
              <input
                type="number"
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1000"
                step="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Код воркера
              </label>
              <div className="h-[400px] border rounded-md overflow-hidden">
                <Suspense fallback={<div className="h-full flex items-center justify-center">Loading editor...</div>}>
                  <MonacoEditor
                    defaultLanguage="javascript"
                    value={formData.code}
                    onChange={(value) => setFormData({ ...formData, code: value || '' })}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </Suspense>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {worker ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}