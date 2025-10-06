-- Insert sample inventory items (only if no items exist)
INSERT INTO public.inventory_items (name, description, category, price, stock_quantity, sku)
SELECT * FROM (VALUES
  ('iPhone 15 Pro', 'Latest Apple smartphone with titanium design', 'Smartphones', 999.99, 25, 'IPH15PRO001'),
  ('Samsung Galaxy S24', 'Flagship Android smartphone with AI features', 'Smartphones', 899.99, 30, 'SGS24001'),
  ('MacBook Air M3', '13-inch laptop with M3 chip', 'Laptops', 1299.99, 15, 'MBA13M3001'),
  ('Dell XPS 13', 'Premium ultrabook with Intel processor', 'Laptops', 1199.99, 20, 'DXPS13001'),
  ('Sony WH-1000XM5', 'Wireless noise-canceling headphones', 'Audio', 399.99, 40, 'SWXM5001'),
  ('iPad Pro 12.9"', 'Professional tablet with M2 chip', 'Tablets', 1099.99, 18, 'IPADPRO129001'),
  ('Apple Watch Series 9', 'Smartwatch with health monitoring', 'Wearables', 399.99, 35, 'AWS9001'),
  ('Nintendo Switch OLED', 'Gaming console with OLED display', 'Gaming', 349.99, 22, 'NSW001'),
  ('Canon EOS R6', 'Mirrorless camera for professionals', 'Cameras', 2499.99, 8, 'CEOSR6001'),
  ('Logitech MX Master 3S', 'Wireless productivity mouse', 'Accessories', 99.99, 50, 'LMX3S001')
) AS sample_data(name, description, category, price, stock_quantity, sku)
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items LIMIT 1);
