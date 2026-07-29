'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryTable } from '@/components/category-table'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { getCategories } from '@/lib/actions/categories'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  isDeleted: boolean
  deletedAt: Date | null
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const result = await getCategories()
      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        toast.error('Failed to load categories')
      }
    } catch (error) {
      console.error('[v0] Error loading categories:', error)
      toast.error('Error loading categories')
    } finally {
      setLoading(false)
    }
  }



  const handleDelete = (category: Category) => {
    // setEditingCategory(category)
    // For delete action, we'll show it in the modal
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
               <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Categories</h1>
                <p className="text-foreground/60 mt-1">Manage and organize your expense categorie</p>
              </div>
      
              <div className="flex gap-2">
                  <Link href="/categories/trash">
                      <Button variant="outline" size="sm" className="cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                       Trash
                      </Button>
                  </Link>      
                  <Link href="/categories/create">
                      <Button className='cursor-pointer'>
                      <Plus className="mr-2 h-4 w-4" />
                       Create Category
                      </Button>
                  </Link>           
              </div>
            </div>
            </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground font-medium">Total Categories</p>
            <p className="text-3xl font-bold text-foreground mt-2">{categories.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground font-medium">Active Categories</p>
            <p className="text-3xl font-bold text-foreground mt-2">{categories.filter(c => !c.isDeleted).length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground font-medium">Deleted Categories</p>
            <p className="text-3xl font-bold text-foreground mt-2">{categories.filter(c => c.isDeleted).length}</p>
          </div>
        </div>

        {/* Categories Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No categories found. Create one to get started.</p>
          </div>
        ) : (
          <CategoryTable 
            categories={categories}
            onEdit={(category) => router.push(`/categories/${category.id}/edit`)}
            onView={(category) => router.push(`/categories/${category.id}`)}
            onRefresh={loadCategories}
          />
        )}
      </div>
    </div>
  )
}
