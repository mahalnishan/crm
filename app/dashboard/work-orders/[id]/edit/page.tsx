'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { WorkOrderWithServices, Client, Worker, Service, OrderStatus, PaymentStatus } from '@/lib/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface WorkOrderService {
  id?: string
  service_id: string
  quantity: number
  unit_price: number
  service?: Service
}

export default function EditWorkOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workOrder, setWorkOrder] = useState<WorkOrderWithServices | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [services, setServices] = useState<Service[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    worker_id: 'unassigned',
    status: 'Pending' as OrderStatus,
    payment_status: 'Pending' as PaymentStatus,
    scheduled_date: '',
    total_amount: 0
  })
  
  const [orderServices, setOrderServices] = useState<WorkOrderService[]>([])

  useEffect(() => {
    if (params.id) {
      fetchData(params.id as string)
    }
  }, [params.id])

  const fetchData = async (id: string) => {
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
      
      // Set form data
      setFormData({
        title: orderData.title,
        description: orderData.description || '',
        client_id: orderData.client_id,
        worker_id: orderData.worker_id || 'unassigned',
        status: orderData.status,
        payment_status: orderData.payment_status,
        scheduled_date: orderData.scheduled_date || '',
        total_amount: orderData.total_amount
      })

      // Set order services
      if (servicesData) {
        setOrderServices(servicesData.map(s => ({
          id: s.id,
          service_id: s.service_id,
          quantity: s.quantity,
          unit_price: s.unit_price,
          service: s.service
        })))
      }

      // Fetch clients, workers, and services
      await Promise.all([
        fetchClients(),
        fetchWorkers(),
        fetchServices()
      ])

    } catch (error) {
      console.error('Error fetching work order:', error)
      toast.error('Failed to fetch work order')
      router.push('/dashboard/work-orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'Active')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('status', 'Active')
        .order('name')

      if (error) throw error
      setWorkers(data || [])
    } catch (error) {
      console.error('Error fetching workers:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addService = () => {
    setOrderServices(prev => [...prev, {
      service_id: '',
      quantity: 1,
      unit_price: 0
    }])
  }

  const removeService = (index: number) => {
    setOrderServices(prev => prev.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: string, value: string | number) => {
    setOrderServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ))
  }

  const calculateTotal = () => {
    return orderServices.reduce((total, service) => {
      const serviceData = services.find(s => s.id === service.service_id)
      const price = serviceData?.price || 0
      return total + (service.quantity * price)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.client_id) {
      toast.error('Please select a client')
      return
    }

    if (orderServices.length === 0) {
      toast.error('Please add at least one service')
      return
    }

    try {
      setSaving(true)

      const totalAmount = calculateTotal()

      // Update work order
      const { error: orderError } = await supabase
        .from('work_orders')
        .update({
          title: formData.title,
          description: formData.description,
          client_id: formData.client_id,
          worker_id: formData.worker_id === 'unassigned' ? null : formData.worker_id,
          status: formData.status,
          payment_status: formData.payment_status,
          scheduled_date: formData.scheduled_date || null,
          total_amount: totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (orderError) throw orderError

      // Delete existing services
      const { error: deleteError } = await supabase
        .from('work_order_services')
        .delete()
        .eq('work_order_id', params.id)

      if (deleteError) throw deleteError

      // Insert new services
      if (orderServices.length > 0) {
        const servicesToInsert = orderServices.map(service => ({
          work_order_id: params.id,
          service_id: service.service_id,
          quantity: service.quantity,
          unit_price: services.find(s => s.id === service.service_id)?.price || 0
        }))

        const { error: servicesError } = await supabase
          .from('work_order_services')
          .insert(servicesToInsert)

        if (servicesError) throw servicesError
      }

      toast.success('Work order updated successfully')
      router.push(`/dashboard/work-orders/${params.id}`)
    } catch (error) {
      console.error('Error updating work order:', error)
      toast.error('Failed to update work order')
    } finally {
      setSaving(false)
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
                <Link href={`/dashboard/work-orders/${params.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Work Order
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Work Order</h1>
                <p className="text-gray-600 dark:text-gray-400">Update work order details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the work order details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter work order title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Scheduled Date</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter work order description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
                <CardDescription>
                  Assign client and worker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select value={formData.client_id} onValueChange={(value) => handleInputChange('client_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              {client.client_type === 'Individual' && <User className="w-4 h-4" />}
                              {client.client_type === 'Company' && <Building className="w-4 h-4" />}
                              {client.client_type === 'Cash' && <DollarSign className="w-4 h-4" />}
                              {client.client_type === 'Contractor' && <User className="w-4 h-4" />}
                              {client.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="worker">Worker</Label>
                    <Select value={formData.worker_id} onValueChange={(value) => handleInputChange('worker_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a worker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">No assignment</SelectItem>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Update order and payment status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Order Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as OrderStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select value={formData.payment_status} onValueChange={(value) => handleInputChange('payment_status', value as PaymentStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>
                  Manage services for this work order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderServices.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Service {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Service *</Label>
                        <Select 
                          value={service.service_id} 
                          onValueChange={(value) => updateService(index, 'service_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} - ${s.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={services.find(s => s.id === service.service_id)?.price || 0}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Subtotal: ${(service.quantity * (services.find(s => s.id === service.service_id)?.price || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addService}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
                
                <Separator />
                
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total Amount: ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/work-orders/${params.id}`}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
