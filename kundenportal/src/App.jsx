import { useState } from 'react'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Badge } from './components/ui/badge.jsx'
import { 
  Home, 
  ClipboardList, 
  Receipt, 
  User, 
  MessageSquare, 
  Calendar as CalendarIcon,
  RefreshCw,
  LogOut
} from 'lucide-react'
import Dashboard from './components/Dashboard.jsx'
import Orders from './components/Orders.jsx'
import Invoices from './components/Invoices.jsx'
import Profile from './components/Profile.jsx'
import Messages from './components/Messages.jsx'
import Calendar from './components/Calendar.jsx'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [customerId] = useState(1) // Demo-Kunden-ID

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Meine Aufträge', icon: ClipboardList },
    { id: 'invoices', label: 'Meine Rechnungen', icon: Receipt },
    { id: 'calendar', label: 'Termine', icon: CalendarIcon },
    { id: 'messages', label: 'Nachrichten', icon: MessageSquare },
    { id: 'profile', label: 'Profil', icon: User },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard customerId={customerId} />
      case 'orders':
        return <Orders customerId={customerId} />
      case 'invoices':
        return <Invoices customerId={customerId} />
      case 'calendar':
        return <Calendar customerId={customerId} />
      case 'messages':
        return <Messages customerId={customerId} />
      case 'profile':
        return <Profile customerId={customerId} />
      default:
        return <Dashboard customerId={customerId} />
    }
  }

  const refreshData = () => {
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
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GC</span>
                  </div>
                  <h1 className="ml-3 text-xl font-semibold text-gray-900">GoClean Harz - Kundenportal</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Kundenportal
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
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
                            ? 'bg-blue-50 text-blue-700 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
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
