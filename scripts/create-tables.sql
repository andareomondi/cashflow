-- Create tables for the cashbook and inventory system
-- Note: We'll use Supabase's existing auth.users table for user management

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    category VARCHAR(100),
    barcode VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES auth.users(id), -- Reference to Supabase auth user
    total_amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) CHECK (payment_type IN ('cash', 'credit', 'mpesa', 'bank')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partial')),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) DEFAULT 0,
    receipt_number VARCHAR(50),
    kra_pin VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items table (for detailed breakdown)
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (for tracking partial payments)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES sales(id),
    customer_id UUID REFERENCES customers(id),
    user_id UUID REFERENCES auth.users(id), -- Reference to Supabase auth user
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(current_balance);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(product_id UUID, quantity_sold INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET stock_quantity = stock_quantity - quantity_sold,
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update customer balance
CREATE OR REPLACE FUNCTION update_customer_balance(customer_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE customers 
    SET current_balance = current_balance + amount,
        updated_at = NOW()
    WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - can be refined based on roles)
-- Products: All authenticated users can read, only managers+ can modify
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Managers can modify products" ON products FOR ALL USING (
    auth.jwt() ->> 'role' IN ('owner', 'manager') OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('owner', 'manager')
);

-- Sales: Users can view all, create their own
CREATE POLICY "Anyone can view sales" ON sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create sales" ON sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Managers can modify sales" ON sales FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('owner', 'manager') OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('owner', 'manager')
);

-- Similar policies for other tables
CREATE POLICY "Anyone can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can modify customers" ON customers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view sale_items" ON sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can create sale_items" ON sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view payments" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
