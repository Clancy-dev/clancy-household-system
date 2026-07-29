'use client'

import { Eye, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCategory } from '@/lib/actions/categories'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  isDeleted: boolean
  deletedAt: Date | null
}

interface CategoryTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onView: (category: Category) => void
  onRefresh: () => void
}

export function CategoryTable({ categories, onEdit, onView, onRefresh }: CategoryTableProps) {
  
  const categoryColorMap: { [key: string]: { bg: string; text: string } } = {
    'Utilities': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200' },
    'Healthcare': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200' },
    'Housing / Accommodation': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200' },
    'Personal Care': { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-700 dark:text-pink-200' },
    'Food': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200' },
    'Savings': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200' },
    'Long term plan': { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-700 dark:text-indigo-200' },
    'Development': { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-700 dark:text-cyan-200' },
    'Transport': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-200' },
    'Giving': { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-200' },
    'Communication': { bg: 'bg-violet-100 dark:bg-violet-900', text: 'text-violet-700 dark:text-violet-200' },
  }

  const getColorClasses = (categoryName: string) => {
    return categoryColorMap[categoryName] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-200',
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return
    
    try {
      const result = await deleteCategory(category.id)
      if (result.success) {
        toast.success('Category deleted successfully')
        onRefresh()
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('[v0] Error deleting category:', error)
      toast.error('Error deleting category')
    }
  }

  const activeCategories = categories.filter(c => !c.isDeleted)

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Color</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeCategories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-foreground font-medium">{category.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{category.description || 'No description'}</td>
                <td className="px-6 py-4">
                  <div className={`w-8 h-8 rounded-full ${category.color}`}></div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
  <Button
    variant="ghost"
    size="icon"
    onClick={() => onView(category)}
    title="View category"
    className='cursor-pointer'
  >
    <Eye size={18} />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    onClick={() => onEdit(category)}
    title="Edit category"
    className='cursor-pointer'
  >
    <Edit2 size={18} />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    className="text-destructive hover:text-destructive cursor-pointer"
    onClick={() => handleDelete(category)}
    title="Delete category"
  >
    <Trash2 size={18} />
  </Button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {activeCategories.map((category) => (
          <div key={category.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.description || 'No description'}</p>
              </div>
              <div className={`w-6 h-6 rounded-full flex-shrink-0 ${category.color}`}></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                 variant="outline"
                 size="sm"
                 className="flex-1"
                 onClick={() => onView(category)}
                >
               <Eye size={16} className="mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(category)}
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => handleDelete(category)}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
