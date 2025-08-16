'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { WorkOrderWithServices } from '@/lib/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrderWithServices | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchWorkOrder(params.id as string)
    }
  }, [params.id])

  const fetchWorkOrder = async (id: string) => {
    try {
      setLoading(true)
      
      // Fetch work order with client and worker details
      const { data: orderData, error: orderError } = await supabase
        .from('work_orders')
        .select(`
          *,
          client:clients(*),
          worker:workers(*)
        `)
        .eq('id', id)
        .single()

      if (orderError) throw orderError

      // Fetch work order services
      const { data: servicesData, error: servicesError } = await supabase
        .from('work_order_services')
        .select(`
          *,
          service:services(*)
        `)
        .eq('work_order_id', id)

      if (servicesError) throw servicesError

      const workOrderWithServices: WorkOrderWithServices = {
        ...orderData,
        services: servicesData || []
      }

      setWorkOrder(workOrderWithServices)
    } catch (error) {
      console.error('Error fetching work order:', error)
      toast.error('Failed to fetch work order')
      router.push('/dashboard/work-orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'In Progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />In Progress</Badge>
      case 'Completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'Cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'Paid':
        return <Badge variant="outline" className="text-green-600 border-green-600">Paid</Badge>
      case 'Partial':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'Individual':
        return <User className="w-4 h-4" />
      case 'Company':
        return <Building className="w-4 h-4" />
      case 'Cash':
        return <DollarSign className="w-4 h-4" />
      case 'Contractor':
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading work order...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!workOrder) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Work order not found</div>
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
                <Link href="/dashboard/work-orders">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Work Orders
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{workOrder.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">Work Order #{workOrder.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/dashboard/work-orders/${workOrder.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(workOrder.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status</label>
                      <div className="mt-1">{getPaymentStatusBadge(workOrder.payment_status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Date</label>
                      <div className="mt-1">
                        {workOrder.scheduled_date 
                          ? new Date(workOrder.scheduled_date).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                      <div className="mt-1 text-lg font-semibold">${workOrder.total_amount}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {workOrder.description || 'No description provided'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>
                    {workOrder.services.length} service{workOrder.services.length !== 1 ? 's' : ''} included
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workOrder.services.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No services added to this order
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workOrder.services.map((orderService) => (
                        <div key={orderService.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{orderService.service?.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {orderService.quantity} × ${orderService.unit_price}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${orderService.quantity * orderService.unit_price}</div>
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
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getClientTypeIcon(workOrder.client?.client_type || '')}
                    <span className="font-medium">{workOrder.client?.name}</span>
                  </div>
                  {workOrder.client?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      {workOrder.client.email}
                    </div>
                  )}
                  {workOrder.client?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      {workOrder.client.phone}
                    </div>
                  )}
                  {workOrder.client?.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      {workOrder.client.address}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={`/dashboard/clients/${workOrder.client?.id}`}>
                        View Client Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Worker Information */}
              {workOrder.worker && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Assigned Worker
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="font-medium">{workOrder.worker.name}</div>
                    {workOrder.worker.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {workOrder.worker.email}
                      </div>
                    )}
                    {workOrder.worker.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {workOrder.worker.phone}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={`/dashboard/workers/${workOrder.worker.id}`}>
                          View Worker Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/dashboard/work-orders/${workOrder.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/dashboard/work-orders/new">
                      <FileText className="w-4 h-4 mr-2" />
                      Create New Order
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
