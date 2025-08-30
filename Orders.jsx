import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, Calendar, Clock, MapPin, Euro } from 'lucide-react'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    title: '',
    description: '',
    service_type: '',
    service_street: '',
    service_house_number: '',
    service_postal_code: '',
    service_city: '',
    scheduled_date: '',
    scheduled_time: '',
    estimated_duration: '',
    estimated_price: '',
    priority: 'normal',
    special_instructions: '',
    access_instructions: ''
  })

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [statusFilter, serviceTypeFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (serviceTypeFilter) params.append('service_type', serviceTypeFilter)
      params.append('per_page', '50')

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?per_page=100')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleAddOrder = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOrder,
          customer_id: parseInt(newOrder.customer_id),
          estimated_duration: newOrder.estimated_duration ? parseInt(newOrder.estimated_duration) : null,
          estimated_price: newOrder.estimated_price ? parseFloat(newOrder.estimated_price) : null
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewOrder({
          customer_id: '',
          title: '',
          description: '',
          service_type: '',
          service_street: '',
          service_house_number: '',
          service_postal_code: '',
          service_city: '',
          scheduled_date: '',
          scheduled_time: '',
          estimated_duration: '',
          estimated_price: '',
          priority: 'normal',
          special_instructions: '',
          access_instructions: ''
        })
        fetchOrders()
      }
    } catch (error) {
      console.error('Error adding order:', error)
    }
  }

  const handleViewOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const order = await response.json()
        setSelectedOrder(order)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend'
      case 'confirmed':
        return 'Bestätigt'
      case 'in_progress':
        return 'In Bearbeitung'
      case 'completed':
        return 'Abgeschlossen'
      case 'cancelled':
        return 'Storniert'
      default:
        return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceTypeText = (serviceType) => {
    switch (serviceType) {
      case 'building_cleaning':
        return 'Gebäudereinigung'
      case 'garden_maintenance':
        return 'Gartenpflege'
      case 'winter_service':
        return 'Winterdienst'
      default:
        return serviceType
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Aufträge</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Aufträge</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Aufträge und Termine</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Auftrag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neuen Auftrag hinzufügen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Auftrag für einen Kunden.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Kunde *</Label>
                  <Select value={newOrder.customer_id} onValueChange={(value) => setNewOrder({...newOrder, customer_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kunde auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.first_name} {customer.last_name} {customer.company_name && `(${customer.company_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="service_type">Service-Typ *</Label>
                  <Select value={newOrder.service_type} onValueChange={(value) => setNewOrder({...newOrder, service_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Service-Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="building_cleaning">Gebäudereinigung</SelectItem>
                      <SelectItem value="garden_maintenance">Gartenpflege</SelectItem>
                      <SelectItem value="winter_service">Winterdienst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={newOrder.title}
                  onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}
                  placeholder="z.B. Büroreinigung Hauptgebäude"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                  placeholder="Detaillierte Beschreibung des Auftrags"
                />
              </div>

              <div className="space-y-2">
                <Label>Service-Adresse</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      placeholder="Straße"
                      value={newOrder.service_street}
                      onChange={(e) => setNewOrder({...newOrder, service_street: e.target.value})}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Hausnummer"
                      value={newOrder.service_house_number}
                      onChange={(e) => setNewOrder({...newOrder, service_house_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="PLZ"
                    value={newOrder.service_postal_code}
                    onChange={(e) => setNewOrder({...newOrder, service_postal_code: e.target.value})}
                  />
                  <Input
                    placeholder="Stadt"
                    value={newOrder.service_city}
                    onChange={(e) => setNewOrder({...newOrder, service_city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scheduled_date">Geplantes Datum</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={newOrder.scheduled_date}
                    onChange={(e) => setNewOrder({...newOrder, scheduled_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Geplante Zeit</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={newOrder.scheduled_time}
                    onChange={(e) => setNewOrder({...newOrder, scheduled_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_duration">Geschätzte Dauer (Min.)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    value={newOrder.estimated_duration}
                    onChange={(e) => setNewOrder({...newOrder, estimated_duration: e.target.value})}
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_price">Geschätzter Preis (€)</Label>
                  <Input
                    id="estimated_price"
                    type="number"
                    step="0.01"
                    value={newOrder.estimated_price}
                    onChange={(e) => setNewOrder({...newOrder, estimated_price: e.target.value})}
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priorität</Label>
                  <Select value={newOrder.priority} onValueChange={(value) => setNewOrder({...newOrder, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                      <SelectItem value="urgent">Dringend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="special_instructions">Besondere Anweisungen</Label>
                <Textarea
                  id="special_instructions"
                  value={newOrder.special_instructions}
                  onChange={(e) => setNewOrder({...newOrder, special_instructions: e.target.value})}
                  placeholder="Besondere Hinweise für die Durchführung"
                />
              </div>

              <div>
                <Label htmlFor="access_instructions">Zugangshinweise</Label>
                <Textarea
                  id="access_instructions"
                  value={newOrder.access_instructions}
                  onChange={(e) => setNewOrder({...newOrder, access_instructions: e.target.value})}
                  placeholder="Informationen zum Zugang (Schlüssel, Codes, etc.)"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Auftrag erstellen
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Service-Typ filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Service-Typen</SelectItem>
                <SelectItem value="building_cleaning">Gebäudereinigung</SelectItem>
                <SelectItem value="garden_maintenance">Gartenpflege</SelectItem>
                <SelectItem value="winter_service">Winterdienst</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Auftragsliste ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Keine Aufträge gefunden.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {order.order_number.split('-')[2]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{order.title}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getServiceTypeText(order.service_type)}
                        </Badge>
                        {order.priority !== 'normal' && (
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority === 'urgent' ? 'Dringend' : 
                             order.priority === 'high' ? 'Hoch' : 
                             order.priority === 'low' ? 'Niedrig' : order.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Kunde: {order.customer?.first_name} {order.customer?.last_name}
                        {order.customer?.company_name && ` (${order.customer.company_name})`}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {order.scheduled_date && (
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(order.scheduled_date).toLocaleDateString('de-DE')}
                            {order.scheduled_time && ` um ${order.scheduled_time.slice(0, 5)}`}
                          </span>
                        )}
                        {order.estimated_duration && (
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {order.estimated_duration} Min.
                          </span>
                        )}
                        {order.estimated_price && (
                          <span className="flex items-center">
                            <Euro className="mr-1 h-3 w-3" />
                            {order.estimated_price.toFixed(2)} €
                          </span>
                        )}
                        {(order.service_street || order.service_city) && (
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {order.service_street} {order.service_house_number}, {order.service_postal_code} {order.service_city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auftragsdetails</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Auftragsnummer</Label>
                  <p className="font-mono text-sm">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Titel</Label>
                <p className="font-semibold">{selectedOrder.title}</p>
              </div>

              {selectedOrder.description && (
                <div>
                  <Label>Beschreibung</Label>
                  <p className="text-gray-700">{selectedOrder.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service-Typ</Label>
                  <p>{getServiceTypeText(selectedOrder.service_type)}</p>
                </div>
                <div>
                  <Label>Priorität</Label>
                  <Badge className={getPriorityColor(selectedOrder.priority)}>
                    {selectedOrder.priority === 'urgent' ? 'Dringend' : 
                     selectedOrder.priority === 'high' ? 'Hoch' : 
                     selectedOrder.priority === 'normal' ? 'Normal' :
                     selectedOrder.priority === 'low' ? 'Niedrig' : selectedOrder.priority}
                  </Badge>
                </div>
              </div>

              {selectedOrder.customer && (
                <div>
                  <Label>Kunde</Label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">
                      {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
                    </p>
                    {selectedOrder.customer.company_name && (
                      <p className="text-sm text-gray-600">{selectedOrder.customer.company_name}</p>
                    )}
                    <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                    {selectedOrder.customer.phone && (
                      <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {(selectedOrder.service_street || selectedOrder.service_city) && (
                <div>
                  <Label>Service-Adresse</Label>
                  <p>
                    {selectedOrder.service_street} {selectedOrder.service_house_number}<br />
                    {selectedOrder.service_postal_code} {selectedOrder.service_city}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {selectedOrder.scheduled_date && (
                  <div>
                    <Label>Geplantes Datum</Label>
                    <p>{new Date(selectedOrder.scheduled_date).toLocaleDateString('de-DE')}</p>
                  </div>
                )}
                {selectedOrder.scheduled_time && (
                  <div>
                    <Label>Geplante Zeit</Label>
                    <p>{selectedOrder.scheduled_time.slice(0, 5)}</p>
                  </div>
                )}
                {selectedOrder.estimated_duration && (
                  <div>
                    <Label>Geschätzte Dauer</Label>
                    <p>{selectedOrder.estimated_duration} Minuten</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedOrder.estimated_price && (
                  <div>
                    <Label>Geschätzter Preis</Label>
                    <p>{selectedOrder.estimated_price.toFixed(2)} €</p>
                  </div>
                )}
                {selectedOrder.final_price && (
                  <div>
                    <Label>Endpreis</Label>
                    <p className="font-semibold">{selectedOrder.final_price.toFixed(2)} €</p>
                  </div>
                )}
              </div>

              {selectedOrder.special_instructions && (
                <div>
                  <Label>Besondere Anweisungen</Label>
                  <p className="text-gray-700">{selectedOrder.special_instructions}</p>
                </div>
              )}

              {selectedOrder.access_instructions && (
                <div>
                  <Label>Zugangshinweise</Label>
                  <p className="text-gray-700">{selectedOrder.access_instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Erstellt am</Label>
                  <p>{new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                </div>
                {selectedOrder.completed_at && (
                  <div>
                    <Label>Abgeschlossen am</Label>
                    <p>{new Date(selectedOrder.completed_at).toLocaleDateString('de-DE')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders

