import { useState, useEffect } from 'react'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Users, ClipboardList, MessageSquare, BarChart3, FileText, RefreshCw } from 'lucide-react'
import Dashboard from './components/Dashboard.jsx'
import Customers from './components/Customers.jsx'
import Orders from './components/Orders.jsx'
import Quotes from './components/Quotes.jsx'
import Communications from './components/Communications.jsx'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'customers', label: 'Kunden', icon: Users },
    { id: 'orders', label: 'Aufträge', icon: ClipboardList },
    { id: 'quotes', label: 'Angebote', icon: FileText },
    { id: 'communications', label: 'Kommunikation', icon: MessageSquare },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'customers':
        return <Customers />
      case 'orders':
        return <Orders />
      case 'quotes':
        return <Quotes />
      case 'communications':
        return <Communications />
      default:
        return <Dashboard />
    }
  }

  const refreshData = () => {
    // Force re-render by changing the key
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GC</span>
                  </div>
                  <h1 className="ml-3 text-xl font-semibold text-gray-900">GoClean Harz CRM</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                System Online
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-none border-r-2 transition-colors ${
                          activeTab === item.id
                            ? 'bg-green-50 text-green-700 border-green-500'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                        <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {item.id === 'dashboard' ? '1' : 
                           item.id === 'customers' ? '2' : 
                           item.id === 'orders' ? '3' : 
                           item.id === 'quotes' ? '4' : '5'}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
