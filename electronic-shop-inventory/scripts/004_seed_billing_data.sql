-- Seed sample billing data for testing

-- Insert sample customers (linking to existing profiles)
INSERT INTO customers (profile_id, company_name, billing_address, city, state, zip_code, phone) VALUES
  (
    (SELECT id FROM profiles WHERE email = 'admin@electroshop.com' LIMIT 1),
    'ElectroShop Admin',
    '123 Admin Street',
    'New York',
    'NY',
    '10001',
    '(555) 123-4567'
  ),
  (
    (SELECT id FROM profiles WHERE email LIKE '%@example.com' LIMIT 1),
    'Tech Solutions Inc',
    '456 Business Ave',
    'Los Angeles',
    'CA',
    '90210',
    '(555) 987-6543'
  );

-- Insert sample invoices
INSERT INTO invoices (invoice_number, customer_id, created_by, status, issue_date, due_date, terms, notes) VALUES
  (
    'INV-0001',
    (SELECT id FROM customers LIMIT 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'sent',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'Net 30',
    'Thank you for your business!'
  ),
  (
    'INV-0002',
    (SELECT id FROM customers LIMIT 1 OFFSET 1),
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    'draft',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'Net 30',
    'Draft invoice for review'
  );

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, inventory_item_id, description, quantity, unit_price, line_total) VALUES
  (
    (SELECT id FROM invoices WHERE invoice_number = 'INV-0001'),
    (SELECT id FROM inventory_items WHERE name LIKE '%iPhone%' LIMIT 1),
    'iPhone 15 Pro - Space Black',
    2,
    999.99,
    1999.98
  ),
  (
    (SELECT id FROM invoices WHERE invoice_number = 'INV-0001'),
    (SELECT id FROM inventory_items WHERE name LIKE '%MacBook%' LIMIT 1),
    'MacBook Pro 16" - M3 Max',
    1,
    2499.99,
    2499.99
  ),
  (
    (SELECT id FROM invoices WHERE invoice_number = 'INV-0002'),
    (SELECT id FROM inventory_items WHERE name LIKE '%iPad%' LIMIT 1),
    'iPad Pro 12.9" - Wi-Fi',
    3,
    1099.99,
    3299.97
  );

-- Insert sample payment
INSERT INTO payments (invoice_id, amount, payment_date, payment_method, reference_number, notes, created_by) VALUES
  (
    (SELECT id FROM invoices WHERE invoice_number = 'INV-0001'),
    2000.00,
    CURRENT_DATE - INTERVAL '2 days',
    'bank_transfer',
    'TXN-789123',
    'Partial payment received',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
  );
