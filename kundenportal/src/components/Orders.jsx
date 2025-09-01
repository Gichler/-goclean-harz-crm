import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Badge } from './ui/badge.jsx'
import { Button } from './ui/button.jsx'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MapPin,
  Euro
} from 'lucide-react'
import { customerPortalAPI } from '../utils/api.js'

const Orders = ({ customerId }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [customerId])

  const fetchOrders = async () => {
    try {
      // Für Demo-Zwecke verwenden wir Demo-Daten
      const demoData = customerPortalAPI.getDemoData()
      setOrders(demoData.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'Ausstehend', className: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Abgeschlossen', className: 'bg-green-100 text-green-800' }
    }
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getServiceIcon = (serviceType) => {
    const icons = {
      'reinigung': <ClipboardList className="h-5 w-5" />,
      'gartenpflege': <Calendar className="h-5 w-5" />,
      'winterdienst': <AlertCircle className="h-5 w-5" />
    }
    return icons[serviceType] || <ClipboardList className="h-5 w-5" />
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Meine Aufträge</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meine Aufträge</h2>
          <p className="text-gray-600">Übersicht über alle Ihre Aufträge</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          Aktualisieren
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Alle ({orders.length})
            </Button>
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Ausstehend ({orders.filter(o => o.status === 'pending').length})
            </Button>
            <Button 
              variant={filter === 'in_progress' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('in_progress')}
            >
              In Bearbeitung ({orders.filter(o => o.status === 'in_progress').length})
            </Button>
            <Button 
              variant={filter === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Abgeschlossen ({orders.filter(o => o.status === 'completed').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Aufträge gefunden</h3>
              <p className="text-gray-600">Sie haben noch keine Aufträge in diesem Status.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100' :
                      order.status === 'in_progress' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {getServiceIcon(order.service_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{order.notes}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Termin: {order.scheduled_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Dauer: {order.estimated_duration} Min.</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Preis: {order.price}€</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Service: {order.service_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders
