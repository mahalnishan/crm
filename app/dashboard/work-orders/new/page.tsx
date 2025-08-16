'use client'

import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calendar,
  User,
  Wrench
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Client, Service, Worker, OrderStatus, PaymentStatus } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'

interface WorkOrderService {
  service_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function NewWorkOrderPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  
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
  
  const [selectedServices, setSelectedServices] = useState<WorkOrderService[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch active clients only
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'Active')
        .order('name')

      // Fetch all services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name')

      // Fetch active workers only
      const { data: workersData } = await supabase
        .from('workers')
        .select('*')
        .eq('status', 'Active')
        .order('name')

      setClients(clientsData || [])
      setServices(servicesData || [])
      setWorkers(workersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load form data')
    }
  }

  const addService = () => {
    if (services.length === 0) {
      toast.error('No services available')
      return
    }

    const newService: WorkOrderService = {
      service_id: services[0].id,
      quantity: 1,
      unit_price: services[0].price,
      total_price: services[0].price
    }

    setSelectedServices([...selectedServices, newService])
    updateTotalAmount([...selectedServices, newService])
  }

  const removeService = (index: number) => {
    const updatedServices = selectedServices.filter((_, i) => i !== index)
    setSelectedServices(updatedServices)
    updateTotalAmount(updatedServices)
  }

  const updateService = (index: number, field: keyof WorkOrderService, value: string | number) => {
    const updatedServices = [...selectedServices]
    updatedServices[index] = { ...updatedServices[index], [field]: value }

    // Recalculate total price for this service
    if (field === 'quantity' || field === 'unit_price') {
      const service = updatedServices[index]
      service.total_price = service.quantity * service.unit_price
    }

    setSelectedServices(updatedServices)
    updateTotalAmount(updatedServices)
  }

  const updateTotalAmount = (services: WorkOrderService[]) => {
    const total = services.reduce((sum, service) => sum + service.total_price, 0)
    setFormData(prev => ({ ...prev, total_amount: total }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client_id) {
      toast.error('Please select a client')
      return
    }

    if (selectedServices.length === 0) {
      toast.error('Please add at least one service')
      return
    }

    setLoading(true)

    try {
      // Create work order
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .insert([{
          title: formData.title,
          description: formData.description,
          client_id: formData.client_id,
          worker_id: formData.worker_id === 'unassigned' ? null : formData.worker_id,
          status: formData.status,
          payment_status: formData.payment_status,
          scheduled_date: formData.scheduled_date || null,
          total_amount: formData.total_amount,
          created_by: user?.id
        }])
        .select()
        .single()

      if (workOrderError) throw workOrderError

      // Create work order services
      const workOrderServices = selectedServices.map(service => ({
        work_order_id: workOrder.id,
        service_id: service.service_id,
        quantity: service.quantity,
        unit_price: service.unit_price,
        total_price: service.total_price
      }))

      const { error: servicesError } = await supabase
        .from('work_order_services')
        .insert(workOrderServices)

      if (servicesError) throw servicesError

      toast.success('Work order created successfully!')
      router.push('/dashboard/work-orders')
    } catch (error) {
      console.error('Error creating work order:', error)
      toast.error('Failed to create work order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/work-orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Work Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Work Order</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new work order for your client
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the work order details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Work Order Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Kitchen Renovation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select 
                      value={formData.client_id} 
                      onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {client.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the work to be done..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="worker">Worker (Optional)</Label>
                    <Select 
                      value={formData.worker_id} 
                      onValueChange={(value) => setFormData({ ...formData, worker_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to worker" />
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Scheduled Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="scheduled_date"
                        type="datetime-local"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value as OrderStatus })}
                    >
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
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Services
                  </div>
                  <Button type="button" onClick={addService} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </CardTitle>
                <CardDescription>
                  Select services and quantities for this work order
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No services added yet</p>
                    <Button type="button" onClick={addService} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedServices.map((service, index) => {
                      const selectedService = services.find(s => s.id === service.service_id)
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Service</Label>
                              <Select 
                                value={service.service_id} 
                                onValueChange={(value) => {
                                  const newService = services.find(s => s.id === value)!
                                  updateService(index, 'service_id', value)
                                  updateService(index, 'unit_price', newService.price)
                                  updateService(index, 'total_price', newService.price * service.quantity)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                                onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value))}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Unit Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={service.unit_price}
                                onChange={(e) => updateService(index, 'unit_price', parseFloat(e.target.value))}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Total Price</Label>
                              <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                                <span className="font-mono">${service.total_price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${formData.total_amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Payment Status:</span>
                    <Select 
                      value={formData.payment_status} 
                      onValueChange={(value) => setFormData({ ...formData, payment_status: value as PaymentStatus })}
                    >
                      <SelectTrigger className="w-32">
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

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/work-orders">
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={loading || selectedServices.length === 0}>
                {loading ? 'Creating...' : <><Save className="w-4 h-4 mr-2" />Create Work Order</>}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
