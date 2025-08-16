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
  UserCheck,
  UserX
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Worker, WorkerStatus } from '@/lib/types'
import { toast } from 'sonner'

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'show-all'>('show-all')

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setWorkers(data || [])
    } catch (error) {
      console.error('Error fetching workers:', error)
      toast.error('Failed to fetch workers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this worker?')) return

    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Worker deleted successfully')
      fetchWorkers()
    } catch (error) {
      console.error('Error deleting worker:', error)
      toast.error('Failed to delete worker')
    }
  }

  const getStatusBadge = (status: WorkerStatus) => {
    return status === 'Active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1" />Active</Badge>
      : <Badge variant="secondary" className="bg-gray-100 text-gray-800"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'show-all' || worker.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading workers...</div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workers</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your team of workers
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/workers/new">
                <Plus className="w-4 h-4 mr-2" />
                New Worker
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                                      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WorkerStatus | 'show-all')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show-all">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
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
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Workers ({filteredWorkers.length})</CardTitle>
              <CardDescription>
                All workers in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredWorkers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p>No workers found</p>
                  {searchTerm || statusFilter !== 'show-all' ? (
                    <p className="text-sm">Try adjusting your filters</p>
                  ) : (
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/workers/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add your first worker
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkers.map((worker) => (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium">{worker.name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {worker.email && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {worker.email}
                                </div>
                              )}
                              {worker.phone && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {worker.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(worker.status)}</TableCell>
                          <TableCell>
                            {new Date(worker.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/workers/${worker.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/workers/${worker.id}/edit`}>
                                  <Edit className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelete(worker.id)}
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
