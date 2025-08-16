'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft,
  Save,
  Wrench,
  DollarSign
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Service name is required')
      return
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('services')
        .insert([formData])

      if (error) throw error

      toast.success('Service created successfully!')
      router.push('/dashboard/services')
    } catch (error) {
      console.error('Error creating service:', error)
      toast.error('Failed to create service')
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
              <Link href="/dashboard/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Service</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new service to your catalog
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Service Details
                </CardTitle>
                <CardDescription>
                  Enter the service information and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kitchen Renovation, Plumbing Repair"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this service includes..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter the base price for this service
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Service Preview</CardTitle>
                <CardDescription>
                  How this service will appear in your catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg">
                      {formData.name || 'Service Name'}
                    </h3>
                    <span className="font-mono text-lg font-bold text-green-600">
                      ${formData.price.toFixed(2)}
                    </span>
                  </div>
                  {formData.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.description}
                    </p>
                  )}
                  {!formData.description && (
                    <p className="text-gray-400 italic">No description provided</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/services">
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={loading || !formData.name.trim() || formData.price <= 0}>
                {loading ? 'Creating...' : <><Save className="w-4 h-4 mr-2" />Create Service</>}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
