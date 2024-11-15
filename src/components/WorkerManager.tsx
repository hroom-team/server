import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { WorkerList } from './WorkerList';
import { WorkerForm } from './WorkerForm';
import type { Worker } from '../types/worker';

function WorkerManager() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | undefined>();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'workers'), (snapshot) => {
      const workersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Worker[];
      setWorkers(workersData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (workerData: Partial<Worker>) => {
    try {
      if (editingWorker) {
        await updateDoc(doc(db, 'workers', editingWorker.id), {
          ...workerData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'workers'), {
          ...workerData,
          status: 'stopped',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      setIsFormOpen(false);
      setEditingWorker(undefined);
    } catch (error) {
      console.error('Error saving worker:', error);
    }
  };

  const handleDelete = async (workerId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот воркер?')) {
      try {
        await deleteDoc(doc(db, 'workers', workerId));
      } catch (error) {
        console.error('Error deleting worker:', error);
      }
    }
  };

  const handleToggleStatus = async (worker: Worker) => {
    try {
      await updateDoc(doc(db, 'workers', worker.id), {
        status: worker.status === 'running' ? 'stopped' : 'running',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling worker status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление воркерами</h1>
          <button
            onClick={() => {
              setEditingWorker(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Создать воркер
          </button>
        </div>

        <WorkerList
          workers={workers}
          onEdit={(worker) => {
            setEditingWorker(worker);
            setIsFormOpen(true);
          }}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {isFormOpen && (
          <WorkerForm
            worker={editingWorker}
            onSubmit={handleSubmit}
            onClose={() => {
              setIsFormOpen(false);
              setEditingWorker(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default WorkerManager;