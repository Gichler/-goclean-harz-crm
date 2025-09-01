import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Badge } from './ui/badge.jsx'
import { Button } from './ui/button.jsx'
import { 
  ClipboardList, 
  Receipt, 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import { customerPortalAPI } from '../utils/api.js'

const Dashboard = ({ customerId }) => {
  const [dashboardData, setDashboardData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [customerId])

  const fetchDashboardData = async () => {
    try {
      // Für Demo-Zwecke verwenden wir Demo-Daten
      const demoData = customerPortalAPI.getDemoData()
      setDashboardData(demoData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'Ausstehend', className: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Abgeschlossen', className: 'bg-green-100 text-green-800' },
      'paid': { label: 'Bezahlt', className: 'bg-green-100 text-green-800' },
      'unpaid': { label: 'Offen', className: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const { customer, orders, invoices, messages } = dashboardData

  const statsCards = [
    {
      title: 'Aktive Aufträge',
      value: orders.filter(o => o.status === 'in_progress').length,
      icon: ClipboardList,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Offene Rechnungen',
      value: invoices.filter(i => i.status === 'unpaid').length,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Anstehende Termine',
      value: orders.filter(o => o.status === 'pending').length,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Neue Nachrichten',
      value: messages.length,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Willkommen zurück!</h2>
          <p className="text-gray-600">Hier ist Ihre Übersicht für heute</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          Aktualisieren
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Hallo, {customer.first_name} {customer.last_name}!
              </h3>
              <p className="text-gray-600 mt-1">
                Willkommen im GoClean Harz Kundenportal
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Kundennummer</p>
              <p className="text-lg font-semibold text-gray-900">K-{customer.id.toString().padStart(6, '0')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aufträge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100' :
                    order.status === 'in_progress' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    {order.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                     order.status === 'in_progress' ? <Clock className="h-5 w-5 text-blue-600" /> :
                     <AlertCircle className="h-5 w-5 text-yellow-600" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{order.order_number}</h4>
                    <p className="text-sm text-gray-600">{order.service_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.price}€</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex flex-col items-center justify-center space-y-2">
              <ClipboardList className="h-6 w-6" />
              <span>Aufträge anzeigen</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center space-y-2" variant="outline">
              <Receipt className="h-6 w-6" />
              <span>Rechnungen einsehen</span>
            </Button>
            <Button className="h-16 flex flex-col items-center justify-center space-y-2" variant="outline">
              <MessageSquare className="h-6 w-6" />
              <span>Nachricht senden</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
