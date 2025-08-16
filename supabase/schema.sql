-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE client_type AS ENUM ('Individual', 'Company', 'Cash', 'Contractor');
CREATE TYPE order_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Partial');
CREATE TYPE worker_status AS ENUM ('Active', 'Inactive');

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    client_type client_type DEFAULT 'Individual',
    status worker_status DEFAULT 'Active',
    notes TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status worker_status DEFAULT 'Active',
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
    status order_status DEFAULT 'Pending',
    payment_status payment_status DEFAULT 'Pending',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.work_order_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_client_id ON public.work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_worker_id ON public.work_orders(worker_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_order_services_work_order_id ON public.work_order_services(work_order_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Clients: Users can only see clients they created
CREATE POLICY "Users can view own clients" ON public.clients
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own clients" ON public.clients
    FOR DELETE USING (auth.uid() = created_by);

-- Services: Users can only see services they created
CREATE POLICY "Users can view own services" ON public.services
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert services" ON public.services
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own services" ON public.services
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own services" ON public.services
    FOR DELETE USING (auth.uid() = created_by);

-- Workers: Users can only see workers they created
CREATE POLICY "Users can view own workers" ON public.workers
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert workers" ON public.workers
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own workers" ON public.workers
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own workers" ON public.workers
    FOR DELETE USING (auth.uid() = created_by);

-- Work Orders: Users can only see work orders they created
CREATE POLICY "Users can view own work orders" ON public.work_orders
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert work orders" ON public.work_orders
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own work orders" ON public.work_orders
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own work orders" ON public.work_orders
    FOR DELETE USING (auth.uid() = created_by);

-- Work Order Services: Users can only see services for work orders they created
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

-- Create functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
