-- Insert sample data for testing

-- Sample products
INSERT INTO products (name, description, price, cost_price, stock_quantity, category) VALUES
('Coca Cola 500ml', 'Refreshing soft drink', 50.00, 35.00, 100, 'Beverages'),
('White Bread', 'Fresh baked bread loaf', 55.00, 40.00, 50, 'Bakery'),
('Milk 1L', 'Fresh dairy milk', 65.00, 50.00, 30, 'Dairy'),
('Rice 2kg', 'Premium basmati rice', 180.00, 150.00, 25, 'Grains'),
('Cooking Oil 1L', 'Sunflower cooking oil', 220.00, 180.00, 20, 'Cooking'),
('Sugar 1kg', 'White granulated sugar', 120.00, 100.00, 40, 'Cooking'),
('Tea Leaves 250g', 'Premium black tea', 85.00, 65.00, 60, 'Beverages'),
('Soap Bar', 'Antibacterial soap', 45.00, 30.00, 80, 'Personal Care'),
('Toothpaste', 'Fluoride toothpaste', 95.00, 70.00, 35, 'Personal Care'),
('Biscuits Pack', 'Chocolate chip cookies', 75.00, 55.00, 45, 'Snacks');

-- Sample customers
INSERT INTO customers (name, phone, email, credit_limit) VALUES
('John Kamau', '+254712345678', 'john.kamau@email.com', 5000.00),
('Mary Wanjiku', '+254723456789', 'mary.wanjiku@email.com', 3000.00),
('Peter Ochieng', '+254734567890', 'peter.ochieng@email.com', 2000.00),
('Grace Akinyi', '+254745678901', 'grace.akinyi@email.com', 4000.00),
('David Mwangi', '+254756789012', 'david.mwangi@email.com', 2500.00);

-- Sample users
INSERT INTO users (email, name, role) VALUES
('owner@business.com', 'Business Owner', 'owner'),
('manager@business.com', 'Shop Manager', 'manager'),
('cashier@business.com', 'Cashier', 'employee'),
('accountant@business.com', 'Accountant', 'accountant');

-- Sample sales (you can add these after the app is running)
-- These would typically be created through the application interface
