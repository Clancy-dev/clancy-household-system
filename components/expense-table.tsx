'use client'

import { Edit2, Trash2, ZoomIn, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LightboxImage } from '@/components/lightbox'
import { deleteExpense } from '@/lib/actions/expenses'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface Expense {
  id: string
  name: string
  amount: string
  categoryId: string
  image: string | null
  paidOn: string | null
  instructions: string | null
  accountNumber: string | null
  calculations: string | null
  isDeleted: boolean
  deletedAt: Date | null
}

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onView: (expense: Expense) => void
  onRefresh: () => void
}

export function ExpenseTable({ expenses, onEdit, onRefresh, onView, }: ExpenseTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const totalAmount = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount || 0),
  0
)

  const handleDelete = async (expense: Expense) => {
    if (!confirm(`Are you sure you want to delete "${expense.name}"?`)) return

    try {
      setDeleting(expense.id)
      const result = await deleteExpense(expense.id)
      if (result.success) {
        toast.success('Expense deleted successfully')
        onRefresh()
      } else {
        toast.error(result.error || 'Failed to delete expense')
      }
    } catch (error) {
      console.error('[v0] Error deleting expense:', error)
      toast.error('Error deleting expense')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border mb-4">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Image</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Expense Name</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">When Paid</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Payment Instructions</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Account #</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap">Calculations</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  {expense.image ? (
                    <LightboxImage src={expense.image} alt={expense.name} className="w-12 h-12" />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <ZoomIn size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground font-medium">{expense.name}</td>
                <td className="px-4 py-3 text-foreground">{expense.paidOn || '-'}</td>
                <td className="px-4 py-3 text-foreground max-w-xs">
                  <p className="truncate">{expense.instructions || '-'}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{expense.accountNumber || '-'}</td>
                <td className="px-4 py-3 text-foreground max-w-xs">
                  <p className="truncate">{expense.calculations || '-'}</p>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-primary"> {Number(expense.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 cursor-pointer h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                      onClick={() => onView(expense)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 cursor-pointer h-auto text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950"
                      onClick={() => onEdit(expense)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 cursor-pointer h-auto text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDelete(expense)}
                      disabled={deleting === expense.id}
                      title="Delete"
                    >
                      {deleting === expense.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 mb-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            {expense.image && (
              <LightboxImage
                src={expense.image}
                alt={expense.name}
                className="w-full h-32 rounded"
              />
            )}
            <div>
              <h3 className="font-semibold text-foreground">{expense.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{expense.paidOn || 'No schedule'}</p>
            </div>
            {expense.instructions && (
              <div className="bg-muted p-2 rounded text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Instructions:</p>
                <p>{expense.instructions}</p>
              </div>
            )}
            {expense.calculations && (
              <div className="bg-muted p-2 rounded text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Calculations:</p>
                <p>{expense.calculations}</p>
              </div>
            )}
            {expense.accountNumber && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Account:</span> {expense.accountNumber}
              </p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-lg font-bold text-primary">UGX {(expense.amount || 0).toLocaleString()}</p>
              <div className="flex gap-2">
                {/* View */}
                   <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => onView(expense)}
                      title="View Details"
                    >
                 <Eye size={16} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(expense)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(expense)}
                  disabled={deleting === expense.id}
                >
                  {deleting === expense.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-destructive border-t-transparent rounded-full"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg px-6 py-3">
          <p className="text-sm text-muted-foreground mb-1">Category Total</p>
          <p className="text-2xl font-bold text-primary">UGX {totalAmount.toLocaleString()}</p>
        </div>
      </div>
    </>
  )
}
