'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/image-upload'
import { maintenanceItemSchema, type MaintenanceItemFormData } from '@/lib/validations/maintenance'
import { createMaintenanceItem, updateMaintenanceItem } from '@/lib/actions/maintenance'

interface MaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  item?: any
  isEditing?: boolean
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export function MaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  isEditing = false,
}: MaintenanceModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<MaintenanceItemFormData>({
    resolver: zodResolver(maintenanceItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      image: item?.image || '',
      category: item?.category || '',
      cost: item?.cost?.toString() || '',
      expectedDate: item?.expectedDate ? new Date(item.expectedDate).toISOString().split('T')[0] : '',
      completedDate: item?.completedDate ? new Date(item.completedDate).toISOString().split('T')[0] : '',
      status: item?.status || 'pending',
      notes: item?.notes || '',
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        
      } catch (error) {
        console.error('[MaintenanceModal] Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const onSubmit = async (data: MaintenanceItemFormData) => {
    setLoading(true)
    try {
      let result
      if (isEditing && item?.id) {
        result = await updateMaintenanceItem(item.id, data)
      } else {
        result = await createMaintenanceItem(data)
      }

      if (result.success) {
        toast.success(isEditing ? 'Maintenance item updated successfully!' : 'Maintenance item created successfully!')
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('[MaintenanceModal] Error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? 'Edit Maintenance Item' : 'Create Maintenance Item'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-muted rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Image Upload */}
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                label="Item Image"
                disabled={loading}
              />
            )}
          />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Painting the house"
              {...register('name')}
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              placeholder="Optional description"
              {...register('description')}
              disabled={loading}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
            />
          </div>

          {/* Category and Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <select
                {...register('category')}
                disabled={loading || loadingCategories}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Cost (UGX) *
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                {...register('cost')}
                disabled={loading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              {errors.cost && (
                <p className="text-sm text-destructive mt-1">{errors.cost.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              {...register('status')}
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expected and Completed Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Expected Date
              </label>
              <input
                type="date"
                {...register('expectedDate')}
                disabled={loading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Completed Date
              </label>
              <input
                type="date"
                {...register('completedDate')}
                disabled={loading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Notes
            </label>
            <textarea
              placeholder="Additional notes about this maintenance item"
              {...register('notes')}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
