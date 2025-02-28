-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  availability JSONB DEFAULT '{"days": [], "preferredHours": "Matin"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  shift_type TEXT CHECK (shift_type IN ('morning', 'evening', 'night')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create absences table
CREATE TABLE absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Allow public access to employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow public access to shifts" ON shifts FOR ALL USING (true);
CREATE POLICY "Allow public access to absences" ON absences FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE absences;

-- Insert sample data
INSERT INTO employees (name, phone, position, availability) VALUES
('John Smith', '06 12 34 56 78', 'Chef', '{"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "preferredHours": "Matin"}'::jsonb),
('Sarah Johnson', '06 23 45 67 89', 'Serveuse', '{"days": ["Monday", "Wednesday", "Friday", "Saturday"], "preferredHours": "Soir"}'::jsonb),
('Mike Williams', '06 34 56 78 90', 'Barman', '{"days": ["Thursday", "Friday", "Saturday", "Sunday"], "preferredHours": "Soir"}'::jsonb),
('Lisa Brown', '06 45 67 89 01', 'Serveuse', '{"days": ["Tuesday", "Thursday", "Saturday", "Sunday"], "preferredHours": "Matin"}'::jsonb),
('David Miller', '06 56 78 90 12', 'Cuisinier', '{"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "preferredHours": "Matin"}'::jsonb);

-- Insert sample shifts for the current week
DO $$
DECLARE
  monday DATE := date_trunc('week', current_date)::date;
  emp_id UUID;
BEGIN
  -- Get John Smith's ID
  SELECT id INTO emp_id FROM employees WHERE name = 'John Smith';
  INSERT INTO shifts (employee_id, day, start_time, end_time, shift_type) VALUES
  (emp_id, monday, '11:00', '17:00', 'morning'),
  (emp_id, monday + 3, '11:00', '17:00', 'morning');
  
  -- Get Sarah Johnson's ID
  SELECT id INTO emp_id FROM employees WHERE name = 'Sarah Johnson';
  INSERT INTO shifts (employee_id, day, start_time, end_time, shift_type) VALUES
  (emp_id, monday, '17:00', '00:00', 'evening'),
  (emp_id, monday + 5, '17:00', '00:00', 'evening');
  
  -- Get Mike Williams's ID
  SELECT id INTO emp_id FROM employees WHERE name = 'Mike Williams';
  INSERT INTO shifts (employee_id, day, start_time, end_time, shift_type) VALUES
  (emp_id, monday + 1, '11:00', '17:00', 'morning'),
  (emp_id, monday + 3, '17:00', '00:00', 'evening');
  
  -- Get Lisa Brown's ID
  SELECT id INTO emp_id FROM employees WHERE name = 'Lisa Brown';
  INSERT INTO shifts (employee_id, day, start_time, end_time, shift_type) VALUES
  (emp_id, monday + 4, '00:00', '07:00', 'night'),
  (emp_id, monday + 3, '17:00', '00:00', 'evening');
  
  -- Get David Miller's ID
  SELECT id INTO emp_id FROM employees WHERE name = 'David Miller';
  INSERT INTO shifts (employee_id, day, start_time, end_time, shift_type) VALUES
  (emp_id, monday + 2, '17:00', '00:00', 'evening'),
  (emp_id, monday + 5, '11:00', '17:00', 'morning');
END $$;
