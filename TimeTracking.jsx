import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, Clock, Play, Square, TrendingUp, BarChart3, Calendar } from 'lucide-react'

const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newEntry, setNewEntry] = useState({
    user_id: 1,
    user_name: '',
    customer_id: '',
    order_id: '',
    start_time: '',
    end_time: '',
    description: '',
    activity_type: 'work',
    status: 'completed',
    notes: ''
  })

  useEffect(() => {
    fetchTimeEntries()
    fetchCustomers()
    fetchOrders()
  }, [statusFilter, userFilter])

  const fetchTimeEntries = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (userFilter) params.append('user_id', userFilter)
      params.append('per_page', '50')

      const response = await fetch(`/api/time-entries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data.time_entries)
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
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

  const handleAddEntry = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEntry,
          customer_id: newEntry.customer_id ? parseInt(newEntry.customer_id) : null,
          order_id: newEntry.order_id ? parseInt(newEntry.order_id) : null
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewEntry({
          user_id: 1,
          user_name: '',
          customer_id: '',
          order_id: '',
          start_time: '',
          end_time: '',
          description: '',
          activity_type: 'work',
          status: 'completed',
          notes: ''
        })
        fetchTimeEntries()
      }
    } catch (error) {
      console.error('Error adding time entry:', error)
    }
  }

  const handleStartEntry = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/time-entries/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEntry,
          customer_id: newEntry.customer_id ? parseInt(newEntry.customer_id) : null,
          order_id: newEntry.order_id ? parseInt(newEntry.order_id) : null
        }),
      })

      if (response.ok) {
        setShowStartDialog(false)
        setNewEntry({
          user_id: 1,
          user_name: '',
          customer_id: '',
          order_id: '',
          start_time: '',
          end_time: '',
          description: '',
          activity_type: 'work',
          status: 'completed',
          notes: ''
        })
        fetchTimeEntries()
      }
    } catch (error) {
      console.error('Error starting time entry:', error)
    }
  }

  const handleStopEntry = async (entryId) => {
    try {
      const response = await fetch(`/api/time-entries/${entryId}/stop`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchTimeEntries()
      }
    } catch (error) {
      console.error('Error stopping time entry:', error)
    }
  }

  const handleViewEntry = async (entryId) => {
    try {
      const response = await fetch(`/api/time-entries/${entryId}`)
      if (response.ok) {
        const entry = await response.json()
        setSelectedEntry(entry)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching time entry details:', error)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Zeiteintrag löschen möchten?')) {
      try {
        const response = await fetch(`/api/time-entries/${entryId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchTimeEntries()
        }
      } catch (error) {
        console.error('Error deleting time entry:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { variant: 'default', text: 'Aktiv', icon: Play },
      'completed': { variant: 'secondary', text: 'Abgeschlossen', icon: Square },
      'paused': { variant: 'outline', text: 'Pausiert', icon: Clock },
      'cancelled': { variant: 'destructive', text: 'Storniert', icon: Square }
    }
    
    const config = statusConfig[status] || { variant: 'outline', text: status, icon: Clock }
    const Icon = config.icon
    return <Badge variant={config.variant}><Icon className="h-3 w-3 mr-1" />{config.text}</Badge>
  }

  const getActivityBadge = (activityType) => {
    const activityConfig = {
      'work': { variant: 'default', text: 'Arbeit' },
      'break': { variant: 'outline', text: 'Pause' },
      'meeting': { variant: 'secondary', text: 'Meeting' },
      'travel': { variant: 'outline', text: 'Reise' }
    }
    
    const config = activityConfig[activityType] || { variant: 'outline', text: activityType }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatDuration = (duration) => {
    if (!duration) return 'N/A'
    const hours = Math.floor(duration)
    const minutes = Math.round((duration - hours) * 60)
    return `${hours}h ${minutes}m`
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return new Date(timeString).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lade Zeiteinträge...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zeiterfassung</h1>
          <p className="text-gray-600">Verwalten Sie Arbeitszeiten und Projekte</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowStartDialog(true)}>
            <Play className="h-4 w-4 mr-2" />
            Zeit starten
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Eintrag
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Suche</Label>
              <Input
                id="search"
                placeholder="Beschreibung, Kunde..."
                className="mt-1"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="paused">Pausiert</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="user">Mitarbeiter</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Alle Mitarbeiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Mitarbeiter</SelectItem>
                  <SelectItem value="1">Max Mustermann</SelectItem>
                  <SelectItem value="2">Anna Schmidt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Zeiteinträge</CardTitle>
          <CardDescription>
            {timeEntries.length} Eintrag{timeEntries.length !== 1 ? 'e' : ''} gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{entry.user_name}</div>
                    <div className="text-sm text-gray-500">
                      {entry.customer_name} - {entry.order_title || 'Kein Auftrag'}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{formatTime(entry.start_time)}</div>
                  <div className="text-sm text-gray-500">
                    {entry.end_time ? formatTime(entry.end_time) : 'Läuft...'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{formatDuration(entry.duration)}</div>
                  <div className="text-sm text-gray-500">Dauer</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getActivityBadge(entry.activity_type)}
                  {getStatusBadge(entry.status)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEntry(entry.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {entry.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopEntry(entry.id)}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {timeEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Zeiteinträge gefunden
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Time Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuen Zeiteintrag erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Zeiteintrag für einen Auftrag oder Kunden
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_name">Mitarbeiter *</Label>
                <Input
                  id="user_name"
                  value={newEntry.user_name}
                  onChange={(e) => setNewEntry({...newEntry, user_name: e.target.value})}
                  placeholder="Name des Mitarbeiters"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="activity_type">Tätigkeitstyp</Label>
                <Select
                  value={newEntry.activity_type}
                  onValueChange={(value) => setNewEntry({...newEntry, activity_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Arbeit</SelectItem>
                    <SelectItem value="break">Pause</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="travel">Reise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Kunde</Label>
                <Select
                  value={newEntry.customer_id}
                  onValueChange={(value) => setNewEntry({...newEntry, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Kunde</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="order">Auftrag</Label>
                <Select
                  value={newEntry.order_id}
                  onValueChange={(value) => setNewEntry({...newEntry, order_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auftrag auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Auftrag</SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        {order.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Startzeit *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={newEntry.start_time}
                  onChange={(e) => setNewEntry({...newEntry, start_time: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="end_time">Endzeit</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={newEntry.end_time}
                  onChange={(e) => setNewEntry({...newEntry, end_time: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={newEntry.description}
                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                placeholder="Was wurde gemacht?"
                required
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Eintrag erstellen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Start Time Entry Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Zeit starten</DialogTitle>
            <DialogDescription>
              Starten Sie einen neuen Zeiteintrag
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleStartEntry} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_user_name">Mitarbeiter *</Label>
                <Input
                  id="start_user_name"
                  value={newEntry.user_name}
                  onChange={(e) => setNewEntry({...newEntry, user_name: e.target.value})}
                  placeholder="Name des Mitarbeiters"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="start_activity_type">Tätigkeitstyp</Label>
                <Select
                  value={newEntry.activity_type}
                  onValueChange={(value) => setNewEntry({...newEntry, activity_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Arbeit</SelectItem>
                    <SelectItem value="break">Pause</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="travel">Reise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_customer">Kunde</Label>
                <Select
                  value={newEntry.customer_id}
                  onValueChange={(value) => setNewEntry({...newEntry, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Kunde</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_order">Auftrag</Label>
                <Select
                  value={newEntry.order_id}
                  onValueChange={(value) => setNewEntry({...newEntry, order_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auftrag auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Kein Auftrag</SelectItem>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        {order.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="start_description">Beschreibung *</Label>
              <Textarea
                id="start_description"
                value={newEntry.description}
                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                placeholder="Was wird gemacht?"
                required
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="start_notes">Notizen</Label>
              <Textarea
                id="start_notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStartDialog(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Zeit starten</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Time Entry Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Zeiteintrag Details</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zum Zeiteintrag
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mitarbeiter</Label>
                  <div className="font-medium">{selectedEntry.user_name}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedEntry.status)}</div>
                </div>
                <div>
                  <Label>Kunde</Label>
                  <div className="font-medium">{selectedEntry.customer_name}</div>
                </div>
                <div>
                  <Label>Auftrag</Label>
                  <div>{selectedEntry.order_title || 'Kein Auftrag'}</div>
                </div>
                <div>
                  <Label>Tätigkeitstyp</Label>
                  <div>{getActivityBadge(selectedEntry.activity_type)}</div>
                </div>
                <div>
                  <Label>Dauer</Label>
                  <div className="font-medium">{formatDuration(selectedEntry.duration)}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Label>Startzeit</Label>
                    <div className="text-2xl font-bold mt-2">{formatTime(selectedEntry.start_time)}</div>
                  </div>
                  <div className="text-center">
                    <Label>Endzeit</Label>
                    <div className="text-2xl font-bold mt-2">{selectedEntry.end_time ? formatTime(selectedEntry.end_time) : 'Läuft...'}</div>
                  </div>
                </div>
              </div>
              
              {selectedEntry.description && (
                <div>
                  <Label>Beschreibung</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">{selectedEntry.description}</div>
                </div>
              )}
              
              {selectedEntry.notes && (
                <div>
                  <Label>Notizen</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">{selectedEntry.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TimeTracking