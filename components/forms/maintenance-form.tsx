'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createMaintenanceItem, updateMaintenanceItem } from '@/lib/actions/maintenance'
import { maintenanceItemSchema } from '@/lib/validations/maintenance'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import type { z } from 'zod'

interface MaintenanceFormProps {
  item?: {
    id: string
    name: string
    cost: number
    category: "House Maintenance" | "Household Maintenance" | "Personal Maintenance"
    image: string | null
    expectedDate: Date | null
    completedDate: Date | null
    status: 'pending' | 'in-progress' | 'completed'
    notes: string | null
  }
  isEditing?: boolean
}

type MaintenanceFormData = z.infer<typeof maintenanceItemSchema>

const MAINTENANCE_CATEGORIES = [
  "House Maintenance",
  "Household Maintenance",
  "Personal Maintenance",
]

const STATUSES = [
  {
    value: 'pending',
    label: 'Pending',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
]

export function MaintenanceForm({
  item,
  isEditing = false,
}: MaintenanceFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
    setValue,
    watch,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceItemSchema),
    defaultValues: {
      name: item?.name || '',
      cost: item?.cost.toString() || '',
      category: item?.category,
      image: item?.image || '',
      expectedDate: item?.expectedDate
        ? item.expectedDate.toISOString().split('T')[0]
        : '',
      completedDate: item?.completedDate
        ? item.completedDate.toISOString().split('T')[0]
        : '',
      status: item?.status || 'pending',
      notes: item?.notes || '',
    },
  })

  const imageValue = watch('image')
  const categoryValue = watch('category') ?? ''

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      setIsLoading(true)

      const formData = new FormData()

      formData.append('file', file)
      formData.append('upload_preset', 'practice')

      const response = await fetch(
        process.env.NEXT_PUBLIC_CLOUDINARY_URL!,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error(
          `Upload failed with status ${response.status}`
        )
      }

      const data = await response.json()

      if (!data.secure_url) {
        throw new Error(
          'No image URL returned from Cloudinary'
        )
      }

      setValue('image', data.secure_url, {
        shouldValidate: true,
      })

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error(
        '[Maintenance] Cloudinary upload failed:',
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload image'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = () => {
    setValue('image', '', {
      shouldValidate: true,
    })
  }

  const onSubmit = async (
    data: MaintenanceFormData
  ) => {
    try {
      if (isEditing && item) {
        const result =
          await updateMaintenanceItem(item.id, data)

        if (result.success) {
          toast.success(
            'Maintenance item updated successfully'
          )

          router.push(`/maintenance/${item.id}`)
        } else {
          toast.error(
            result.error ||
              'Failed to update maintenance item'
          )
        }
      } else {
        const result =
          await createMaintenanceItem(data)

        if (result.success) {
          toast.success(
            'Maintenance item created successfully'
          )

          router.push('/maintenance')
        } else {
          toast.error(
            result.error ||
              'Failed to create maintenance item'
          )
        }
      }
    } catch (error) {
      console.error(
        '[Maintenance] Error submitting form:',
        error
      )

      toast.error('Error submitting form')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <Button
          variant="ghost"
          className="mb-6 gap-2 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing
                ? 'Edit Maintenance Item'
                : 'Create New Maintenance Item'}
            </CardTitle>

            <CardDescription>
              {isEditing
                ? 'Update the maintenance item details'
                : 'Fill in the details to create a new maintenance item'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >

              {/* Item Name */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Item Name *
                </label>

                <Input
                  {...register('name')}
                  placeholder="e.g. Paint the house"
                  className={
                    errors.name
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Category *
                </label>

               <Select
  value={categoryValue}
  onValueChange={(value) =>
    setValue(
      'category',
      value as MaintenanceFormData['category'],
      {
        shouldValidate: true,
      }
    )
  }
>
  <SelectTrigger
    className={
      errors.category
        ? 'border-destructive'
        : ''
    }
  >
    <SelectValue placeholder="Select a category" />
  </SelectTrigger>

  <SelectContent>
    {MAINTENANCE_CATEGORIES.map((category) => (
      <SelectItem
        key={category}
        value={category}
      >
        {category}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

{errors.category && (
  <p className="text-sm text-destructive">
    {errors.category.message}
  </p>
)}

                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Cost */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Cost (UGX) *
                </label>

                <Input
                  {...register('cost')}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  className={
                    errors.cost
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.cost && (
                  <p className="text-sm text-destructive">
                    {errors.cost.message}
                  </p>
                )}
              </div>

              {/* Image Upload */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Item Image
                </label>

                {imageValue ? (
                  <div className="relative">
                    <img
                      src={imageValue}
                      alt="Maintenance"
                      className="h-48 w-full rounded-lg border object-contain"
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 cursor-pointer"
                      onClick={removeImage}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed">

                    {isLoading ? (
                      <Loader2
                        size={30}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload size={30} />
                    )}

                    <span className="mt-2 text-sm">
                      {isLoading
                        ? 'Uploading image...'
                        : 'Click to upload image'}
                    </span>

                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isLoading}
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
                            {/* Expected Date */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  When Will It Be Done?
                </label>

                <Input
                  {...register('expectedDate')}
                  type="date"
                  className={
                    errors.expectedDate
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.expectedDate && (
                  <p className="text-sm text-destructive">
                    {errors.expectedDate.message}
                  </p>
                )}
              </div>

              {/* Completed Date */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Date Completed
                </label>

                <Input
                  {...register('completedDate')}
                  type="date"
                  className={
                    errors.completedDate
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.completedDate && (
                  <p className="text-sm text-destructive">
                    {errors.completedDate.message}
                  </p>
                )}
              </div>

              {/* Status */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Status *
                </label>

                <Select
                  defaultValue={item?.status || 'pending'}
                  onValueChange={(value) =>
                    setValue('status', value as MaintenanceFormData['status'], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    className={
                      errors.status
                        ? 'border-destructive'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.status && (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Notes */}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Notes
                </label>

                <Textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="Any additional notes..."
                  className={
                    errors.notes
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.notes && (
                  <p className="text-sm text-destructive">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => router.back()}
                  disabled={isSubmitting || isLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="gap-2 cursor-pointer"
                  disabled={isSubmitting || isLoading}
                >
                  {(isSubmitting || isLoading) && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {isEditing
                    ? 'Update Item'
                    : 'Create Item'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}