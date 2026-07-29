'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getDeletedMaintenanceItems,
  restoreMaintenanceItem,
  permanentlyDeleteMaintenanceItem,
} from '@/lib/actions/maintenance'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, RotateCcw, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export default function MaintenanceTrashPage() {
  const router = useRouter()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const result = await getDeletedMaintenanceItems()

      if (result.success && result.data) {
        setItems(
          result.data.filter(
            (item: any) => item.isDeleted
          )
        )
      }
    } catch (error) {
      console.error(error)
      toast.error('Error loading trash')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      setActionId(id)

      const result = await restoreMaintenanceItem(id)

      if (result.success) {
        toast.success('Item restored successfully')
        loadData()
      } else {
        toast.error(result.error || 'Restore failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error restoring item')
    } finally {
      setActionId(null)
    }
  }

  const handlePermanentDelete = async () => {
    if (!selectedItem) return

    try {
      setActionId(selectedItem.id)

      const result = await permanentlyDeleteMaintenanceItem(selectedItem.id)

      if (result.success) {
        toast.success('Item permanently deleted')
        loadData()
      } else {
        toast.error(result.error || 'Delete failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting item')
    } finally {
      setActionId(null)
      setShowDeleteModal(false)
      setSelectedItem(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Button
            variant="ghost"
            className="gap-2 mb-3 cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
            Back
          </Button>

          <h1 className="text-3xl font-bold">
            Trash
          </h1>

          <p className="text-muted-foreground mt-1">
            Restore or permanently delete maintenance items
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2
              className="animate-spin"
              size={32}
            />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No deleted maintenance items found
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {items.map(item => (
              <Card
                key={item.id}
                className="p-4 space-y-3"
              >

                <div>
                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>

                <div className="bg-primary/10 rounded p-3">
                  <p className="text-xl font-bold text-primary">
                    UGX {Number(item.cost).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    STATUS_COLORS[item.status] ||
                    STATUS_COLORS.pending
                  }`}
                >
                  {item.status}
                </span>

                <p className="text-xs text-muted-foreground">
                  Deleted:{' '}
                  {item.deletedAt
                    ? new Date(item.deletedAt).toLocaleDateString()
                    : '-'}
                </p>

                <div className="flex gap-2">

                  <Button
                    size="sm"
                    className="flex-1 gap-2 cursor-pointer"
                    onClick={() => handleRestore(item.id)}
                    disabled={actionId === item.id}
                  >
                    {actionId === item.id ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <RotateCcw size={16} />
                    )}

                    Restore
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedItem(item)
                      setShowDeleteModal(true)
                    }}
                    className='cursor-pointer'
                  >
                    <Trash2 size={16} />
                  </Button>

                </div>

              </Card>
            ))}

          </div>
        )}

      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedItem(null)
        }}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Item?"
        description="This action cannot be undone. The maintenance item will be permanently removed."
        itemName={selectedItem?.name || ''}
        isLoading={actionId === selectedItem?.id}
      />

    </div>
  )
}