'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getExpense, deleteExpense } from '@/lib/actions/expenses'
import { getCategories } from '@/lib/actions/categories'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { LightboxImage } from '@/components/lightbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit2, Trash2, ZoomIn, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<any>(null)
  const [categories, setCategories] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expenseResult, categoriesResult] = await Promise.all([
          getExpense(expenseId),
          getCategories(),
        ])

        if (expenseResult.success && expenseResult.data) {
          setExpense(expenseResult.data)
        } else {
          toast.error('Expense not found')
          router.push('/expenses')
        }

        if (categoriesResult.success && categoriesResult.data) {
          const catMap = (categoriesResult.data as any[]).reduce((acc, cat) => {
            acc[cat.id] = cat.name
            return acc
          }, {})
          setCategories(catMap)
        }
      } catch (error) {
        console.error('[v0] Error loading data:', error)
        toast.error('Error loading expense')
        router.push('/expenses')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [expenseId, router])

  const handleDelete = async (permanently: boolean) => {
    try {
      setDeleting(true)
      const result = await deleteExpense(expenseId)
      if (result.success) {
        toast.success(permanently ? 'Expense permanently deleted' : 'Expense moved to trash')
        router.push('/expenses')
      } else {
        toast.error(result.error || 'Failed to delete expense')
      }
    } catch (error) {
      console.error('[v0] Error deleting expense:', error)
      toast.error('Error deleting expense')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!expense) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" className="gap-2 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft size={18} />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 cursor-pointer"
              onClick={() => router.push(`/expenses/${expenseId}/edit`)}
            >
              <Edit2 size={18} />
              Edit
            </Button>
            <Button
              variant="outline"
              className="gap-2 cursor-pointer text-destructive hover:text-destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} />
              Delete
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          {expense.image && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Image</CardTitle>
              </CardHeader>
              <CardContent>
                <LightboxImage src={expense.image} alt={expense.name} className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {/* Main Details */}
          <Card className={expense.image ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <CardHeader>
              <CardTitle>{expense.name}</CardTitle>
              <CardDescription>
                Category: {categories[expense.categoryId] || 'Unknown'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Amount */}
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-primary">UGX {expense.amount.toLocaleString()}</p>
              </div>

              {/* Payment Schedule */}
              {expense.paymentSchedule && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">When Is It Paid?</h3>
                  <p className="text-muted-foreground">{expense.paymentSchedule}</p>
                </div>
              )}

              {/* Payment Instructions */}
              {expense.instructions && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Payment Instructions</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{expense.instructions}</p>
                </div>
              )}

              {/* Account Number */}
              {expense.accountNumber && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Account Number</h3>
                  <p className="text-muted-foreground font-mono">{expense.accountNumber}</p>
                </div>
              )}

              {/* Calculations */}
              {expense.calculations && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Calculations / Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{expense.calculations}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t border-border pt-4 text-xs text-muted-foreground">
                <p>Created: {new Date(expense.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(expense.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Expense?"
        description="Are you sure you want to delete this expense?"
        itemName={expense.name}
        isLoading={deleting}
      />
    </div>
  )
}
