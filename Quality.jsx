import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, CheckCircle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react'

const Quality = () => {
  const [qualityChecks, setQualityChecks] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCheck, setSelectedCheck] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newCheck, setNewCheck] = useState({
    order_id: '',
    customer_id: '',
    inspector_name: '',
    check_date: '',
    check_type: '',
    overall_score: 0,
    status: 'pending',
    notes: '',
    check_details: '',
    recommendations: ''
  })

  useEffect(() => {
    fetchQualityChecks()
    fetchCustomers()
    fetchOrders()
  }, [statusFilter, typeFilter])

  const fetchQualityChecks = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('check_type', typeFilter)
      params.append('per_page', '50')

      const response = await fetch(`/api/quality-checks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQualityChecks(data.quality_checks)
      }
    } catch (error) {
      console.error('Error fetching quality checks:', error)
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

  const handleAddCheck = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/quality-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCheck,
          order_id: newCheck.order_id ? parseInt(newCheck.order_id) : null,
          customer_id: newCheck.customer_id ? parseInt(newCheck.customer_id) : null,
          overall_score: parseFloat(newCheck.overall_score)
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewCheck({
          order_id: '',
          customer_id: '',
          inspector_name: '',
          check_date: '',
          check_type: '',
          overall_score: 0,
          status: 'pending',
          notes: '',
          check_details: '',
          recommendations: ''
        })
        fetchQualityChecks()
      }
    } catch (error) {
      console.error('Error adding quality check:', error)
    }
  }

  const handleViewCheck = async (checkId) => {
    try {
      const response = await fetch(`/api/quality-checks/${checkId}`)
      if (response.ok) {
        const check = await response.json()
        setSelectedCheck(check)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching quality check details:', error)
    }
  }

  const handleDeleteCheck = async (checkId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Qualitätsprüfung löschen möchten?')) {
      try {
        const response = await fetch(`/api/quality-checks/${checkId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchQualityChecks()
        }
      } catch (error) {
        console.error('Error deleting quality check:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'outline', text: 'Ausstehend' },
      'in_progress': { variant: 'secondary', text: 'In Bearbeitung' },
      'completed': { variant: 'default', text: 'Abgeschlossen' },
      'failed': { variant: 'destructive', text: 'Fehlgeschlagen' }
    }
    
    const config = statusConfig[status] || { variant: 'outline', text: status }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getScoreBadge = (score) => {
    let variant = 'outline'
    let color = 'text-gray-600'
    
    if (score >= 90) {
      variant = 'default'
      color = 'text-green-600'
    } else if (score >= 75) {
      variant = 'secondary'
      color = 'text-blue-600'
    } else if (score >= 60) {
      variant = 'outline'
      color = 'text-yellow-600'
    } else {
      variant = 'destructive'
      color = 'text-red-600'
    }
    
    return <Badge variant={variant} className={color}>{score}%</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lade Qualitätsprüfungen...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Qualitätsprüfungen</h1>
          <p className="text-gray-600">Überwachen Sie die Qualität Ihrer Dienstleistungen</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Prüfung
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Suche</Label>
              <Input
                id="search"
                placeholder="Prüfung, Kunde..."
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
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="type">Prüfungstyp</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Alle Typen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Typen</SelectItem>
                  <SelectItem value="cleaning">Reinigung</SelectItem>
                  <SelectItem value="maintenance">Wartung</SelectItem>
                  <SelectItem value="inspection">Inspektion</SelectItem>
                  <SelectItem value="final">Endprüfung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Qualitätsprüfungen</CardTitle>
          <CardDescription>
            {qualityChecks.length} Prüfung{qualityChecks.length !== 1 ? 'en' : ''} gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityChecks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{check.check_type}</div>
                    <div className="text-sm text-gray-500">
                      {check.customer_name} - {check.order_title || 'Kein Auftrag'}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{check.inspector_name}</div>
                  <div className="text-sm text-gray-500">
                    {check.check_date ? new Date(check.check_date).toLocaleDateString('de-DE') : 'N/A'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getScoreBadge(check.overall_score)}
                  {getStatusBadge(check.status)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCheck(check.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCheck(check.id)}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {qualityChecks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Qualitätsprüfungen gefunden
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Quality Check Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neue Qualitätsprüfung erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Qualitätsprüfung für einen Auftrag oder Kunden
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddCheck} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Kunde</Label>
                <Select
                  value={newCheck.customer_id}
                  onValueChange={(value) => setNewCheck({...newCheck, customer_id: value})}
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
                  value={newCheck.order_id}
                  onValueChange={(value) => setNewCheck({...newCheck, order_id: value})}
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
                <Label htmlFor="inspector_name">Prüfer *</Label>
                <Input
                  id="inspector_name"
                  value={newCheck.inspector_name}
                  onChange={(e) => setNewCheck({...newCheck, inspector_name: e.target.value})}
                  placeholder="Name des Prüfers"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="check_date">Prüfdatum *</Label>
                <Input
                  id="check_date"
                  type="date"
                  value={newCheck.check_date}
                  onChange={(e) => setNewCheck({...newCheck, check_date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check_type">Prüfungstyp *</Label>
                <Select
                  value={newCheck.check_type}
                  onValueChange={(value) => setNewCheck({...newCheck, check_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Reinigung</SelectItem>
                    <SelectItem value="maintenance">Wartung</SelectItem>
                    <SelectItem value="inspection">Inspektion</SelectItem>
                    <SelectItem value="final">Endprüfung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="overall_score">Gesamtbewertung (%) *</Label>
                <Input
                  id="overall_score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newCheck.overall_score}
                  onChange={(e) => setNewCheck({...newCheck, overall_score: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="check_details">Prüfdetails</Label>
              <Textarea
                id="check_details"
                value={newCheck.check_details}
                onChange={(e) => setNewCheck({...newCheck, check_details: e.target.value})}
                placeholder="Detaillierte Prüfergebnisse..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="recommendations">Empfehlungen</Label>
              <Textarea
                id="recommendations"
                value={newCheck.recommendations}
                onChange={(e) => setNewCheck({...newCheck, recommendations: e.target.value})}
                placeholder="Verbesserungsvorschläge..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={newCheck.notes}
                onChange={(e) => setNewCheck({...newCheck, notes: e.target.value})}
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
              <Button type="submit">Prüfung erstellen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quality Check Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Qualitätsprüfung Details</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zur Qualitätsprüfung
            </DialogDescription>
          </DialogHeader>
          
          {selectedCheck && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prüfungstyp</Label>
                  <div className="font-medium">{selectedCheck.check_type}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedCheck.status)}</div>
                </div>
                <div>
                  <Label>Kunde</Label>
                  <div className="font-medium">{selectedCheck.customer_name}</div>
                </div>
                <div>
                  <Label>Auftrag</Label>
                  <div>{selectedCheck.order_title || 'Kein Auftrag'}</div>
                </div>
                <div>
                  <Label>Prüfer</Label>
                  <div className="font-medium">{selectedCheck.inspector_name}</div>
                </div>
                <div>
                  <Label>Prüfdatum</Label>
                  <div>{selectedCheck.check_date ? new Date(selectedCheck.check_date).toLocaleDateString('de-DE') : 'N/A'}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-center">
                  <div className="text-center">
                    <Label>Gesamtbewertung</Label>
                    <div className="text-3xl font-bold mt-2">{getScoreBadge(selectedCheck.overall_score)}</div>
                  </div>
                </div>
              </div>
              
              {selectedCheck.check_details && (
                <div>
                  <Label>Prüfdetails</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">{selectedCheck.check_details}</div>
                </div>
              )}
              
              {selectedCheck.recommendations && (
                <div>
                  <Label>Empfehlungen</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded">{selectedCheck.recommendations}</div>
                </div>
              )}
              
              {selectedCheck.notes && (
                <div>
                  <Label>Notizen</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">{selectedCheck.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Quality
