import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './src/components/ui/card.jsx'
import { Button } from './src/components/ui/button.jsx'
import { Input } from './src/components/ui/input.jsx'
import { Badge } from './src/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './src/components/ui/dialog.jsx'
import { Label } from './src/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './src/components/ui/select.jsx'
import { Textarea } from './src/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, FileText, Send, Check, X, Clock, Euro, Trash2, Download } from 'lucide-react'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    order_id: '',
    invoice_date: '',
    due_date: '',
    tax_rate: 19.0,
    payment_method: 'bank_transfer',
    notes: '',
    invoice_items: []
  })

  useEffect(() => {
    fetchInvoices()
    fetchCustomers()
  }, [statusFilter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('per_page', '50')

      const response = await fetch(`/api/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
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

  const handleAddInvoice = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newInvoice,
          customer_id: parseInt(newInvoice.customer_id),
          tax_rate: parseFloat(newInvoice.tax_rate)
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewInvoice({
          customer_id: '',
          order_id: '',
          invoice_date: '',
          due_date: '',
          tax_rate: 19.0,
          payment_method: 'bank_transfer',
          notes: '',
          invoice_items: []
        })
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error adding invoice:', error)
    }
  }

  const handleViewInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const invoice = await response.json()
        setSelectedInvoice(invoice)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error)
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Rechnung löschen möchten?')) {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchInvoices()
        }
      } catch (error) {
        console.error('Error deleting invoice:', error)
      }
    }
  }

  const handleSendInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error sending invoice:', error)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { variant: 'outline', text: 'Entwurf' },
      'sent': { variant: 'secondary', text: 'Gesendet' },
      'paid': { variant: 'default', text: 'Bezahlt' },
      'overdue': { variant: 'destructive', text: 'Überfällig' },
      'cancelled': { variant: 'destructive', text: 'Storniert' }
    }
    
    const config = statusConfig[status] || { variant: 'outline', text: status }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lade Rechnungen...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
          <p className="text-gray-600">Verwalten Sie alle Rechnungen und Zahlungen</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Rechnung
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
                placeholder="Rechnungsnummer, Kunde..."
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
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="sent">Gesendet</SelectItem>
                  <SelectItem value="paid">Bezahlt</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Rechnungen</CardTitle>
          <CardDescription>
            {invoices.length} Rechnung{invoices.length !== 1 ? 'en' : ''} gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{invoice.invoice_number}</div>
                    <div className="text-sm text-gray-500">{invoice.customer_name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
                  <div className="text-sm text-gray-500">
                    {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('de-DE') : 'N/A'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(invoice.status)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {invoice.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendInvoice(invoice.id)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {invoices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Rechnungen gefunden
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Invoice Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neue Rechnung erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Rechnung für einen Kunden
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddInvoice} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Kunde *</Label>
                <Select
                  value={newInvoice.customer_id}
                  onValueChange={(value) => setNewInvoice({...newInvoice, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="invoice_date">Rechnungsdatum *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={newInvoice.invoice_date}
                  onChange={(e) => setNewInvoice({...newInvoice, invoice_date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due_date">Fälligkeitsdatum</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="tax_rate">Steuersatz (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={newInvoice.tax_rate}
                  onChange={(e) => setNewInvoice({...newInvoice, tax_rate: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="payment_method">Zahlungsmethode</Label>
              <Select
                value={newInvoice.payment_method}
                onValueChange={(value) => setNewInvoice({...newInvoice, payment_method: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Banküberweisung</SelectItem>
                  <SelectItem value="cash">Bargeld</SelectItem>
                  <SelectItem value="credit_card">Kreditkarte</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                placeholder="Zusätzliche Informationen..."
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
              <Button type="submit">Rechnung erstellen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Rechnungsdetails</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zur Rechnung
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rechnungsnummer</Label>
                  <div className="font-medium">{selectedInvoice.invoice_number}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <Label>Kunde</Label>
                  <div className="font-medium">{selectedInvoice.customer_name}</div>
                </div>
                <div>
                  <Label>Rechnungsdatum</Label>
                  <div>{selectedInvoice.invoice_date ? new Date(selectedInvoice.invoice_date).toLocaleDateString('de-DE') : 'N/A'}</div>
                </div>
                <div>
                  <Label>Fälligkeitsdatum</Label>
                  <div>{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('de-DE') : 'N/A'}</div>
                </div>
                <div>
                  <Label>Zahlungsmethode</Label>
                  <div>{selectedInvoice.payment_method}</div>
                </div>
              </div>
              
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <Label>Rechnungspositionen</Label>
                  <div className="mt-2 space-y-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span>{item.description}</span>
                        <span>{item.quantity} x {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Gesamtbetrag:</span>
                  <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div>
                  <Label>Notizen</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">{selectedInvoice.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Invoices
