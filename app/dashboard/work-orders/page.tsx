'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WorkOrder, OrderStatus, PaymentStatus } from '@/lib/types'
import { toast } from 'sonner'

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'show-all'>('show-all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'show-all'>('show-all')

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          client:clients(name),
          worker:workers(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkOrders(data || [])
    } catch (error) {
      console.error('Error fetching work orders:', error)
      toast.error('Failed to fetch work orders')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work order?')) return

    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Work order deleted successfully')
      fetchWorkOrders()
    } catch (error) {
      console.error('Error deleting work order:', error)
      toast.error('Failed to delete work order')
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
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

  const getPaymentStatusBadge = (status: PaymentStatus) => {
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

  const filteredWorkOrders = workOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'show-all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'show-all' || order.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading work orders...</div>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Work Orders</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and track all work orders
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/work-orders/new">
                <Plus className="w-4 h-4 mr-2" />
                New Work Order
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search orders or clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'show-all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show-all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment</label>
                  <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | 'show-all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show-all">All Payment Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('show-all')
                        setPaymentFilter('show-all')
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Work Orders ({filteredWorkOrders.length})</CardTitle>
              <CardDescription>
                All work orders in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredWorkOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p>No work orders found</p>
                  {searchTerm || statusFilter !== 'show-all' || paymentFilter !== 'show-all' ? (
                    <p className="text-sm">Try adjusting your filters</p>
                  ) : (
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/work-orders/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first work order
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.title}</TableCell>
                          <TableCell>{order.client?.name || 'Unknown'}</TableCell>
                          <TableCell>{order.worker?.name || 'Unassigned'}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                          <TableCell>${order.total_amount}</TableCell>
                          <TableCell>
                            {order.scheduled_date 
                              ? new Date(order.scheduled_date).toLocaleDateString()
                              : 'Not scheduled'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/work-orders/${order.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/work-orders/${order.id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelete(order.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
