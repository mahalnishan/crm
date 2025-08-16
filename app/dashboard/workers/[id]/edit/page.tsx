'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Worker, WorkerStatus } from '@/lib/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Save, 
  User,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function EditWorkerPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [worker, setWorker] = useState<Worker | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active' as WorkerStatus
  })

  useEffect(() => {
    if (params.id) {
      fetchWorker(params.id as string)
    }
  }, [params.id])

  const fetchWorker = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setWorker(data)
      setFormData({
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        status: data.status
      })
    } catch (error) {
      console.error('Error fetching worker:', error)
      toast.error('Failed to fetch worker')
      router.push('/dashboard/workers')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a name')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('workers')
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Worker updated successfully')
      router.push(`/dashboard/workers/${params.id}`)
    } catch (error) {
      console.error('Error updating worker:', error)
      toast.error('Failed to update worker')
    } finally {
      setSaving(false)
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
                <Link href={`/dashboard/workers/${params.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Worker
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Worker</h1>
                <p className="text-gray-600 dark:text-gray-400">Update worker information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the worker's personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter worker name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Update the worker's current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as WorkerStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/workers/${params.id}`}>
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
