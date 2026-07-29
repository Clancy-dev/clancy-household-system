'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getMaintenanceItem } from '@/lib/actions/maintenance'
import { MaintenanceForm } from '@/components/forms/maintenance-form'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditMaintenancePage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const itemResult = await getMaintenanceItem(itemId)

        if (itemResult.success && itemResult.data) {
          setItem(itemResult.data)
        } else {
          toast.error('Maintenance item not found')
          router.push('/maintenance')
        }

      } catch (error) {
        console.error(
          '[Maintenance Edit] Error loading item:',
          error
        )

        toast.error(
          'Error loading maintenance item'
        )

        router.push('/maintenance')

      } finally {
        setLoading(false)
      }
    }

    if (itemId) {
      loadData()
    }

  }, [itemId, router])


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">
            Loading...
          </p>
        </div>
      </div>
    )
  }


  if (!item) {
    return null
  }


  return (
    <MaintenanceForm
      item={item}
      isEditing
    />
  )
}