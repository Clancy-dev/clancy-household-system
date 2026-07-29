'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCategories, restoreCategory, permanentlyDeleteCategory, getDeletedCategories } from '@/lib/actions/categories'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CategoriesTrashPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await getDeletedCategories()

      if (result.success && result.data) {
        const deleted = result.data.filter((c: any) => c.isDeleted)
        setCategories(deleted)
      }
    } catch (error) {
      console.error('[v0] Error loading data:', error)
      toast.error('Error loading trash')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (categoryId: string) => {
    try {
      setActionId(categoryId)
      const result = await restoreCategory(categoryId)
      if (result.success) {
        toast.success('Category restored successfully')
        await loadData()
      } else {
        toast.error(result.error || 'Failed to restore category')
      }
    } catch (error) {
      console.error('[v0] Error restoring:', error)
      toast.error('Error restoring category')
    } finally {
      setActionId(null)
    }
  }

  const handleDeletePermanently = async (permanently: boolean) => {
    if (!selectedCategory) return

    try {
      setActionId(selectedCategory.id)
      const result = await permanentlyDeleteCategory(selectedCategory.id)
      if (result.success) {
        toast.success('Category permanently deleted')
        await loadData()
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('[v0] Error deleting:', error)
      toast.error('Error deleting category')
    } finally {
      setActionId(null)
      setShowDeleteModal(false)
      setSelectedCategory(null)
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
            <p className="text-muted-foreground mt-1">Deleted categories - restore or permanently delete</p>
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
        ) : categories.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No deleted categories found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="p-4 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  {category.color && (
                    <div
                      className="w-10 h-10 rounded border-2 border-foreground/20"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Deleted: {category.deletedAt ? new Date(category.deletedAt).toLocaleDateString() : 'N/A'}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-2 cursor-pointer"
                    onClick={() => handleRestore(category.id)}
                    disabled={actionId === category.id}
                  >
                    {actionId === category.id ? (
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
                      setSelectedCategory(category)
                      setShowDeleteModal(true)
                    }}
                    disabled={actionId === category.id}
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
        title="Permanently Delete Category?"
        description="This action cannot be undone. The category will be permanently removed from the system."
        itemName={selectedCategory?.name || ''}
        isLoading={actionId === selectedCategory?.id}
      />
    </div>
  )
}
