'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExpenseTable } from '@/components/expense-table'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { getExpenses } from '@/lib/actions/expenses'
import { getCategories } from '@/lib/actions/categories'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

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

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [expensesResult, categoriesResult] = await Promise.all([
        getExpenses(),
        getCategories(),
      ])

      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
      } else {
        toast.error('Failed to load expenses')
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      }
    } catch (error) {
      console.error('[v0] Error loading data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }



  const activeExpenses = expenses.filter(e => !e.isDeleted)
  const expensesByCategory = activeExpenses.reduce(
    (acc, expense) => {
      if (!acc[expense.categoryId]) {
        acc[expense.categoryId] = []
      }
      acc[expense.categoryId].push(expense)
      return acc
    },
    {} as Record<string, Expense[]>
  )

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  const getTotalAmount = () => {
  return activeExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  )
}

  const getCategoryTotal = (categoryId: string) => {
  return (expensesByCategory[categoryId] || []).reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  )
}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
         <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Tracker</h1>
          <p className="text-foreground/60 mt-1">Manage and track your expenses by category</p>
        </div>

        <div className="flex gap-2">
            <Link href="/expenses/trash">
                <Button variant="outline" size="sm" className="cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                 Trash
                </Button>
            </Link>      
            <Link href="/expenses/create">
                <Button className='cursor-pointer'>
                <Plus className="mr-2 h-4 w-4" />
                 Create Expense
                </Button>
            </Link>           
        </div>
      </div>
      </div>
     

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading expenses...</p>
            </div>
          </div>
        ) : activeExpenses.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No expenses found. Create one to get started.</p>
          </div>
        ) : (
          <>
            {/* Expense Tables */}
            <div className="space-y-12">
              {categories.map((category) => {
                const categoryExpenses = expensesByCategory[category.id] || []
                if (categoryExpenses.length === 0) return null

                return (
                  <div key={category.id}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                      <span className="text-lg font-semibold text-primary">
                        Total: UGX {getCategoryTotal(category.id).toLocaleString()}
                      </span>
                    </div>
                    <ExpenseTable
                      expenses={categoryExpenses}
                      onView={(expense) => router.push(`/expenses/${expense.id}`)}
                      onEdit={(expense) => router.push(`/expenses/${expense.id}/edit`)}
                      onRefresh={loadData}
                    />
                  </div>
                )
              })}
            </div>

            {/* Total Summary */}
            <div className="mt-16 border-t border-border pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Grand Total of All Expenses</h3>
                  <p className="text-sm text-muted-foreground">Combined total from all categories</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl sm:text-5xl font-bold text-primary">
                    UGX {getTotalAmount().toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeExpenses.length} expenses tracked
                  </p>
                </div>
              </div>
            </div>

            {/* Category Summary Cards */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">All Categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryExpenses = expensesByCategory[category.id] || []
                  const subtotal = getCategoryTotal(category.id)
                  return (
                    <div
                      key={category.id}
                      className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-left bg-card hover:bg-muted"
                    >
                      <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{categoryExpenses.length} expenses</p>
                      {subtotal > 0 && (
                        <p className="text-lg font-bold text-primary">UGX {subtotal.toLocaleString()}</p>
                      )}
                      {subtotal === 0 && <p className="text-sm text-muted-foreground italic">No expenses yet</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>


    </div>
  )
}
