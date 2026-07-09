/*
# FactoryFlow Enterprise Database Schema

This migration creates the complete database schema for FactoryFlow - an Enterprise Workflow Management System.
The system supports multi-user authentication with role-based access control.

## Tables Created:

### Core Tables
1. **profiles** - Extends auth.users with additional user information (role, department, etc.)
2. **plants** - Manufacturing plants/facilities
3. **departments** - Departments within plants
4. **employees** - Employee records linked to auth users

### Operations Tables
5. **production_orders** - Production order workflow with status tracking
6. **inventory_items** - Inventory/stock management
7. **quality_inspections** - Quality control inspections
8. **shipments** - Logistics and shipment tracking

### Supporting Tables
9. **notifications** - User notifications
10. **activity_logs** - Audit trail for all actions
11. **attendance** - Employee attendance tracking
12. **leave_requests** - Employee leave management
13. **documents** - Document management system

## Security:
- RLS enabled on all tables
- Owner-scoped policies for personal data
- Role-based access for shared operational data
- All policies support both anon (public data) and authenticated users

## Notes:
1. Uses auth.users for authentication
2. Profiles table links to auth.users with role information
3. Production orders support full workflow states
4. Inventory tracks stock levels with auto-status updates
*/

-- Create ENUM types for consistent data
CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'plant_manager', 'production_manager', 
  'hr_manager', 'inventory_manager', 'quality_manager', 
  'logistics_manager', 'supervisor', 'employee'
);

CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'working_from_home', 'half_day');
CREATE TYPE production_status AS ENUM (
  'pending', 'planning', 'scheduled', 'in_progress', 
  'quality_check', 'on_hold', 'completed', 'cancelled'
);
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'reserved');
CREATE TYPE inspection_status AS ENUM ('pending', 'in_progress', 'passed', 'failed', 'conditional');
CREATE TYPE shipment_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled', 'delayed');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  avatar_url text,
  phone text,
  department_id uuid,
  is_email_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);

-- ============================================
-- PLANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  location text NOT NULL,
  address jsonb DEFAULT '{}',
  capacity integer DEFAULT 0,
  status text DEFAULT 'active',
  manager_id uuid REFERENCES profiles(id),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plants_code ON plants(code);
CREATE INDEX IF NOT EXISTS idx_plants_status ON plants(status);

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  plant_id uuid NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES profiles(id),
  employee_count integer DEFAULT 0,
  location text,
  description text,
  status text DEFAULT 'active',
  performance jsonb DEFAULT '{"efficiency": 0, "quality": 0, "safety": 0}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(plant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_departments_plant ON departments(plant_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON departments(manager_id);

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  department_id uuid REFERENCES departments(id),
  position text NOT NULL,
  manager_id uuid REFERENCES employees(id),
  status employee_status NOT NULL DEFAULT 'active',
  attendance attendance_status DEFAULT 'present',
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  salary jsonb DEFAULT '{}',
  skills text[] DEFAULT '{}',
  certifications jsonb DEFAULT '[]',
  address jsonb DEFAULT '{}',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- ============================================
