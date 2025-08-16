'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Wrench, 
  UserCheck, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WorkOrder, Client, Service, Worker } from '@/lib/types'

interface DashboardStats {
  totalWorkOrders: number
  pendingOrders: number
  completedOrders: number
  totalClients: number
  activeClients: number
  totalServices: number
  totalWorkers: number
  activeWorkers: number
  recentOrders: WorkOrder[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalClients: 0,
    activeClients: 0,
    totalServices: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch work orders
        const { data: workOrders } = await supabase
          .from('work_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        // Fetch clients
        const { data: clients } = await supabase
          .from('clients')
          .select('*')

        // Fetch services
        const { data: services } = await supabase
          .from('services')
          .select('*')

        // Fetch workers
        const { data: workers } = await supabase
          .from('workers')
          .select('*')

        if (workOrders && clients && services && workers) {
          const totalWorkOrders = workOrders.length
          const pendingOrders = workOrders.filter(order => order.status === 'Pending').length
          const completedOrders = workOrders.filter(order => order.status === 'Completed').length
          const totalClients = clients.length
          const activeClients = clients.filter(client => client.status === 'Active').length
          const totalServices = services.length
          const totalWorkers = workers.length
          const activeWorkers = workers.filter(worker => worker.status === 'Active').length

          setStats({
            totalWorkOrders,
            pendingOrders,
            completedOrders,
            totalClients,
            activeClients,
            totalServices,
            totalWorkers,
            activeWorkers,
            recentOrders: workOrders
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Overview of your work order management system
              </p>
            </div>
            <div className="flex space-x-3">
              <Button asChild>
                <Link href="/dashboard/work-orders/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Work Order
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/clients/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWorkOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders} pending, {stats.completedOrders} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeClients}</div>
                <p className="text-xs text-muted-foreground">
                  out of {stats.totalClients} total clients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalServices}</div>
                <p className="text-xs text-muted-foreground">
                  available services
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeWorkers}</div>
                <p className="text-xs text-muted-foreground">
                  out of {stats.totalWorkers} total workers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Work Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Work Orders</CardTitle>
              <CardDescription>
                Latest work orders in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No work orders yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/work-orders/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first work order
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{order.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Client: {order.client?.name || 'Unknown'} • 
                          Amount: ${order.total_amount}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(order.status)}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/work-orders/${order.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/work-orders">
                        View all work orders
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
