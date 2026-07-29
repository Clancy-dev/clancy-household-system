'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/image-upload'
import { expenseSchema, type ExpenseFormData } from '@/lib/validations/expenses'
import { createExpense, updateExpense } from '@/lib/actions/expenses'
import { getCategories } from '@/lib/actions/categories'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  expense?: any
  isEditing?: boolean
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  expense,
  isEditing = false,
}: ExpenseModalProps) {
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
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: expense?.name || '',
      description: expense?.description || '',
      image: expense?.image || '',
      categoryId: expense?.categoryId || '',
      amount: expense?.amount?.toString() || '',
      duration: expense?.duration || '',
      paidOn: expense?.paidOn || '',
      instructions: expense?.instructions || '',
      accountNumber: expense?.accountNumber || '',
      calculations: expense?.calculations || '',
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const result = await getCategories()
        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('[ExpenseModal] Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true)
    try {
      let result
      if (isEditing && expense?.id) {
        result = await updateExpense(expense.id, data)
      } else {
        result = await createExpense(data)
      }

      if (result.success) {
        toast.success(isEditing ? 'Expense updated successfully!' : 'Expense created successfully!')
        reset()
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('[ExpenseModal] Error:', error)
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
            {isEditing ? 'Edit Expense' : 'Create Expense'}
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
                label="Expense Image"
                disabled={loading}
              />
            )}
          />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Expense Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Electricity Bill"
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

          {/* Category and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category *
              </label>
              <select
                {...register('categoryId')}
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
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Amount (UGX) *
              </label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                {...register('amount')}
                disabled={loading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              {errors.amount && (
                <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Duration and Paid On */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g., Whole month, Weekly"
                {...register('duration')}
                disabled={loading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Payment Schedule
              </label>
              <input
                type="text"
                placeholder="e.g., Every 1st of the month"
                {...register('paidOn')}
                disabled={loading}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* Instructions and Account Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Payment Instructions
              </label>
              <textarea
                placeholder="e.g., Dial *165# -> Others"
                {...register('instructions')}
                disabled={loading}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Account Number
              </label>
              <textarea
                placeholder="Account details"
                {...register('accountNumber')}
                disabled={loading}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* Calculations */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Calculations / Notes
            </label>
            <textarea
              placeholder="Notes on how this amount was calculated"
              {...register('calculations')}
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
