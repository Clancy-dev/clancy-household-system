'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MaintenanceTable } from '@/components/maintenance-table'
import { Button } from '@/components/ui/button'
import { getMaintenanceItems } from '@/lib/actions/maintenance'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface MaintenanceItem {
  id: string
  name: string
  cost: number
  category:
    | 'House Maintenance'
    | 'Household Maintenance'
    | 'Personal Maintenance'
  image: string | null
  expectedDate: Date | null
  completedDate: Date | null
  status: string
  isDeleted: boolean
  deletedAt: Date | null
  notes: string | null
}

const categories = [
  {
    id: 'House Maintenance',
    name: 'House Maintenance',
  },
  {
    id: 'Household Maintenance',
    name: 'Household Maintenance',
  },
  {
    id: 'Personal Maintenance',
    name: 'Personal Maintenance',
  },
]

export default function MaintenancePage() {
  const router = useRouter()

  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const result = await getMaintenanceItems()

      if (result.success && result.data) {
        setItems(result.data)
      } else {
        toast.error(
          result.error || 'Failed to load maintenance items'
        )
      }
    } catch (error) {
      console.error('[Maintenance] Loading error:', error)
      toast.error('Error loading maintenance items')
    } finally {
      setLoading(false)
    }
  }

  const activeItems = items.filter(
    item => !item.isDeleted
  )

  const itemsByCategory = activeItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }

      acc[item.category].push(item)

      return acc
    },
    {} as Record<string, MaintenanceItem[]>
  )

  const getCategoryTotal = (category: string) => {
    return (itemsByCategory[category] || []).reduce(
      (sum, item) => sum + Number(item.cost || 0),
      0
    )
  }

  const getTotalAmount = () => {
    return activeItems.reduce(
      (sum, item) => sum + Number(item.cost || 0),
      0
    )
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Maintenance Tracker
            </h1>

            <p className="text-muted-foreground mt-1">
              Track and plan your maintenance tasks
            </p>
          </div>

          <div className="flex gap-2">

            <Link href="/maintenance/trash">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Trash
              </Button>
            </Link>

            <Link href="/maintenance/create">
              <Button className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add Maintenance Item
              </Button>
            </Link>

          </div>

        </div>
      </div>


      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {loading ? (

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground mt-4">
                Loading maintenance items...
              </p>
            </div>
          </div>

        ) : activeItems.length === 0 ? (

          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">
              No maintenance items found. Create one to get started.
            </p>
          </div>

        ) : (

          <>

            <div className="space-y-8">

              {categories.map(category => {
                const categoryItems =
                  itemsByCategory[category.id] || []

                if (categoryItems.length === 0) {
                  return null
                }

                return (
                  <div key={category.id}>

                    <div className="mb-4 flex items-center justify-between">

                      <h2 className="text-2xl font-bold">
                        {category.name}
                      </h2>

                      <span className="text-lg font-semibold text-primary">
                        UGX {getCategoryTotal(category.id).toLocaleString()}
                      </span>

                    </div>

                    <MaintenanceTable
                      items={categoryItems}
                      onView={(item)=> router.push(`/maintenance/${item.id}`)}
                      onEdit={(item) =>
                        router.push(`/maintenance/${item.id}/edit`)
                      }
                      onRefresh={loadData}
                    />

                  </div>
                )
              })}

            </div>


            <div className="mt-10 border-t pt-8">

              <div className="rounded-xl p-6 bg-muted">

                <h3 className="text-lg font-semibold">
                  Grand Total of All Maintenance Costs
                </h3>

                <p className="text-4xl font-bold text-primary mt-4">
                  UGX {getTotalAmount().toLocaleString()}
                </p>

                <p className="text-sm text-muted-foreground mt-2">
                  {activeItems.length} items tracked
                </p>

              </div>

            </div>


            <div className="mt-10">

              <h2 className="text-2xl font-bold mb-6">
                All Maintenance Categories
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {categories.map(category => {

                  const count =
                    itemsByCategory[category.id]?.length || 0

                  const total =
                    getCategoryTotal(category.id)

                  return (
                    <div
                      key={category.id}
                      className="p-4 rounded-lg border bg-card"
                    >

                      <h3 className="font-semibold">
                        {category.name}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2">
                        {count} items
                      </p>

                      <p className="text-lg font-bold text-primary mt-2">
                        UGX {total.toLocaleString()}
                      </p>

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