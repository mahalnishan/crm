'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Worker, WorkOrder } from '@/lib/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function WorkerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [worker, setWorker] = useState<Worker | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchData(params.id as string)
    }
  }, [params.id])

  const fetchData = async (id: string) => {
    try {
      setLoading(true)
      
      // Fetch worker details
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single()

      if (workerError) throw workerError

      setWorker(workerData)

      // Fetch work orders assigned to this worker
      const { data: ordersData, error: ordersError } = await supabase
        .from('work_orders')
        .select(`
          *,
          client:clients(name)
        `)
        .eq('worker_id', id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setWorkOrders(ordersData || [])

    } catch (error) {
      console.error('Error fetching worker:', error)
      toast.error('Failed to fetch worker details')
      router.push('/dashboard/workers')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'Inactive':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'In Progress':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><TrendingUp className="w-3 h-3 mr-1" />In Progress</Badge>
      case 'Completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'Cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading worker...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!worker) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Worker not found</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/workers">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Workers
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{worker.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Worker Details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/dashboard/workers/${worker.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Worker
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Worker Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Worker Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Worker Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(worker.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                      <div className="mt-1">
                        {new Date(worker.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    {worker.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{worker.email}</span>
                      </div>
                    )}
                    {worker.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{worker.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Work Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Work Orders</CardTitle>
                  <CardDescription>
                    {workOrders.length} work order{workOrders.length !== 1 ? 's' : ''} assigned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workOrders.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                        <FileText className="w-full h-full" />
                      </div>
                      <p>No work orders assigned to this worker</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{order.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Client: {order.client?.name || 'Unknown'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div>{getOrderStatusBadge(order.status)}</div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/work-orders/${order.id}`}>
                                View Order
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/dashboard/workers/${worker.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Worker
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/dashboard/workers/new">
                      <User className="w-4 h-4 mr-2" />
                      Add New Worker
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/dashboard/work-orders/new">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Work Order
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Work Orders</span>
                    <span className="font-semibold">{workOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Orders</span>
                    <span className="font-semibold">
                      {workOrders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Orders</span>
                    <span className="font-semibold">
                      {workOrders.filter(o => o.status === 'Completed').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
