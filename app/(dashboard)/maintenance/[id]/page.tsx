'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getMaintenanceItem,
  deleteMaintenanceItem,
} from '@/lib/actions/maintenance'
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal'
import { LightboxImage } from '@/components/lightbox'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string,string> = {
  pending:
    'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200',
  'in-progress':
    'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200',
  completed:
    'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200',
}

const STATUS_LABELS: Record<string,string> = {
  pending:'Pending',
  'in-progress':'In Progress',
  completed:'Completed',
}

export default function MaintenanceDetailPage(){

  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item,setItem] = useState<any>(null)
  const [loading,setLoading] = useState(true)
  const [showDeleteModal,setShowDeleteModal] = useState(false)
  const [deleting,setDeleting] = useState(false)

  useEffect(()=>{

    const loadItem = async()=>{

      try{

        const result = await getMaintenanceItem(itemId)

        if(result.success && result.data){
          setItem(result.data)
        }else{
          toast.error('Maintenance item not found')
          router.push('/maintenance')
        }

      }catch(error){

        console.error('[Maintenance Detail]',error)
        toast.error('Error loading maintenance item')
        router.push('/maintenance')

      }finally{
        setLoading(false)
      }
    }

    loadItem()

  },[itemId,router])


  const handleDelete = async()=>{

    try{

      setDeleting(true)

      const result = await deleteMaintenanceItem(itemId)

      if(result.success){

        toast.success('Maintenance item moved to trash')
        router.push('/maintenance')

      }else{

        toast.error(result.error || 'Delete failed')

      }

    }catch(error){

      console.error(error)
      toast.error('Error deleting item')

    }finally{

      setDeleting(false)
      setShowDeleteModal(false)

    }
  }


  if(loading){

    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto" size={32}/>
          <p className="mt-2 text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    )

  }


  if(!item) return null


  return(

    <div className="min-h-screen bg-background">

      <div className="max-w-4xl mx-auto px-4 py-6">

        <div className="flex justify-between items-center mb-4">

          <Button
            variant="ghost"
            className="gap-2 cursor-pointer"
            onClick={()=>router.back()}
          >
            <ArrowLeft size={18}/>
            Back
          </Button>

          <div className="flex gap-2">

            <Button
              variant="outline"
              className="gap-2 cursor-pointer"
              onClick={()=>
                router.push(`/maintenance/${itemId}/edit`)
              }
            >
              <Edit2 size={18}/>
              Edit
            </Button>

            <Button
              variant="outline"
              className="gap-2 text-destructive cursor-pointer"
              onClick={()=>setShowDeleteModal(true)}
            >
              <Trash2 size={18}/>
              Delete
            </Button>

          </div>

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {item.image && (

            <Card>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Image
                </CardTitle>
              </CardHeader>

              <CardContent>
                <LightboxImage
                  src={item.image}
                  alt={item.name}
                  className="w-full rounded-lg"
                />
              </CardContent>

            </Card>

          )}


          <Card className={item.image ? 'lg:col-span-2':'lg:col-span-3'}>

            <CardHeader className="pb-3">

              <CardTitle>
                {item.name}
              </CardTitle>

              <CardDescription>
                Category: {item.category}
              </CardDescription>

            </CardHeader>


            <CardContent className="space-y-4">


              <div className="bg-primary/10 rounded-lg p-3">

                <p className="text-sm text-muted-foreground">
                  Cost
                </p>

                <p className="text-2xl font-bold text-primary">
                  UGX {Number(item.cost).toLocaleString()}
                </p>

              </div>


              <div>

                <h3 className="font-semibold mb-1">
                  Status
                </h3>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    STATUS_COLORS[item.status] ||
                    STATUS_COLORS.pending
                  }`}
                >
                  {STATUS_LABELS[item.status] || item.status}
                </span>

              </div>


              {item.expectedDate && (

                <div>

                  <h3 className="font-semibold mb-1">
                    Expected Date
                  </h3>

                  <p className="text-muted-foreground">
                    {new Date(item.expectedDate).toLocaleDateString()}
                  </p>

                </div>

              )}


              {item.completedDate && (

                <div>

                  <h3 className="font-semibold mb-1">
                    Completed Date
                  </h3>

                  <p className="text-muted-foreground">
                    {new Date(item.completedDate).toLocaleDateString()}
                  </p>

                </div>

              )}


              {item.notes && (

                <div>

                  <h3 className="font-semibold mb-1">
                    Notes
                  </h3>

                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {item.notes}
                  </p>

                </div>

              )}


              <div className="border-t pt-3 text-xs text-muted-foreground">

                <p>
                  Created: {new Date(item.createdAt).toLocaleString()}
                </p>

                <p>
                  Updated: {new Date(item.updatedAt).toLocaleString()}
                </p>

              </div>


            </CardContent>

          </Card>

        </div>

      </div>


      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={()=>setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Maintenance Item?"
        description="Are you sure you want to move this maintenance item to trash?"
        itemName={item.name}
        isLoading={deleting}
      />

    </div>

  )

}