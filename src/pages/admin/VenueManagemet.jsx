import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { LucidePlus, LucideEdit, LucideTrash } from 'lucide-react';
import {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../services/admin.service';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Card } from '../components/ui/card';

const venueSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  description: z.string().optional(),
  open_time: z.string(),
  close_time: z.string(),
});

export default function AdminVenuePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);

  const { data: venues, isLoading } = useQuery(['venues'], getVenues);

  const createMutation = useMutation(createVenue, {
    onSuccess: () => {
      queryClient.invalidateQueries(['venues']);
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation(({ id, data }) => updateVenue(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['venues']);
      setModalOpen(false);
      setEditingVenue(null);
    },
  });

  const deleteMutation = useMutation(deleteVenue, {
    onSuccess: () => queryClient.invalidateQueries(['venues']),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(venueSchema),
  });

  const openCreateModal = () => {
    setEditingVenue(null);
    reset();
    setModalOpen(true);
  };

  const openEditModal = (venue) => {
    setEditingVenue(venue);
    reset({
      name: venue.name,
      address: venue.address,
      description: venue.description,
      open_time: venue.open_time,
      close_time: venue.close_time,
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingVenue) {
      updateMutation.mutate({ id: editingVenue.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Venues</h2>
        <Button onClick={openCreateModal} icon={<LucidePlus size={16} />}>
          Add Venue
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <p>Loading venues...</p>
        ) : (
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Address</th>
                <th className="p-2 border">Open</th>
                <th className="p-2 border">Close</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues?.data?.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{v.name}</td>
                  <td className="p-2 border">{v.address}</td>
                  <td className="p-2 border">{v.open_time}</td>
                  <td className="p-2 border">{v.close_time}</td>
                  <td className="p-2 border space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(v)} icon={<LucideEdit size={14} />}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(v.id)}
                      icon={<LucideTrash size={14} />}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded shadow-md w-96"
        >
          <h3 className="text-lg font-semibold mb-4">{editingVenue ? 'Edit Venue' : 'Add Venue'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm">Name</label>
              <input
                {...register('name')}
                className={clsx('w-full border p-2 rounded', errors.name && 'border-red-500')}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm">Address</label>
              <input
                {...register('address')}
                className={clsx('w-full border p-2 rounded', errors.address && 'border-red-500')}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm">Description</label>
              <input
                {...register('description')}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm">Open Time</label>
                <input
                  type="time"
                  {...register('open_time')}
                  className={clsx('w-full border p-2 rounded', errors.open_time && 'border-red-500')}
                />
                {errors.open_time && <p className="text-red-500 text-sm">{errors.open_time.message}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm">Close Time</label>
                <input
                  type="time"
                  {...register('close_time')}
                  className={clsx('w-full border p-2 rounded', errors.close_time && 'border-red-500')}
                />
                {errors.close_time && <p className="text-red-500 text-sm">{errors.close_time.message}</p>}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingVenue ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </motion.div>
      </Dialog>
    </div>
  );
}