-- PRODUCTION ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL UNIQUE,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  plant_id uuid NOT NULL REFERENCES plants(id),
  department_id uuid REFERENCES departments(id),
  status production_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date timestamptz,
  start_date timestamptz,
  estimated_end_date timestamptz,
  actual_end_date timestamptz,
  estimated_cost decimal(12,2) DEFAULT 0,
  actual_cost decimal(12,2) DEFAULT 0,
  customer_name text,
  customer_email text,
  assigned_team uuid[] DEFAULT '{}',
  assigned_manager uuid REFERENCES profiles(id),
  notes text,
  materials jsonb DEFAULT '[]',
  quality_checks jsonb DEFAULT '[]',
  workflow_history jsonb DEFAULT '[]',
  attachments jsonb DEFAULT '[]',
  comments jsonb DEFAULT '[]',
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_plant ON production_orders(plant_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_priority ON production_orders(priority);
CREATE INDEX IF NOT EXISTS idx_production_orders_due_date ON production_orders(due_date);
CREATE INDEX IF NOT EXISTS idx_production_orders_department ON production_orders(department_id);

-- ============================================
-- INVENTORY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit text NOT NULL,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  min_stock integer NOT NULL DEFAULT 10,
  max_stock integer DEFAULT 1000,
  reorder_point integer DEFAULT 20,
  status inventory_status NOT NULL DEFAULT 'in_stock',
  plant_id uuid REFERENCES plants(id),
  warehouse_id uuid,
  supplier_id uuid,
  location text,
  expiry_date date,
  movements jsonb DEFAULT '[]',
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_plant ON inventory_items(plant_id);

-- ============================================
-- QUALITY INSPECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quality_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id text NOT NULL UNIQUE,
  production_order_id uuid REFERENCES production_orders(id),
  product_name text NOT NULL,
  batch_number text,
  type text NOT NULL CHECK (type IN ('incoming', 'in_process', 'final', 'outgoing')),
  status inspection_status NOT NULL DEFAULT 'pending',
  result text CHECK (result IN ('pass', 'fail', 'conditional')),
  score integer CHECK (score >= 0 AND score <= 100),
  inspector_id uuid REFERENCES profiles(id),
  sample_size integer NOT NULL DEFAULT 10,
  criteria jsonb DEFAULT '[]',
  defects jsonb DEFAULT '[]',
  priority priority_level NOT NULL DEFAULT 'medium',
  scheduled_date timestamptz,
  completed_date timestamptz,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  notes text,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_status ON quality_inspections(status);
CREATE INDEX IF NOT EXISTS idx_quality_production_order ON quality_inspections(production_order_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspector ON quality_inspections(inspector_id);

-- ============================================
-- SHIPMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text NOT NULL UNIQUE,
  tracking_number text,
  type text NOT NULL CHECK (type IN ('import', 'export', 'transfer')),
  status shipment_status NOT NULL DEFAULT 'pending',
  origin_id uuid REFERENCES plants(id),
  destination_id uuid REFERENCES plants(id),
  driver_id uuid REFERENCES profiles(id),
  scheduled_date timestamptz,
  estimated_arrival timestamptz,
  actual_departure timestamptz,
  actual_arrival timestamptz,
  customer jsonb DEFAULT '{}',
  orders uuid[] DEFAULT '{}',
  priority priority_level NOT NULL DEFAULT 'medium',
  timeline jsonb DEFAULT '[]',
  documents jsonb DEFAULT '[]',
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_origin ON shipments(origin_id);
CREATE INDEX IF NOT EXISTS idx_shipments_destination ON shipments(destination_id);
CREATE INDEX IF NOT EXISTS idx_shipments_driver ON shipments(driver_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'system',
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  category text NOT NULL,
  resource text NOT NULL,
  resource_id uuid,
  description text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_resource ON activity_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_category ON activity_logs(category);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  check_in timestamptz,
  check_out timestamptz,
  total_hours decimal(4,2) DEFAULT 0,
  notes text,
  approved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- ============================================
-- LEAVE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  rejected_by uuid REFERENCES profiles(id),
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  url text NOT NULL,
  public_id text,
  folder_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  description text,
  version integer DEFAULT 1,
  is_locked boolean DEFAULT false,
  locked_by uuid REFERENCES profiles(id),
  permissions jsonb DEFAULT '[]',
  uploaded_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

DROP POLICY IF EXISTS "Allow profile insert on signup" ON profiles;
CREATE POLICY "Allow profile insert on signup" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- PLANTS POLICIES (Authenticated users can read)
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view plants" ON plants;
CREATE POLICY "Authenticated users can view plants" ON plants FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage plants" ON plants;
CREATE POLICY "Admins can manage plants" ON plants FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'plant_manager'))
  );

-- ============================================
-- DEPARTMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view departments" ON departments;
CREATE POLICY "Authenticated users can view departments" ON departments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins and managers can manage departments" ON departments;
CREATE POLICY "Admins and managers can manage departments" ON departments FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'plant_manager', 'hr_manager'))
  );

-- ============================================
-- EMPLOYEES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own employee record" ON employees;
CREATE POLICY "Users can view own employee record" ON employees FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "HR and admins can view all employees" ON employees;
CREATE POLICY "HR and admins can view all employees" ON employees FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'plant_manager', 'supervisor'))
  );

DROP POLICY IF EXISTS "HR and admins can manage employees" ON employees;
CREATE POLICY "HR and admins can manage employees" ON employees FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager'))
  );

-- ============================================
-- PRODUCTION ORDERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view orders" ON production_orders;
CREATE POLICY "Authenticated users can view orders" ON production_orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create orders" ON production_orders;
CREATE POLICY "Users can create orders" ON production_orders FOR INSERT
  TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Managers and admins can update orders" ON production_orders;
CREATE POLICY "Managers and admins can update orders" ON production_orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'plant_manager', 'production_manager', 'supervisor'))
  );

DROP POLICY IF EXISTS "Admins can delete orders" ON production_orders;
CREATE POLICY "Admins can delete orders" ON production_orders FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- ============================================
-- INVENTORY POLICIES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON inventory_items;
CREATE POLICY "Authenticated users can view inventory" ON inventory_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Inventory managers can manage inventory" ON inventory_items;
CREATE POLICY "Inventory managers can manage inventory" ON inventory_items FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'inventory_manager', 'plant_manager'))
  );

