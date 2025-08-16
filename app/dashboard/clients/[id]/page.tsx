'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Building,
  CreditCard,
  Wrench,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Client, WorkOrder } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'
import { Label } from '@/components/ui/label'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (clientId) {
      fetchClientData()
    }
  }, [clientId])

  const fetchClientData = async () => {
    try {
      setLoading(true)
      
      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError

      // Fetch work orders for this client
      const { data: ordersData, error: ordersError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      setClient(clientData)
      setWorkOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching client data:', error)
      toast.error('Failed to load client data')
      router.push('/dashboard/clients')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      toast.success('Client deleted successfully')
      router.push('/dashboard/clients')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
    } finally {
      setDeleting(false)
    }
  }

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'Individual':
        return <User className="w-5 h-5" />
      case 'Company':
        return <Building className="w-5 h-5" />
      case 'Cash':
        return <CreditCard className="w-5 h-5" />
      case 'Contractor':
        return <Wrench className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'Active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
      : <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600 dark:text-gray-400" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading client data...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!client) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Client not found</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/clients">Back to Clients</Link>
            </Button>
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
                <Link href="/dashboard/clients">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Clients
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Client Details
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/clients/${client.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-700"
              >
                {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getClientTypeIcon(client.client_type)}
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Client Type</Label>
                      <p className="flex items-center gap-2 mt-1">
                        {getClientTypeIcon(client.client_type)}
                        {client.client_type}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(client.status)}
                      </div>
                    </div>
                  </div>

                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="mt-1">{client.email}</p>
                      </div>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="mt-1">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Address</Label>
                        <p className="mt-1">{client.address}</p>
                      </div>
                    </div>
                  )}

                  {client.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Notes</Label>
                      <p className="mt-1 text-gray-700 dark:text-gray-300">{client.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Work Orders ({workOrders.length})
                  </CardTitle>
                  <CardDescription>
                    All work orders for this client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No work orders yet</p>
                      <Button asChild className="mt-4">
                        <Link href="/dashboard/work-orders/new">
                          Create Work Order
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{order.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Status: {order.status} • Payment: {order.payment_status}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Amount: ${order.total_amount}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/work-orders/${order.id}`}>
                                View
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
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/work-orders/new">
                      <FileText className="w-4 h-4 mr-2" />
                      New Work Order
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/clients/${client.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Client
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Client Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Work Orders</span>
                    <span className="font-medium">{workOrders.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium text-green-600">
                      ${workOrders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Member Since</span>
                    <span className="font-medium">
                      {new Date(client.created_at).toLocaleDateString()}
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
