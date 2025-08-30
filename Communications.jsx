import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, Phone, Mail, MessageSquare, Calendar, AlertCircle } from 'lucide-react'

const Communications = () => {
  const [communications, setCommunications] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newCommunication, setNewCommunication] = useState({
    customer_id: '',
    order_id: '',
    type: '',
    direction: 'outbound',
    subject: '',
    content: '',
    contact_person: '',
    contact_method: '',
    status: 'completed',
    follow_up_date: '',
    tags: '',
    is_important: false
  })

  useEffect(() => {
    fetchCommunications()
    fetchCustomers()
    fetchOrders()
  }, [typeFilter, statusFilter])

  const fetchCommunications = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      if (statusFilter) params.append('status', statusFilter)
      params.append('per_page', '50')

      const response = await fetch(`/api/communications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCommunications(data.communications)
      }
    } catch (error) {
      console.error('Error fetching communications:', error)
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

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?per_page=100')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleAddCommunication = async (e) => {
    e.preventDefault()
    try {
      const communicationData = {
        ...newCommunication,
        customer_id: parseInt(newCommunication.customer_id),
        order_id: newCommunication.order_id ? parseInt(newCommunication.order_id) : null,
        follow_up_date: newCommunication.follow_up_date || null
      }

      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(communicationData),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewCommunication({
          customer_id: '',
          order_id: '',
          type: '',
          direction: 'outbound',
          subject: '',
          content: '',
          contact_person: '',
          contact_method: '',
          status: 'completed',
          follow_up_date: '',
          tags: '',
          is_important: false
        })
        fetchCommunications()
      }
    } catch (error) {
      console.error('Error adding communication:', error)
    }
  }

  const handleViewCommunication = async (communicationId) => {
    try {
      const response = await fetch(`/api/communications/${communicationId}`)
      if (response.ok) {
        const communication = await response.json()
        setSelectedCommunication(communication)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching communication details:', error)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return Mail
      case 'phone':
        return Phone
      case 'whatsapp':
      case 'sms':
        return MessageSquare
      default:
        return MessageSquare
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800'
      case 'phone':
        return 'bg-green-100 text-green-800'
      case 'whatsapp':
        return 'bg-green-100 text-green-800'
      case 'sms':
        return 'bg-purple-100 text-purple-800'
      case 'meeting':
        return 'bg-orange-100 text-orange-800'
      case 'note':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDirectionColor = (direction) => {
    return direction === 'inbound' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'follow_up_required':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kommunikation</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Kommunikation</h2>
          <p className="text-gray-600">Verwalten Sie die Kommunikation mit Ihren Kunden</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Kommunikation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neue Kommunikation hinzufügen</DialogTitle>
              <DialogDescription>
                Dokumentieren Sie eine Kommunikation mit einem Kunden.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCommunication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Kunde *</Label>
                  <Select value={newCommunication.customer_id} onValueChange={(value) => setNewCommunication({...newCommunication, customer_id: value})}>
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
                  <Label htmlFor="order_id">Zugehöriger Auftrag (optional)</Label>
                  <Select value={newCommunication.order_id} onValueChange={(value) => setNewCommunication({...newCommunication, order_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auftrag auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Kein Auftrag</SelectItem>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          {order.order_number} - {order.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Kommunikationstyp *</Label>
                  <Select value={newCommunication.type} onValueChange={(value) => setNewCommunication({...newCommunication, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="phone">Telefon</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="meeting">Termin</SelectItem>
                      <SelectItem value="note">Notiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="direction">Richtung *</Label>
                  <Select value={newCommunication.direction} onValueChange={(value) => setNewCommunication({...newCommunication, direction: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Ausgehend</SelectItem>
                      <SelectItem value="inbound">Eingehend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Betreff</Label>
                <Input
                  id="subject"
                  value={newCommunication.subject}
                  onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
                  placeholder="Kurzer Betreff der Kommunikation"
                />
              </div>

              <div>
                <Label htmlFor="content">Inhalt *</Label>
                <Textarea
                  id="content"
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
                  placeholder="Detaillierter Inhalt der Kommunikation"
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Kontaktperson</Label>
                  <Input
                    id="contact_person"
                    value={newCommunication.contact_person}
                    onChange={(e) => setNewCommunication({...newCommunication, contact_person: e.target.value})}
                    placeholder="Name der Kontaktperson"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_method">Kontaktmethode</Label>
                  <Input
                    id="contact_method"
                    value={newCommunication.contact_method}
                    onChange={(e) => setNewCommunication({...newCommunication, contact_method: e.target.value})}
                    placeholder="E-Mail, Telefonnummer, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newCommunication.status} onValueChange={(value) => setNewCommunication({...newCommunication, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                      <SelectItem value="pending">Ausstehend</SelectItem>
                      <SelectItem value="follow_up_required">Nachfassen erforderlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="follow_up_date">Nachfass-Datum</Label>
                  <Input
                    id="follow_up_date"
                    type="datetime-local"
                    value={newCommunication.follow_up_date}
                    onChange={(e) => setNewCommunication({...newCommunication, follow_up_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (kommagetrennt)</Label>
                <Input
                  id="tags"
                  value={newCommunication.tags}
                  onChange={(e) => setNewCommunication({...newCommunication, tags: e.target.value})}
                  placeholder="wichtig, angebot, beschwerde"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_important"
                  checked={newCommunication.is_important}
                  onChange={(e) => setNewCommunication({...newCommunication, is_important: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_important">Als wichtig markieren</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Kommunikation hinzufügen
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Typ filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Typen</SelectItem>
                <SelectItem value="email">E-Mail</SelectItem>
                <SelectItem value="phone">Telefon</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="meeting">Termin</SelectItem>
                <SelectItem value="note">Notiz</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Status</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="follow_up_required">Nachfassen erforderlich</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>Kommunikationsverlauf ({communications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Keine Kommunikation gefunden.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {communications.map((comm) => {
                const TypeIcon = getTypeIcon(comm.type)
                return (
                  <div key={comm.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${getTypeColor(comm.type)}`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {comm.subject || `${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} Kommunikation`}
                          </h3>
                          <Badge className={getDirectionColor(comm.direction)}>
                            {comm.direction === 'inbound' ? 'Eingehend' : 'Ausgehend'}
                          </Badge>
                          <Badge className={getStatusColor(comm.status)}>
                            {comm.status === 'completed' ? 'Abgeschlossen' :
                             comm.status === 'pending' ? 'Ausstehend' :
                             comm.status === 'follow_up_required' ? 'Nachfassen' : comm.status}
                          </Badge>
                          {comm.is_important && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Wichtig
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Kunde: {comm.customer?.first_name} {comm.customer?.last_name}
                          {comm.customer?.company_name && ` (${comm.customer.company_name})`}
                        </p>
                        {comm.order && (
                          <p className="text-sm text-gray-600 mb-2">
                            Auftrag: {comm.order.order_number} - {comm.order.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {comm.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(comm.communication_date).toLocaleDateString('de-DE')} um {new Date(comm.communication_date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {comm.contact_person && (
                            <span>Kontakt: {comm.contact_person}</span>
                          )}
                          {comm.tags && (
                            <span>Tags: {comm.tags}</span>
                          )}
                          {comm.follow_up_date && !comm.follow_up_completed && (
                            <span className="text-red-600 font-medium">
                              Nachfassen: {new Date(comm.follow_up_date).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCommunication(comm.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kommunikationsdetails</DialogTitle>
          </DialogHeader>
          {selectedCommunication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Typ</Label>
                  <Badge className={getTypeColor(selectedCommunication.type)}>
                    {selectedCommunication.type.charAt(0).toUpperCase() + selectedCommunication.type.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label>Richtung</Label>
                  <Badge className={getDirectionColor(selectedCommunication.direction)}>
                    {selectedCommunication.direction === 'inbound' ? 'Eingehend' : 'Ausgehend'}
                  </Badge>
                </div>
              </div>

              {selectedCommunication.subject && (
                <div>
                  <Label>Betreff</Label>
                  <p className="font-semibold">{selectedCommunication.subject}</p>
                </div>
              )}

              <div>
                <Label>Inhalt</Label>
                <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {selectedCommunication.content}
                </div>
              </div>

              {selectedCommunication.customer && (
                <div>
                  <Label>Kunde</Label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">
                      {selectedCommunication.customer.first_name} {selectedCommunication.customer.last_name}
                    </p>
                    {selectedCommunication.customer.company_name && (
                      <p className="text-sm text-gray-600">{selectedCommunication.customer.company_name}</p>
                    )}
                    <p className="text-sm text-gray-600">{selectedCommunication.customer.email}</p>
                  </div>
                </div>
              )}

              {selectedCommunication.order && (
                <div>
                  <Label>Zugehöriger Auftrag</Label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">{selectedCommunication.order.order_number}</p>
                    <p className="text-sm text-gray-600">{selectedCommunication.order.title}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedCommunication.contact_person && (
                  <div>
                    <Label>Kontaktperson</Label>
                    <p>{selectedCommunication.contact_person}</p>
                  </div>
                )}
                {selectedCommunication.contact_method && (
                  <div>
                    <Label>Kontaktmethode</Label>
                    <p>{selectedCommunication.contact_method}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedCommunication.status)}>
                    {selectedCommunication.status === 'completed' ? 'Abgeschlossen' :
                     selectedCommunication.status === 'pending' ? 'Ausstehend' :
                     selectedCommunication.status === 'follow_up_required' ? 'Nachfassen erforderlich' : selectedCommunication.status}
                  </Badge>
                </div>
                <div>
                  <Label>Wichtigkeit</Label>
                  <Badge className={selectedCommunication.is_important ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedCommunication.is_important ? 'Wichtig' : 'Normal'}
                  </Badge>
                </div>
              </div>

              {selectedCommunication.follow_up_date && (
                <div>
                  <Label>Nachfass-Datum</Label>
                  <p className={!selectedCommunication.follow_up_completed ? 'text-red-600 font-medium' : ''}>
                    {new Date(selectedCommunication.follow_up_date).toLocaleDateString('de-DE')} um {new Date(selectedCommunication.follow_up_date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    {selectedCommunication.follow_up_completed && ' (Erledigt)'}
                  </p>
                </div>
              )}

              {selectedCommunication.tags && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedCommunication.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Kommunikationsdatum</Label>
                <p>{new Date(selectedCommunication.communication_date).toLocaleDateString('de-DE')} um {new Date(selectedCommunication.communication_date).toLocaleTimeString('de-DE')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Communications

