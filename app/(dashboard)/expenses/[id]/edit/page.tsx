'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getExpense } from '@/lib/actions/expenses'
import { getCategories } from '@/lib/actions/categories'
import { ExpenseForm } from '@/components/forms/expense-form'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditExpensePage() {
  const params = useParams()
  const router = useRouter()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<any>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

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
          setCategories(categoriesResult.data)
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

  return <ExpenseForm expense={expense} categories={categories} isEditing />
}
