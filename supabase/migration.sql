-- Migration to add created_by columns and implement proper RLS
-- This script should be run on your existing Supabase database

-- Add created_by columns to existing tables
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- For existing data, set created_by to the first user (you may need to adjust this)
-- This is a temporary fix - in production, you should properly assign ownership
UPDATE public.clients SET created_by = (SELECT id FROM public.users LIMIT 1) WHERE created_by IS NULL;
UPDATE public.services SET created_by = (SELECT id FROM public.users LIMIT 1) WHERE created_by IS NULL;
UPDATE public.workers SET created_by = (SELECT id FROM public.users LIMIT 1) WHERE created_by IS NULL;
UPDATE public.work_orders SET created_by = (SELECT id FROM public.users LIMIT 1) WHERE created_by IS NULL;

-- Make created_by NOT NULL after populating
ALTER TABLE public.clients ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.services ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.workers ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.work_orders ALTER COLUMN created_by SET NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view all services" ON public.services;
DROP POLICY IF EXISTS "Users can insert services" ON public.services;
DROP POLICY IF EXISTS "Users can update services" ON public.services;
DROP POLICY IF EXISTS "Users can delete services" ON public.services;

DROP POLICY IF EXISTS "Users can view all workers" ON public.workers;
DROP POLICY IF EXISTS "Users can insert workers" ON public.workers;
DROP POLICY IF EXISTS "Users can update workers" ON public.workers;
DROP POLICY IF EXISTS "Users can delete workers" ON public.workers;

DROP POLICY IF EXISTS "Users can view all work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can insert work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can update work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Users can delete work orders" ON public.work_orders;

DROP POLICY IF EXISTS "Users can view all work order services" ON public.work_order_services;
DROP POLICY IF EXISTS "Users can insert work order services" ON public.work_order_services;
DROP POLICY IF EXISTS "Users can update work order services" ON public.work_order_services;
DROP POLICY IF EXISTS "Users can delete work order services" ON public.work_order_services;

-- Create new secure RLS policies
CREATE POLICY "Users can view own clients" ON public.clients
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own clients" ON public.clients
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view own services" ON public.services
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert services" ON public.services
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own services" ON public.services
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own services" ON public.services
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view own workers" ON public.workers
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert workers" ON public.workers
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own workers" ON public.workers
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own workers" ON public.workers
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view own work orders" ON public.work_orders
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert work orders" ON public.work_orders
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own work orders" ON public.work_orders
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own work orders" ON public.work_orders
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view own work order services" ON public.work_order_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.work_orders 
            WHERE id = work_order_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert work order services" ON public.work_order_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.work_orders 
            WHERE id = work_order_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update own work order services" ON public.work_order_services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.work_orders 
            WHERE id = work_order_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete own work order services" ON public.work_order_services
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.work_orders 
            WHERE id = work_order_id AND created_by = auth.uid()
        )
    );
