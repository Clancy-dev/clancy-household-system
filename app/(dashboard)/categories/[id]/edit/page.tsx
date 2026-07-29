'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCategory } from '@/lib/actions/categories'
import { CategoryForm } from '@/components/forms/category-form'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string

  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const result = await getCategory(categoryId)
        if (result.success && result.data) {
          setCategory(result.data)
        } else {
          toast.error('Category not found')
          router.push('/categories')
        }
      } catch (error) {
        console.error('[v0] Error loading category:', error)
        toast.error('Error loading category')
        router.push('/categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [categoryId, router])

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

  return <CategoryForm category={category} isEditing />
}