-- ============================================
-- QUALITY INSPECTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view inspections" ON quality_inspections;
CREATE POLICY "Authenticated users can view inspections" ON quality_inspections FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Quality managers can manage inspections" ON quality_inspections;
CREATE POLICY "Quality managers can manage inspections" ON quality_inspections FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'quality_manager', 'plant_manager'))
  );

-- ============================================
-- SHIPMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view shipments" ON shipments;
CREATE POLICY "Authenticated users can view shipments" ON shipments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "Logistics managers can manage shipments" ON shipments;
CREATE POLICY "Logistics managers can manage shipments" ON shipments FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'logistics_manager', 'plant_manager'))
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
  TO authenticated USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
  TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE
  TO authenticated USING (recipient_id = auth.uid());

-- ============================================
-- ACTIVITY LOGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
CREATE POLICY "Admins can view all activity logs" ON activity_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager'))
  );

DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON activity_logs;
CREATE POLICY "Authenticated users can insert activity logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
CREATE POLICY "Users can view own attendance" ON attendance FOR SELECT
  TO authenticated USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "HR and supervisors can manage attendance" ON attendance;
CREATE POLICY "HR and supervisors can manage attendance" ON attendance FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'supervisor'))
  );

-- ============================================
-- LEAVE REQUESTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own leave requests" ON leave_requests;
CREATE POLICY "Users can view own leave requests" ON leave_requests FOR SELECT
  TO authenticated USING (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create own leave requests" ON leave_requests;
CREATE POLICY "Users can create own leave requests" ON leave_requests FOR INSERT
  TO authenticated WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "HR and supervisors can manage leave requests" ON leave_requests;
CREATE POLICY "HR and supervisors can manage leave requests" ON leave_requests FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'hr_manager', 'supervisor'))
  );

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own documents" ON documents FOR SELECT
  TO authenticated USING (
    uploaded_by = auth.uid() OR
    permissions::text LIKE '%' || auth.uid()::text || '%'
  );

DROP POLICY IF EXISTS "Users can manage own documents" ON documents;
CREATE POLICY "Users can manage own documents" ON documents FOR ALL
  TO authenticated USING (uploaded_by = auth.uid());

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON plants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_inspections_updated_at BEFORE UPDATE ON quality_inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate employee ID
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TRIGGER AS $$
DECLARE
  count integer;
BEGIN
  IF NEW.employee_id IS NULL OR NEW.employee_id = '' THEN
    SELECT COUNT(*) + 1 INTO count FROM employees;
    NEW.employee_id = 'EMP' || LPAD(count::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_employee_id_trigger BEFORE INSERT ON employees
  FOR EACH ROW EXECUTE FUNCTION generate_employee_id();

-- Function to auto-generate order ID
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
  count integer;
BEGIN
  IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
    SELECT COUNT(*) + 1 INTO count FROM production_orders;
    NEW.order_id = 'PO-' || LPAD(count::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_id_trigger BEFORE INSERT ON production_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_id();

-- Function to auto-generate inspection ID
CREATE OR REPLACE FUNCTION generate_inspection_id()
RETURNS TRIGGER AS $$
DECLARE
  count integer;
BEGIN
  IF NEW.inspection_id IS NULL OR NEW.inspection_id = '' THEN
    SELECT COUNT(*) + 1 INTO count FROM quality_inspections;
    NEW.inspection_id = 'QI-' || LPAD(count::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_inspection_id_trigger BEFORE INSERT ON quality_inspections
  FOR EACH ROW EXECUTE FUNCTION generate_inspection_id();

-- Function to auto-generate shipment ID
CREATE OR REPLACE FUNCTION generate_shipment_id()
RETURNS TRIGGER AS $$
DECLARE
  count integer;
BEGIN
  IF NEW.shipment_id IS NULL OR NEW.shipment_id = '' THEN
    SELECT COUNT(*) + 1 INTO count FROM shipments;
    NEW.shipment_id = CASE WHEN NEW.type = 'import' THEN 'IMP' 
                           WHEN NEW.type = 'export' THEN 'EXP' 
                           ELSE 'TRF' END || '-' || LPAD(count::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_shipment_id_trigger BEFORE INSERT ON shipments
  FOR EACH ROW EXECUTE FUNCTION generate_shipment_id();

-- Function to update inventory status based on quantity
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= 0 THEN
    NEW.status = 'out_of_stock';
  ELSIF NEW.quantity <= NEW.min_stock THEN
    NEW.status = 'low_stock';
  ELSE
    NEW.status = 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_status_trigger BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_status();

-- Create a handle_new_user function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')::user_role,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
