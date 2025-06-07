"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dbHelpers } from "@/lib/supabase"
import { DollarSign, Package, Users, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingPayments: 0,
    lowStockItems: 0,
    totalCustomers: 0,
  })
  const [recentSales, setRecentSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load recent sales
      const sales = await dbHelpers.getSales()
      setRecentSales(sales.slice(0, 5))

      // Calculate stats
      const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      const pendingPayments = sales
        .filter((sale) => sale.payment_status === "pending")
        .reduce((sum, sale) => sum + (sale.total_amount || 0), 0)

      const customers = await dbHelpers.getCustomers()
      const products = await dbHelpers.getProducts()
      const lowStockItems = products.filter((product) => (product.stock_quantity || 0) < 10).length

      setStats({
        totalSales,
        pendingPayments,
        lowStockItems,
        totalCustomers: customers.length,
      })
    } catch (err) {
      console.error("Error loading dashboard data:", err)
      setError("Failed to load dashboard data. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Dashboard</h1>
          <p className="text-gray-600">Real-time view of your business performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {stats.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available funds in your business</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">KSh {stats.pendingPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding credit collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active customer base</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions in your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{sale.customer?.name || "Walk-in Customer"}</span>
                        <Badge variant={sale.payment_type === "cash" ? "default" : "secondary"}>
                          {sale.payment_type}
                        </Badge>
                        <Badge
                          variant={
                            sale.payment_status === "paid"
                              ? "default"
                              : sale.payment_status === "pending"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {sale.payment_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(sale.created_at).toLocaleDateString()} at{" "}
                        {new Date(sale.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">KSh {(sale.total_amount || 0).toLocaleString()}</div>
                      {sale.payment_status === "pending" && (
                        <Button size="sm" variant="outline" className="mt-1">
                          Collect Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
