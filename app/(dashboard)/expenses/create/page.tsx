'use client'

import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/actions/categories'
import { ExpenseForm } from '@/components/forms/expense-form'
import { Loader2 } from 'lucide-react'

export default function CreateExpensePage() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories()
        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('[v0] Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

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

  return <ExpenseForm categories={categories} />
}
