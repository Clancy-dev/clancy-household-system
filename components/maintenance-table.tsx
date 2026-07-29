'use client'

import { useState } from 'react'
import { Edit2, Trash2, ZoomIn, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LightboxImage } from '@/components/lightbox'
import { deleteMaintenanceItem } from '@/lib/actions/maintenance'
import toast from 'react-hot-toast'

interface MaintenanceItem {
  id: string
  name: string
  cost: number | string
  category:
    | 'House Maintenance'
    | 'Household Maintenance'
    | 'Personal Maintenance'
  image: string | null
  expectedDate: Date | string | null
  completedDate: Date | string | null
  status: string
  isDeleted: boolean
  deletedAt: Date | null
  notes: string | null
}

interface MaintenanceTableProps {
  items: MaintenanceItem[]
  onView: (item: MaintenanceItem) => void
  onEdit: (item: MaintenanceItem) => void
  onRefresh: () => void
}

export function MaintenanceTable({
  items,
  onView,
  onEdit,
  onRefresh,
}: MaintenanceTableProps) {

  const [deleting, setDeleting] = useState<string | null>(null)

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0
  )

  const handleDelete = async (item: MaintenanceItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return

    try {
      setDeleting(item.id)

      const result = await deleteMaintenanceItem(item.id)

      if (result.success) {
        toast.success('Maintenance item deleted')
        onRefresh()
      } else {
        toast.error(result.error || 'Delete failed')
      }

    } catch (error) {
      console.error(error)
      toast.error('Error deleting item')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Expected Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-muted/50"
              >
                <td className="px-4 py-3">
                  {item.image ? (
                    <LightboxImage
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <ZoomIn size={16}/>
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 font-medium">
                  {item.name}
                </td>

                <td className="px-4 py-3">
                  {item.expectedDate
                    ? new Date(item.expectedDate).toLocaleDateString()
                    : '-'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-right font-bold text-primary">
                  UGX {Number(item.cost).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                      title="View"
                      className='cursor-pointer'
                    >
                      <Eye size={17}/>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      title="Edit"
                      className='cursor-pointer'
                    >
                      <Edit2 size={17}/>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                      title="Delete"
                      className='cursor-pointer'
                    >
                      {deleting === item.id ? '...' : <Trash2 size={17}/>}
                    </Button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-3">
        <div className="bg-primary/10 rounded-lg px-5 py-2">
          <p className="text-sm text-muted-foreground">
            Category Total
          </p>

          <p className="text-xl font-bold text-primary">
            UGX {subtotal.toLocaleString()}
          </p>
        </div>
      </div>
    </>
  )
}