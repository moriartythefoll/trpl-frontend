import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { LucidePlus, LucideEdit, LucideTrash } from 'lucide-react';
import { getFields, createField, updateField, deleteField } from '../services/admin.service';
import { getVenues } from '../services/admin.service';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Card } from '../components/ui/card';

const fieldSchema = z.object({
  venue_id: z.number(),
  name: z.string().min(2),
  type: z.enum(['futsal','basket','badminton']), // sesuai Field::TYPES
  price_per_hour: z.number().min(0),
  is_active: z.boolean().optional(),
});

export default function AdminFieldPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const { data: fields, isLoading } = useQuery(['fields'], getFields);
  const { data: venues } = useQuery(['venues'], getVenues);

  const createMutation = useMutation(createField, {
    onSuccess: () => {
      queryClient.invalidateQueries(['fields']);
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation(({ id, data }) => updateField(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['fields']);
      setModalOpen(false);
      setEditingField(null);
    },
  });

  const deleteMutation = useMutation(deleteField, {
    onSuccess: () => queryClient.invalidateQueries(['fields']),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(fieldSchema),
  });

  const openCreateModal = () => {
    setEditingField(null);
    reset({ is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (field) => {
    setEditingField(field);
    reset({
      venue_id: field.venue_id,
      name: field.name,
      type: field.type,
      price_per_hour: field.price_per_hour,
      is_active: field.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingField) {
      updateMutation.mutate({ id: editingField.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Fields</h2>
        <Button onClick={openCreateModal} icon={<LucidePlus size={16} />}>
          Add Field
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <p>Loading fields...</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Venue</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Price/Hour</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields?.data?.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{f.name}</td>
                  <td className="p-2 border">{f.venue?.name || '-'}</td>
                  <td className="p-2 border">{f.type}</td>
                  <td className="p-2 border">{f.price_per_hour}</td>
                  <td className="p-2 border">{f.is_active ? 'Yes' : 'No'}</td>
                  <td className="p-2 border space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(f)} icon={<LucideEdit size={14} />}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(f.id)} icon={<LucideTrash size={14} />}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded shadow-md w-96">
          <h3 className="text-lg font-semibold mb-4">{editingField ? 'Edit Field' : 'Add Field'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm">Venue</label>
              <select {...register('venue_id')} className={clsx('w-full border p-2 rounded', errors.venue_id && 'border-red-500')}>
                <option value="">Select venue</option>
                {venues?.data?.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              {errors.venue_id && <p className="text-red-500 text-sm">{errors.venue_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm">Name</label>
              <input {...register('name')} className={clsx('w-full border p-2 rounded', errors.name && 'border-red-500')} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm">Type</label>
              <select {...register('type')} className={clsx('w-full border p-2 rounded', errors.type && 'border-red-500')}>
                <option value="futsal">Futsal</option>
                <option value="basket">Basket</option>
                <option value="badminton">Badminton</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm">Price per Hour</label>
              <input type="number" {...register('price_per_hour', { valueAsNumber: true })} className={clsx('w-full border p-2 rounded', errors.price_per_hour && 'border-red-500')} />
              {errors.price_per_hour && <p className="text-red-500 text-sm">{errors.price_per_hour.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" {...register('is_active')} />
              <label>Active</label>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingField ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </motion.div>
      </Dialog>
    </div>
  );
}
