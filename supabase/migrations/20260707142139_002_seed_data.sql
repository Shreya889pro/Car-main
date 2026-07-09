/*
# FactoryFlow Seed Data (Simplified)

This migration populates the database with initial seed data for demonstration.
The profiles will be created automatically via the handle_new_user trigger when users sign up.

## Data Created:
1. **Plants** - 5 manufacturing plants
2. **Departments** - 15 departments across plants
3. **Production Orders** - 10 orders in various states (using plant_manager as placeholder for user refs)
4. **Inventory Items** - 10 items across categories
5. **Quality Inspections** - Sample inspections
6. **Shipments** - Sample logistics data
*/

-- Insert Plants (no manager_id required for seed)
INSERT INTO plants (id, name, code, location, capacity, status, description, address)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'North Manufacturing Plant', 'PLT-NTH', 'Chicago, IL', 1500, 'active', 'Primary manufacturing facility for automotive components',
   '{"street": "1500 Industrial Blvd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'),
  ('10000000-0000-0000-0000-000000000002', 'South Production Facility', 'PLT-STH', 'Dallas, TX', 1200, 'active', 'Electronics manufacturing hub',
   '{"street": "2200 Commerce Dr", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'),
  ('10000000-0000-0000-0000-000000000003', 'East Assembly Plant', 'PLT-EST', 'New York, NY', 800, 'active', 'Assembly and testing facility',
   '{"street": "800 Tech Park Ave", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'),
  ('10000000-0000-0000-0000-000000000004', 'West Manufacturing Hub', 'PLT-WST', 'Los Angeles, CA', 2000, 'active', 'High-volume production center',
   '{"street": "3500 Factory Lane", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "USA"}'),
  ('10000000-0000-0000-0000-000000000005', 'Central Processing Center', 'PLT-CNT', 'Denver, CO', 600, 'active', 'Specialized processing and R&D',
   '{"street": "500 Innovation Way", "city": "Denver", "state": "CO", "zip": "80202", "country": "USA"}')
ON CONFLICT (id) DO NOTHING;

