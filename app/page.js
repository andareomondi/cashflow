import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, CreditCard, Users, FileText, BarChart3, Shield } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Package,
      title: "Products & Inventory",
      description: "Add/edit products, prices, and auto-update stock levels",
      href: "/inventory",
    },
    {
      icon: CreditCard,
      title: "Sales & Transactions",
      description: "Record cash/credit sales with payment tracking",
      href: "/sales",
    },
    {
      icon: Users,
      title: "Customer Credit Tracking",
      description: "Monitor client balances and payment history",
      href: "/customers",
    },
    {
      icon: FileText,
      title: "Legal Compliance",
      description: "Generate KRA-compliant receipts and eTIMS sync",
      href: "/compliance",
    },
    {
      icon: BarChart3,
      title: "Cash Flow Dashboard",
      description: "Real-time view of funds and pending collections",
      href: "/dashboard",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure multi-user access with permissions",
      href: "/users",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CashBook Pro</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Web-Based Cashbook & Inventory Manager</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A smarter way to track sales, inventory, and compliance—all in one place. Replace manual cashbooks with
            digital, error-proof records.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register">Login To account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h3>
            <p className="text-lg text-gray-600">Everything you need to manage your business efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={feature.href}>
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      <feature.icon className="h-8 w-8 text-blue-600 mr-3" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why This Beats Manual Methods</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Saves Time</h4>
              <p className="text-gray-600">No more manual calculations or stock takes</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Reduces Errors</h4>
              <p className="text-gray-600">Automated tracking means fewer mistakes</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Peace of Mind</h4>
              <p className="text-gray-600">Tax compliance built right in</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Grow Smarter</h4>
              <p className="text-gray-600">Clear data to make better decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 mr-2" />
                <span className="font-bold text-lg">CashBook Pro</span>
              </div>
              <p className="text-gray-400">
                Streamline your business operations with our comprehensive cashbook and inventory solution.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Inventory Management</li>
                <li>Sales Tracking</li>
                <li>Customer Credits</li>
                <li>KRA Compliance</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Training</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CashBook Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
