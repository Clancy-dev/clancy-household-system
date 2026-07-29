'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { restoreExpense, permanentlyDeleteExpense, getDeletedExpenses } from '@/lib/actions/expenses'
import { getCategories } from '@/lib/actions/categories'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExpensesTrashPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [expensesResult, categoriesResult] = await Promise.all([
        getDeletedExpenses(),
        getCategories(),
      ])

      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
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
      toast.error('Error loading trash')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (expenseId: string) => {
    try {
      setActionId(expenseId)
      const result = await restoreExpense(expenseId)
      if (result.success) {
        toast.success('Expense restored successfully')
        await loadData()
      } else {
        toast.error(result.error || 'Failed to restore expense')
      }
    } catch (error) {
      console.error('[v0] Error restoring:', error)
      toast.error('Error restoring expense')
    } finally {
      setActionId(null)
    }
  }

  const handleDeletePermanently = async (permanently: boolean) => {
    if (!selectedExpense) return

    try {
      setActionId(selectedExpense.id)
      const result = await permanentlyDeleteExpense(selectedExpense.id)
      if (result.success) {
        toast.success('Expense permanently deleted')
        await loadData()
      } else {
        toast.error(result.error || 'Failed to delete expense')
      }
    } catch (error) {
      console.error('[v0] Error deleting:', error)
      toast.error('Error deleting expense')
    } finally {
      setActionId(null)
      setShowDeleteModal(false)
      setSelectedExpense(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" className="gap-2 mb-4 cursor-pointer" onClick={() => router.back()}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Trash</h1>
            <p className="text-muted-foreground mt-1">Deleted expenses - restore or permanently delete</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Loading trash...</p>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No deleted expenses found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className="p-4 space-y-3 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-semibold text-foreground">{expense.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {categories[expense.categoryId] || 'Unknown'}
                  </p>
                </div>

                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded">
                  <p className="text-2xl font-bold text-primary">UGX {expense.amount.toLocaleString()}</p>
                </div>

                <div className="text-xs text-muted-foreground">
                  Deleted: {expense.deletedAt ? new Date(expense.deletedAt).toLocaleDateString() : 'N/A'}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 cursor-pointer"
                    onClick={() => handleRestore(expense.id)}
                    disabled={actionId === expense.id}
                  >
                    {actionId === expense.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RotateCcw size={16} />
                    )}
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-2 cursor-pointer"
                    onClick={() => {
                      setSelectedExpense(expense)
                      setShowDeleteModal(true)
                    }}
                    disabled={actionId === expense.id}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePermanently}
        title="Permanently Delete Expense?"
        description="This action cannot be undone. The expense will be permanently removed from the system."
        itemName={selectedExpense?.name || ''}
        isLoading={actionId === selectedExpense?.id}
      />
    </div>
  )
}
