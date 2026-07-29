'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { categorySchema, type CategoryFormData } from '@/lib/validations/categories'
import { createCategory, updateCategory } from '@/lib/actions/categories'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  category?: any
  isEditing?: boolean
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
  isEditing = false,
}: CategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(category?.color || '#3b82f6')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || '#3b82f6',
      icon: category?.icon || '',
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      data.color = selectedColor

      let result
      if (isEditing && category?.id) {
        result = await updateCategory(category.id, data)
      } else {
        result = await createCategory(data)
      }

      if (result.success) {
        toast.success(isEditing ? 'Category updated successfully!' : 'Category created successfully!')
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('[CategoryModal] Error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? 'Edit Category' : 'Create Category'}
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Utilities, Healthcare"
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
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-full h-10 rounded-lg border-2 transition ${
                    selectedColor === color
                      ? 'border-foreground'
                      : 'border-border hover:border-foreground/50'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Icon (optional)
            </label>
            <input
              type="text"
              placeholder="e.g., emoji or icon name"
              {...register('icon')}
              disabled={loading}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
