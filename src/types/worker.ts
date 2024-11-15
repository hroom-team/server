export interface Worker {
  id: string;
  name: string;
  description: string;
  code: string;
  status: 'running' | 'stopped';
  template?: string;
  interval: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}