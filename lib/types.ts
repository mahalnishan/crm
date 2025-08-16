export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  client_type: 'Individual' | 'Company' | 'Cash' | 'Contractor'
  status: 'Active' | 'Inactive'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  created_at: string
  updated_at: string
}

export interface Worker {
  id: string
  name: string
  email?: string
  phone?: string
  status: 'Active' | 'Inactive'
  created_at: string
  updated_at: string
}

export interface WorkOrder {
  id: string
  title: string
  description?: string
  client_id: string
  worker_id?: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  payment_status: 'Pending' | 'Paid' | 'Partial'
  scheduled_date?: string
  completed_date?: string
  total_amount: number
  created_at: string
  updated_at: string
  client?: Client
  worker?: Worker
}

export interface WorkOrderService {
  id: string
  work_order_id: string
  service_id: string
  quantity: number
  unit_price: number
  total_price: number
  service?: Service
}

export interface WorkOrderWithServices extends WorkOrder {
  services: WorkOrderService[]
}

export type ClientType = Client['client_type']
export type OrderStatus = WorkOrder['status']
export type PaymentStatus = WorkOrder['payment_status']
export type WorkerStatus = Worker['status']