-- Insert Departments
INSERT INTO departments (id, name, code, plant_id, employee_count, location, description, performance, status)
VALUES 
  ('20000000-0000-0000-0000-000000000001', 'Production', 'DEPT-001', '10000000-0000-0000-0000-000000000001', 45, 'Building A', 'Main production department', '{"efficiency": 92, "quality": 88, "safety": 95}', 'active'),
  ('20000000-0000-0000-0000-000000000002', 'Quality Control', 'DEPT-002', '10000000-0000-0000-0000-000000000001', 12, 'Building B', 'Quality assurance and testing', '{"efficiency": 95, "quality": 98, "safety": 97}', 'active'),
  ('20000000-0000-0000-0000-000000000003', 'Maintenance', 'DEPT-003', '10000000-0000-0000-0000-000000000001', 18, 'Building C', 'Equipment maintenance and repair', '{"efficiency": 88, "quality": 90, "safety": 99}', 'active'),
  ('20000000-0000-0000-0000-000000000004', 'Logistics', 'DEPT-004', '10000000-0000-0000-0000-000000000001', 22, 'Warehouse 1', 'Shipping and receiving', '{"efficiency": 85, "quality": 82, "safety": 94}', 'active'),
  ('20000000-0000-0000-0000-000000000005', 'Engineering', 'DEPT-005', '10000000-0000-0000-0000-000000000002', 28, 'Building A', 'Design and engineering', '{"efficiency": 90, "quality": 94, "safety": 96}', 'active'),
  ('20000000-0000-0000-0000-000000000006', 'Research & Development', 'DEPT-006', '10000000-0000-0000-0000-000000000002', 15, 'Building B', 'Product development', '{"efficiency": 78, "quality": 92, "safety": 98}', 'active'),
  ('20000000-0000-0000-0000-000000000007', 'Human Resources', 'DEPT-007', '10000000-0000-0000-0000-000000000001', 8, 'Main Office', 'HR management', '{"efficiency": 92, "quality": 95, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000008', 'Finance', 'DEPT-008', '10000000-0000-0000-0000-000000000001', 10, 'Main Office', 'Financial operations', '{"efficiency": 96, "quality": 99, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000009', 'IT', 'DEPT-009', '10000000-0000-0000-0000-000000000001', 6, 'Building D', 'Technology support', '{"efficiency": 94, "quality": 96, "safety": 99}', 'active'),
  ('20000000-0000-0000-0000-000000000010', 'Safety', 'DEPT-010', '10000000-0000-0000-0000-000000000001', 5, 'Building A', 'Safety compliance', '{"efficiency": 97, "quality": 98, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000011', 'Procurement', 'DEPT-011', '10000000-0000-0000-0000-000000000002', 14, 'Building C', 'Materials procurement', '{"efficiency": 91, "quality": 93, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000012', 'Sales', 'DEPT-012', '10000000-0000-0000-0000-000000000003', 20, 'Building A', 'Sales and accounts', '{"efficiency": 88, "quality": 85, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000013', 'Marketing', 'DEPT-013', '10000000-0000-0000-0000-000000000003', 12, 'Building B', 'Marketing and branding', '{"efficiency": 86, "quality": 90, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000014', 'Customer Service', 'DEPT-014', '10000000-0000-0000-0000-000000000004', 16, 'Building D', 'Customer support', '{"efficiency": 89, "quality": 92, "safety": 100}', 'active'),
  ('20000000-0000-0000-0000-000000000015', 'Operations', 'DEPT-015', '10000000-0000-0000-0000-000000000005', 35, 'Building A', 'General operations', '{"efficiency": 90, "quality": 88, "safety": 96}', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Production Orders (without user refs - they will be set when users sign up)
INSERT INTO production_orders (id, order_id, product_name, product_sku, quantity, unit, plant_id, department_id, status, priority, progress, due_date, estimated_cost, customer_name, customer_email, notes)
VALUES 
  ('30000000-0000-0000-0000-000000000001', 'PO-000001', 'Industrial Motor X500', 'SKU-001', 150, 'units', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'completed', 'high', 100, NOW() + INTERVAL '5 days', 45000.00, 'TechCorp Industries', 'orders@techcorp.com', 'High priority order for automotive client'),
  ('30000000-0000-0000-0000-000000000002', 'PO-000002', 'Control Panel CP-2000', 'SKU-002', 200, 'units', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'in_progress', 'medium', 65, NOW() + INTERVAL '12 days', 32000.00, 'Global Automation', 'procurement@globalauto.com', 'Standard production run'),
  ('30000000-0000-0000-0000-000000000003', 'PO-000003', 'Hydraulic Pump HP-350', 'SKU-003', 75, 'units', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'pending', 'low', 0, NOW() + INTERVAL '21 days', 18750.00, 'FluidPower Systems', 'orders@fluidpower.com', 'New product line'),
  ('30000000-0000-0000-0000-000000000004', 'PO-000004', 'Gear Assembly GA-100', 'SKU-004', 300, 'sets', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'quality_check', 'high', 95, NOW() + INTERVAL '3 days', 28000.00, 'Machinery Inc', 'purchasing@machinery.com', 'Rush order - final QC'),
  ('30000000-0000-0000-0000-000000000005', 'PO-000005', 'Electric Transformer ET-75', 'SKU-005', 50, 'units', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'planning', 'critical', 10, NOW() + INTERVAL '15 days', 55000.00, 'PowerGrid Solutions', 'orders@powergrid.com', 'Specialized transformer build'),
  ('30000000-0000-0000-0000-000000000006', 'PO-000006', 'Pressure Valve PV-40', 'SKU-006', 500, 'units', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'scheduled', 'medium', 25, NOW() + INTERVAL '28 days', 12500.00, 'FlowTech', 'orders@flowtech.com', 'Bulk order'),
  ('30000000-0000-0000-0000-000000000007', 'PO-000007', 'Cooling Fan CF-20', 'SKU-007', 400, 'units', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'in_progress', 'low', 45, NOW() + INTERVAL '25 days', 8000.00, 'CoolSys', 'buying@coolsys.com', 'Standard cooling units'),
  ('30000000-0000-0000-0000-000000000008', 'PO-000008', 'Bearing Set BS-500', 'SKU-008', 250, 'sets', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 'pending', 'medium', 0, NOW() + INTERVAL '35 days', 15000.00, 'MotionParts Ltd', 'orders@motionparts.com', 'Precision bearings'),
  ('30000000-0000-0000-0000-000000000009', 'PO-000009', 'Conveyor Belt CB-150', 'SKU-009', 10, 'units', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'on_hold', 'high', 30, NOW() + INTERVAL '50 days', 75000.00, 'ConveyorPro', 'quotes@conveyorpro.com', 'Large belt system - on hold for materials'),
  ('30000000-0000-0000-0000-000000000010', 'PO-000010', 'Sensor Module SM-300', 'SKU-010', 100, 'units', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006', 'completed', 'medium', 100, NOW() - INTERVAL '2 days', 22000.00, 'Sensors International', 'orders@sensorsint.com', 'Electronics module completed')
ON CONFLICT (id) DO NOTHING;

-- Insert Inventory Items
INSERT INTO inventory_items (id, sku, name, description, category, quantity, unit, unit_price, min_stock, max_stock, reorder_point, status, plant_id, location)
VALUES 
  ('40000000-0000-0000-0000-000000000001', 'MAT-001', 'Steel Sheets 4x8', 'Cold rolled steel sheets', 'Raw Materials', 500, 'sheets', 45.00, 100, 1000, 200, 'in_stock', '10000000-0000-0000-0000-000000000001', 'Warehouse A-1'),
  ('40000000-0000-0000-0000-000000000002', 'MAT-002', 'Aluminum Rods', '6061-T6 aluminum rods', 'Raw Materials', 300, 'units', 28.00, 50, 600, 100, 'in_stock', '10000000-0000-0000-0000-000000000001', 'Warehouse A-2'),
  ('40000000-0000-0000-0000-000000000003', 'MAT-003', 'Copper Wire Spool', '14 AWG copper wire', 'Raw Materials', 45, 'spools', 125.00, 50, 200, 75, 'low_stock', '10000000-0000-0000-0000-000000000001', 'Warehouse B-1'),
  ('40000000-0000-0000-0000-000000000004', 'MAT-004', 'Plastic Pellets', 'ABS plastic pellets 50lb bags', 'Raw Materials', 200, 'bags', 35.00, 40, 500, 80, 'in_stock', '10000000-0000-0000-0000-000000000002', 'Warehouse C-1'),
  ('40000000-0000-0000-0000-000000000005', 'COMP-001', 'Motor Assembly Kit', 'Complete motor assembly components', 'Components', 80, 'kits', 450.00, 20, 150, 40, 'in_stock', '10000000-0000-0000-0000-000000000001', 'Warehouse A-3'),
  ('40000000-0000-0000-0000-000000000006', 'COMP-002', 'Circuit Board PCB-101', 'Main control PCB', 'Components', 150, 'units', 85.00, 30, 300, 60, 'in_stock', '10000000-0000-0000-0000-000000000002', 'Warehouse B-2'),
  ('40000000-0000-0000-0000-000000000007', 'COMP-003', 'Bearing 6205-2RS', 'Double sealed ball bearing', 'Components', 20, 'units', 15.00, 100, 1000, 200, 'out_of_stock', '10000000-0000-0000-0000-000000000001', 'Warehouse A-4'),
  ('40000000-0000-0000-0000-000000000008', 'COMP-004', 'Hydraulic Cylinder', 'Double acting cylinder 4in', 'Components', 35, 'units', 320.00, 10, 100, 25, 'in_stock', '10000000-0000-0000-0000-000000000002', 'Warehouse C-2'),
  ('40000000-0000-0000-0000-000000000009', 'TOOL-001', 'Drill Bit Set HSS', 'HSS drill bit set 1/16-1/2', 'Tools', 25, 'sets', 65.00, 10, 50, 20, 'in_stock', '10000000-0000-0000-0000-000000000001', 'Tool Crib'),
  ('40000000-0000-0000-0000-000000000010', 'SAFE-001', 'Safety Glasses Clear', 'ANSI Z87.1 rated', 'Safety Equipment', 120, 'pairs', 8.00, 50, 500, 100, 'in_stock', '10000000-0000-0000-0000-000000000001', 'Safety Storage')
ON CONFLICT (id) DO NOTHING;

-- Insert Quality Inspections
INSERT INTO quality_inspections (id, inspection_id, production_order_id, product_name, batch_number, type, status, result, score, sample_size, priority, scheduled_date, created_at)
VALUES 
  ('50000000-0000-0000-0000-000000000001', 'QI-000001', '30000000-0000-0000-0000-000000000001', 'Industrial Motor X500', 'BATCH-2024-001', 'final', 'passed', 'pass', 96, 15, 'high', NOW() - INTERVAL '6 days', NOW() - INTERVAL '8 days'),
  ('50000000-0000-0000-0000-000000000002', 'QI-000002', '30000000-0000-0000-0000-000000000002', 'Control Panel CP-2000', 'BATCH-2024-002', 'in_process', 'in_progress', NULL, NULL, 20, 'medium', NOW() + INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('50000000-0000-0000-0000-000000000003', 'QI-000003', '30000000-0000-0000-0000-000000000004', 'Gear Assembly GA-100', 'BATCH-2024-003', 'final', 'pending', NULL, NULL, 25, 'high', NOW(), NOW() - INTERVAL '1 day'),
  ('50000000-0000-0000-0000-000000000004', 'QI-000004', '30000000-0000-0000-0000-000000000005', 'Electric Transformer ET-75', 'BATCH-2024-004', 'incoming', 'pending', NULL, NULL, 10, 'critical', NOW() + INTERVAL '3 days', NOW()),
  ('50000000-0000-0000-0000-000000000005', 'QI-000005', '30000000-0000-0000-0000-000000000010', 'Sensor Module SM-300', 'BATCH-2024-005', 'final', 'passed', 'pass', 92, 12, 'medium', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Shipments
INSERT INTO shipments (id, shipment_id, tracking_number, type, status, origin_id, destination_id, scheduled_date, priority, customer)
VALUES 
  ('60000000-0000-0000-0000-000000000001', 'EXP-000001', 'TRK884729103', 'export', 'delivered', '10000000-0000-0000-0000-000000000001', NULL, NOW() - INTERVAL '3 days', 'high', '{"name": "TechCorp Industries", "email": "orders@techcorp.com", "phone": "+1-555-123-4567"}'),
  ('60000000-0000-0000-0000-000000000002', 'IMP-000001', 'TRK992847562', 'import', 'in_transit', NULL, '10000000-0000-0000-0000-000000000001', NOW() + INTERVAL '2 days', 'medium', '{"name": "Steel Supplier Co", "email": "shipping@steelsupplier.com", "phone": "+1-555-987-6543"}'),
  ('60000000-0000-0000-0000-000000000003', 'TRF-000001', 'TRK557382914', 'transfer', 'pending', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', NOW() + INTERVAL '5 days', 'low', '{"name": "Internal Transfer", "notes": "Equipment relocation"}'),
  ('60000000-0000-0000-0000-000000000004', 'EXP-000002', 'TRK663840155', 'export', 'in_transit', '10000000-0000-0000-0000-000000000002', NULL, NOW() - INTERVAL '1 day', 'medium', '{"name": "Global Automation", "email": "receiving@globalauto.com", "phone": "+1-555-456-7890"}')
ON CONFLICT (id) DO NOTHING;

-- Create a helper function to update department employee count
CREATE OR REPLACE FUNCTION update_department_employee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE departments SET employee_count = employee_count + 1 WHERE id = NEW.department_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE departments SET employee_count = employee_count - 1 WHERE id = OLD.department_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.department_id IS DISTINCT FROM OLD.department_id THEN
    UPDATE departments SET employee_count = GREATEST(employee_count - 1, 0) WHERE id = OLD.department_id;
    UPDATE departments SET employee_count = employee_count + 1 WHERE id = NEW.department_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_dept_count ON employees;
CREATE TRIGGER update_dept_count AFTER INSERT OR DELETE OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_department_employee_count();
