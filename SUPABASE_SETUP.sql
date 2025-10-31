-- ============================================
-- PANELA - Supabase Database Setup
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- ============================================
-- 1. CREAR TABLAS
-- ============================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inventario
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can create categories" ON categories;
CREATE POLICY "Authenticated can create categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para products
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can create products" ON products;
CREATE POLICY "Authenticated can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update products" ON products;
CREATE POLICY "Authenticated can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can delete products" ON products;
CREATE POLICY "Authenticated can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para inventory
DROP POLICY IF EXISTS "Anyone can view inventory" ON inventory;
CREATE POLICY "Anyone can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can manage inventory" ON inventory;
CREATE POLICY "Authenticated can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- 4. FUNCIONES SQL
-- ============================================

-- Función para obtener productos con bajo stock
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  price DECIMAL,
  quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    i.quantity
  FROM products p
  JOIN inventory i ON p.id = i.product_id
  WHERE i.quantity <= threshold
  ORDER BY i.quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular valor total del inventario
CREATE OR REPLACE FUNCTION calculate_inventory_value()
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(p.price * i.quantity), 0)
  FROM products p
  JOIN inventory i ON p.id = i.product_id;
$$ LANGUAGE sql;

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a inventory
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger a profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. DATOS DE SEED
-- ============================================

-- Categorías
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Computers', 'Laptops, desktops, and components'),
  ('Peripherals', 'Keyboards, mice, and monitors'),
  ('Storage', 'Hard drives, SSDs, and memory cards'),
  ('Networking', 'Routers, switches, and cables')
ON CONFLICT DO NOTHING;

-- Productos
DO $$
DECLARE
  cat_electronics UUID;
  cat_computers UUID;
  cat_peripherals UUID;
  cat_storage UUID;
  cat_networking UUID;
  prod_laptop UUID;
  prod_mouse UUID;
  prod_hub UUID;
  prod_keyboard UUID;
  prod_monitor UUID;
BEGIN
  -- Obtener IDs de categorías
  SELECT id INTO cat_electronics FROM categories WHERE name = 'Electronics' LIMIT 1;
  SELECT id INTO cat_computers FROM categories WHERE name = 'Computers' LIMIT 1;
  SELECT id INTO cat_peripherals FROM categories WHERE name = 'Peripherals' LIMIT 1;
  SELECT id INTO cat_storage FROM categories WHERE name = 'Storage' LIMIT 1;
  SELECT id INTO cat_networking FROM categories WHERE name = 'Networking' LIMIT 1;

  -- Insertar productos
  INSERT INTO products (name, sku, description, price, category_id) VALUES
    ('Laptop Dell XPS 15', 'LAP-DELL-001', 'High performance laptop with 16GB RAM', 1299.99, cat_computers),
    ('Wireless Mouse Logitech MX', 'MOUSE-LOG-001', 'Ergonomic wireless mouse', 79.99, cat_peripherals),
    ('USB-C Hub 7-in-1', 'HUB-USBC-001', '7-in-1 USB-C Hub with HDMI and Ethernet', 49.99, cat_electronics),
    ('Mechanical Keyboard RGB', 'KEY-MECH-001', 'RGB mechanical keyboard with blue switches', 129.99, cat_peripherals),
    ('Monitor 27" 4K', 'MON-4K-001', '27 inch 4K UHD monitor', 399.99, cat_peripherals),
    ('SSD Samsung 1TB', 'SSD-SAM-001', '1TB NVMe SSD', 149.99, cat_storage),
    ('Router WiFi 6', 'ROUTE-WIFI-001', 'WiFi 6 router with mesh support', 199.99, cat_networking),
    ('Webcam HD 1080p', 'CAM-HD-001', 'Full HD 1080p webcam', 69.99, cat_electronics)
  ON CONFLICT (sku) DO NOTHING
  RETURNING id INTO prod_laptop;

  -- Insertar inventario
  INSERT INTO inventory (product_id, quantity, low_stock_threshold)
  SELECT id, 
    CASE 
      WHEN sku LIKE 'LAP%' THEN 25
      WHEN sku LIKE 'MOUSE%' THEN 150
      WHEN sku LIKE 'HUB%' THEN 5
      WHEN sku LIKE 'KEY%' THEN 80
      WHEN sku LIKE 'MON%' THEN 40
      WHEN sku LIKE 'SSD%' THEN 100
      WHEN sku LIKE 'ROUTE%' THEN 30
      ELSE 50
    END,
    CASE
      WHEN sku LIKE 'LAP%' THEN 5
      WHEN sku LIKE 'HUB%' THEN 10
      ELSE 20
    END
  FROM products
  ON CONFLICT (product_id) DO NOTHING;
END $$;

-- ============================================
-- 7. VERIFICAR SETUP
-- ============================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE 'Setup completado exitosamente!';
  RAISE NOTICE 'Categorías: %', (SELECT COUNT(*) FROM categories);
  RAISE NOTICE 'Productos: %', (SELECT COUNT(*) FROM products);
  RAISE NOTICE 'Inventario: %', (SELECT COUNT(*) FROM inventory);
  RAISE NOTICE 'Valor total del inventario: $%', (SELECT calculate_inventory_value());
END $$;

