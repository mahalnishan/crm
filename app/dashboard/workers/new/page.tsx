'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Save,
  UserCheck,
  UserX,
  Mail,
  Phone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { WorkerStatus } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewWorkerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active' as WorkerStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Worker name is required')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('workers')
        .insert([formData])

      if (error) throw error

      toast.success('Worker added successfully!')
      router.push('/dashboard/workers')
    } catch (error) {
      console.error('Error creating worker:', error)
      toast.error('Failed to create worker')
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
              <Link href="/dashboard/workers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workers
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Worker</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new worker to your team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Worker Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Worker Details
                </CardTitle>
                <CardDescription>
                  Enter the worker's information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Worker Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter worker's full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="worker@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as WorkerStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4 text-gray-600" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Active workers can be assigned to work orders
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Preview</CardTitle>
                <CardDescription>
                  How this worker will appear in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg">
                      {formData.name || 'Worker Name'}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {formData.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {formData.email}
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {formData.phone}
                      </div>
                    )}
                    {!formData.email && !formData.phone && (
                      <p className="text-gray-400 italic">No contact information provided</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/workers">
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={loading || !formData.name.trim()}>
                {loading ? 'Creating...' : <><Save className="w-4 h-4 mr-2" />Add Worker</>}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
