import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Badge } from './ui/badge.jsx'
import { Button } from './ui/button.jsx'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { customerPortalAPI } from '../utils/api.js'

const CalendarComponent = ({ customerId }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

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

  const getStatusIcon = (status) => {
    return status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-blue-600" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getUpcomingAppointments = () => {
    const today = new Date()
    return orders
      .filter(order => new Date(order.scheduled_date) >= today)
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return orders.filter(order => order.scheduled_date === today)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Termine</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const upcomingAppointments = getUpcomingAppointments()
  const todayAppointments = getTodayAppointments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Termine</h2>
          <p className="text-gray-600">Übersicht über Ihre anstehenden Termine</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          Aktualisieren
        </Button>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Calendar className="h-5 w-5 mr-2" />
              Heute ({formatDate(new Date().toISOString())})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.order_number}</h4>
                      <p className="text-sm text-gray-600">{appointment.service_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.price}€</p>
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Anstehende Termine</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine anstehenden Termine</h3>
              <p className="text-gray-600">Sie haben derzeit keine geplanten Termine.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100' :
                      appointment.status === 'in_progress' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.order_number}</h4>
                      <p className="text-sm text-gray-600">{appointment.service_type}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(appointment.scheduled_date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {appointment.estimated_duration} Min.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.price}€</p>
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anstehende Termine</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Termine heute</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossene Termine</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CalendarComponent
