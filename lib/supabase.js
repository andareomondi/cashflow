import { createClient } from "@supabase/supabase-js"

// Create a singleton instance of the Supabase client
let supabaseInstance = null

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if environment variables are properly set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or anon key not found. Using dummy client.")
    // Return a dummy client that won't make actual API calls
    return {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
      }),
      auth: {
        getUser: () => ({ data: { user: null }, error: null }),
        updateUser: () => ({ data: null, error: null }),
      },
      rpc: () => ({ data: null, error: null }),
    }
  }

  // Create the real client if environment variables are available
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export the supabase client for backward compatibility
export const supabase = getSupabaseClient()

// Database helper functions
export const dbHelpers = {
  // Auth helpers
  async getCurrentUser() {
    const client = getSupabaseClient()
    const {
      data: { user },
      error,
    } = await client.auth.getUser()
    if (error) throw error
    return user
  },

  async getUserRole(userId) {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.getUser()
    if (error) throw error

    // Get role from raw_user_meta_data
    const role = data.user?.user_metadata?.role || "employee"
    return role
  },

  async updateUserRole(userId, role) {
    const client = getSupabaseClient()
    const { data, error } = await client.auth.updateUser({
      data: { role: role },
    })
    if (error) throw error
    return data
  },

  // Products
  async getProducts() {
    const client = getSupabaseClient()
    const { data, error } = await client.from("products").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async addProduct(product) {
    const client = getSupabaseClient()
    const { data, error } = await client.from("products").insert([product]).select()

    if (error) throw error
    return data?.[0] || null
  },

  async updateProduct(id, updates) {
    const client = getSupabaseClient()
    const { data, error } = await client.from("products").update(updates).eq("id", id).select()

    if (error) throw error
    return data?.[0] || null
  },

  async updateProductStock(productId, quantitySold) {
    const client = getSupabaseClient()
    const { data, error } = await client.rpc("update_product_stock", {
      product_id: productId,
      quantity_sold: quantitySold,
    })

    if (error) throw error
    return data
  },

  // Sales
  async getSales(filters = {}) {
    const client = getSupabaseClient()
    let query = client
      .from("sales")
      .select(`
        *,
        customer:customers(name, phone),
        sale_items:sale_items(
          *,
          product:products(name, price)
        )
      `)
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate)
    }
    if (filters.status) {
      query = query.eq("status", filters.status)
    }
    if (filters.paymentType) {
      query = query.eq("payment_type", filters.paymentType)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async addSale(sale, saleItems) {
    const client = getSupabaseClient()
    // Start a transaction
    const { data: saleData, error: saleError } = await client.from("sales").insert([sale]).select()

    if (saleError) throw saleError

    const saleId = saleData[0].id

    // Add sale items
    const itemsWithSaleId = saleItems.map((item) => ({
      ...item,
      sale_id: saleId,
    }))

    const { data: itemsData, error: itemsError } = await client.from("sale_items").insert(itemsWithSaleId)

    if (itemsError) throw itemsError

    // Update product stock levels
    for (const item of saleItems) {
      await this.updateProductStock(item.product_id, item.quantity)
    }

    return { sale: saleData[0], items: itemsData }
  },

  // Customers
  async getCustomers() {
    const client = getSupabaseClient()
    const { data, error } = await client.from("customers").select("*").order("name")

    if (error) throw error
    return data || []
  },

  async addCustomer(customer) {
    const client = getSupabaseClient()
    const { data, error } = await client.from("customers").insert([customer]).select()

    if (error) throw error
    return data?.[0] || null
  },

  async updateCustomerBalance(customerId, amount) {
    const client = getSupabaseClient()
    const { data, error } = await client.rpc("update_customer_balance", {
      customer_id: customerId,
      amount: amount,
    })

    if (error) throw error
    return data
  },

  // Reports
  async generateSalesReport(startDate, endDate, filters = {}) {
    const client = getSupabaseClient()
    let query = client
      .from("sales")
      .select(`
        *,
        customer:customers(name, phone),
        sale_items:sale_items(
          quantity,
          unit_price,
          total,
          product:products(name, category)
        )
      `)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false })

    // Apply additional filters
    if (filters.paymentType) {
      query = query.eq("payment_type", filters.paymentType)
    }
    if (filters.paymentStatus) {
      query = query.eq("payment_status", filters.paymentStatus)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async generateInventoryReport() {
    const client = getSupabaseClient()
    const { data, error } = await client.from("products").select("*").order("stock_quantity", { ascending: true })

    if (error) throw error
    return data || []
  },

  async generateCustomerBalanceReport() {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from("customers")
      .select("*")
      .gt("current_balance", 0)
      .order("current_balance", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Export helpers
  async exportToCSV(data, filename) {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Handle nested objects and escape commas
            if (typeof value === "object" && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`
            }
            return `"${String(value || "").replace(/"/g, '""')}"`
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
