'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createCategory, updateCategory } from '@/lib/actions/categories'
import { categorySchema } from '@/lib/validations/categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { z } from 'zod'

const COLORS = [
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500' },
  { name: 'Green', value: '#10b981', bg: 'bg-green-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
]

interface CategoryFormProps {
  category?: {
    id: string
    name: string
    description: string | null
    color: string
  }
  isEditing?: boolean
}

type CategoryFormData = z.infer<typeof categorySchema>

export function CategoryForm({ category, isEditing = false }: CategoryFormProps) {
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState(category?.color || COLORS[0].value)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || COLORS[0].value,
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const formData = { ...data, color: selectedColor }

      if (isEditing && category) {
        const result = await updateCategory(category.id, formData)
        if (result.success) {
          toast.success('Category updated successfully')
          router.push(`/categories/${category.id}`)
        } else {
          toast.error(result.error || 'Failed to update category')
        }
      } else {
        const result = await createCategory(formData)
        if (result.success) {
          toast.success('Category created successfully')
          router.push('/categories')
        } else {
          toast.error(result.error || 'Failed to create category')
        }
      }
    } catch (error) {
      console.error('[v0] Error submitting form:', error)
      toast.error('Error submitting form')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 gap-2 cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft size={18} />
          Back
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Category' : 'Create New Category'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Update the category details' : 'Fill in the details to create a new category'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Category Name *</label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Utilities, Healthcare, Housing"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Description</label>
                <Textarea
                  {...register('description')}
                  placeholder="e.g., Monthly utilities like electricity, water, and internet"
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Color Picker */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Color *</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${color.bg} ${
                        selectedColor === color.value
                          ? 'border-foreground ring-2 ring-primary'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className='cursor-pointer'
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {isEditing ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
