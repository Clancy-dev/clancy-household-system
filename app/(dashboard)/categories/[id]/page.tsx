'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCategory, deleteCategory } from '@/lib/actions/categories'
import { getExpenses } from '@/lib/actions/expenses'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit2, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string

  const [category, setCategory] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryResult, expensesResult] = await Promise.all([
          getCategory(categoryId),
          getExpenses(),
        ])

        if (categoryResult.success && categoryResult.data) {
          setCategory(categoryResult.data)
        } else {
          toast.error('Category not found')
          router.push('/categories')
        }

        if (expensesResult.success && expensesResult.data) {
          setExpenses(expensesResult.data)
        }
      } catch (error) {
        console.error('[v0] Error loading data:', error)
        toast.error('Error loading category')
        router.push('/categories')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [categoryId, router])

  const handleDelete = async (permanently: boolean) => {
    try {
      setDeleting(true)
      const result = await deleteCategory(categoryId)
      if (result.success) {
        toast.success(permanently ? 'Category permanently deleted' : 'Category moved to trash')
        router.push('/categories')
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('[v0] Error deleting category:', error)
      toast.error('Error deleting category')
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

  if (!category) {
    return null
  }

  const totalExpenses = expenses.filter((e: any) => !e.isDeleted).length
  const totalAmount = expenses
    .filter((e: any) => !e.isDeleted)
    .reduce((sum: number, e: any) => sum + (e.amount || 0), 0)

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
              onClick={() => router.push(`/categories/${categoryId}/edit`)}
            >
              <Edit2 size={18} />
              Edit
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-destructive cursor-pointer hover:text-destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{category.name}</CardTitle>
                {category.description && (
                  <CardDescription className="mt-2">{category.description}</CardDescription>
                )}
              </div>
              {category.color && (
                <div
                  className="w-16 h-16 rounded-lg border-2 border-foreground/20"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-primary">{totalExpenses}</p>
              </div>
              <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-primary">UGX {totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Category Info */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-semibold text-foreground">Category Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-mono text-sm">{category.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-mono text-sm">{category.color}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(category.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-sm">{new Date(category.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            {totalExpenses > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4">Associated Expenses</h3>
                <div className="space-y-2">
                  {expenses
                    .filter((e: any) => !e.isDeleted)
                    .map((expense: any) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition"
                        onClick={() => router.push(`/expenses/${expense.id}`)}
                      >
                        <span className="font-medium text-foreground">{expense.name}</span>
                        <span className="text-primary font-semibold">UGX {expense.amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Category?"
        description="Are you sure you want to delete this category? Associated expenses can still be viewed."
        itemName={category.name}
        isLoading={deleting}
      />
    </div>
  )
}
