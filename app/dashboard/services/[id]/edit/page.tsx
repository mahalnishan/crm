'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Service } from '@/lib/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Save, 
  Wrench,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [service, setService] = useState<Service | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0
  })

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string)
    }
  }, [params.id])

  const fetchService = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setService(data)
      setFormData({
        name: data.name,
        description: data.description || '',
        price: data.price
      })
    } catch (error) {
      console.error('Error fetching service:', error)
      toast.error('Failed to fetch service')
      router.push('/dashboard/services')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a service name')
      return
    }

    if (formData.price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('services')
        .update({
          name: formData.name,
          description: formData.description || null,
          price: formData.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Service updated successfully')
      router.push(`/dashboard/services/${params.id}`)
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error('Failed to update service')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading service...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!service) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Service not found</div>
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
                <Link href={`/dashboard/services/${params.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Service
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Service</h1>
                <p className="text-gray-600 dark:text-gray-400">Update service information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the service details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter service name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="Enter service price"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter service description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How the service will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{formData.name || 'Service Name'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      ${formData.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/services/${params.id}`}>
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
