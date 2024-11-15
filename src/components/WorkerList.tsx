import React from 'react';
import { Play, Pause, Edit, Trash2 } from 'lucide-react';
import type { Worker } from '../types/worker';

interface WorkerListProps {
  workers: Worker[];
  onEdit: (worker: Worker) => void;
  onDelete: (workerId: string) => void;
  onToggleStatus: (worker: Worker) => void;
}

export function WorkerList({ workers, onEdit, onDelete, onToggleStatus }: WorkerListProps) {
  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <div key={worker.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{worker.name}</h3>
              <p className="text-gray-600 text-sm">{worker.description}</p>
              <div className="flex items-center mt-2 space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  worker.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {worker.status === 'running' ? 'Запущен' : 'Остановлен'}
                </span>
                <span className="text-gray-500 text-xs">
                  Интервал: {worker.interval / 1000}с
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleStatus(worker)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {worker.status === 'running' ? (
                  <Pause className="w-5 h-5 text-gray-600" />
                ) : (
                  <Play className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => onEdit(worker)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(worker.id)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}