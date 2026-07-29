'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createExpense, updateExpense } from '@/lib/actions/expenses'
import { expenseSchema } from '@/lib/validations/expenses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import type { z } from 'zod'

interface ExpenseFormProps {
  expense?: {
    id: string
    name: string
    amount: number
    categoryId: string
    image: string | null
    paidOn: string | null
    instructions: string | null
    accountNumber: string | null
    calculations: string | null
  }
  categories: Array<{ id: string; name: string }>
  isEditing?: boolean
}

type ExpenseFormData = z.infer<typeof expenseSchema>

export function ExpenseForm({
  expense,
  categories,
  isEditing = false,
}: ExpenseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: expense?.name || '',
      amount: expense?.amount || 0,
      categoryId: expense?.categoryId || '',
      image: expense?.image || '',
      paidOn: expense?.paidOn || '',
      instructions: expense?.instructions || '',
      accountNumber: expense?.accountNumber || '',
      calculations: expense?.calculations || '',
    },
  })

  const imageValue = watch('image')
  const categoryValue = watch('categoryId') ?? ''

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
        throw new Error('No image URL returned from Cloudinary')
      }

      setValue('image', data.secure_url, {
        shouldValidate: true,
      })

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('[v0] Cloudinary upload failed:', error)

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

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (isEditing && expense) {
        const result = await updateExpense(expense.id, data)

        if (result.success) {
          toast.success('Expense updated successfully')
          router.push(`/expenses/${expense.id}`)
        } else {
          toast.error(result.error || 'Failed to update expense')
        }
      } else {
        const result = await createExpense(data)

        if (result.success) {
          toast.success('Expense created successfully')
          router.push('/expenses')
        } else {
          toast.error(result.error || 'Failed to create expense')
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
              {isEditing ? 'Edit Expense' : 'Create New Expense'}
            </CardTitle>

            <CardDescription>
              {isEditing
                ? 'Update the expense details'
                : 'Fill in the details to create a new expense'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Expense Name *
                </label>

                <Input
                  {...register('name')}
                  placeholder="e.g., Monthly Rent, Electricity Bill"
                  className={errors.name ? 'border-destructive' : ''}
                />

                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>


              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Category *
                </label>

               <Select
                   value={categoryValue}
                   onValueChange={(value) => {
                     if (!value) return
                     setValue('categoryId', value, {
                     shouldValidate: true,
                   })
                  }}
                 >
                  <SelectTrigger
                    className={
                      errors.categoryId
                        ? 'border-destructive'
                        : ''
                    }
                  >
                    <SelectValue>
                          {
                           categories.find(
                           (cat) => cat.id === categoryValue
                           )?.name || 'Select a category'
                          }
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>


              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Amount (UGX) *
                </label>

                <Input
                  {...register('amount')}
                  type="number"
                  placeholder="0"
                  step="0.01"
                  className={errors.amount ? 'border-destructive' : ''}
                />

                {errors.amount && (
                  <p className="text-sm text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>
                            {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Expense Image
                </label>

                {imageValue ? (
                  <div className="relative">
                    <img
                      src={imageValue}
                      alt="Expense"
                      className="h-48 w-full rounded-lg border object-contain"
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute cursor-pointer right-2 top-2"
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
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>


              {/* Payment Schedule */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  When Is It Paid?
                </label>

                <Input
                  {...register('paidOn')}
                  placeholder="e.g., Every 1st of the month"
                  className={
                    errors.paidOn
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.paidOn && (
                  <p className="text-sm text-destructive">
                    {errors.paidOn.message}
                  </p>
                )}
              </div>


              {/* Payment Instructions */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Payment Instructions
                </label>

                <Textarea
                  {...register('instructions')}
                  placeholder="e.g., Dial *165# → Select option → Follow prompts"
                  rows={3}
                  className={
                    errors.instructions
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.instructions && (
                  <p className="text-sm text-destructive">
                    {errors.instructions.message}
                  </p>
                )}
              </div>


              {/* Account Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Account Number
                </label>

                <Input
                  {...register('accountNumber')}
                  placeholder="e.g., UMEME-001234"
                  className={
                    errors.accountNumber
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.accountNumber && (
                  <p className="text-sm text-destructive">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>


              {/* Calculations / Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Calculations / Notes
                </label>

                <Textarea
                  {...register('calculations')}
                  placeholder="e.g., Base rate 25,000 + Usage 8,000 = 33,000"
                  rows={3}
                  className={
                    errors.calculations
                      ? 'border-destructive'
                      : ''
                  }
                />

                {errors.calculations && (
                  <p className="text-sm text-destructive">
                    {errors.calculations.message}
                  </p>
                )}
              </div>


              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting || isLoading}
                  className='cursor-pointer'
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="gap-2 cursor-pointer"
                >
                  {(isSubmitting || isLoading) && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {isEditing
                    ? 'Update Expense'
                    : 'Create Expense'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}