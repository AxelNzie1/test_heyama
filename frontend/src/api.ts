import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export interface ObjectEntity {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export const getObjects = () => api.get<ObjectEntity[]>('/objects');
export const getObject = (id: string) => api.get<ObjectEntity>(`/objects/${id}`);
export const createObject = (data: FormData) => api.post<ObjectEntity>('/objects', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateObject = (id: string, data: FormData) => api.put<ObjectEntity>(`/objects/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteObject = (id: string) => api.delete(`/objects/${id}`);
