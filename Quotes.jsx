import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, FileText, Send, Check, X, Clock, Euro, Trash2 } from 'lucide-react'

const Quotes = () => {
  const [quotes, setQuotes] = useState([])
  const [customers, setCustomers] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newQuote, setNewQuote] = useState({
    customer_id: '',
    title: '',
    description: '',
    service_type: '',
    service_street: '',
    service_house_number: '',
    service_postal_code: '',
    service_city: '',
    valid_until: '',
    tax_rate: 19.0,
    notes: '',
    terms_conditions: '',
    quote_items: []
  })

  useEffect(() => {
    fetchQuotes()
    fetchCustomers()
    fetchTemplates()
  }, [statusFilter, serviceTypeFilter])

  const fetchQuotes = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (serviceTypeFilter) params.append('service_type', serviceTypeFilter)
      params.append('per_page', '50')

      const response = await fetch(`/api/quotes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/quote-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleAddQuote = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newQuote,
          customer_id: parseInt(newQuote.customer_id),
          tax_rate: parseFloat(newQuote.tax_rate)
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        resetNewQuote()
        fetchQuotes()
      }
    } catch (error) {
      console.error('Error adding quote:', error)
    }
  }

  const handleGenerateFromTemplate = async (templateId, customerData) => {
    try {
      const response = await fetch(`/api/quote-templates/${templateId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        setShowTemplateDialog(false)
        fetchQuotes()
      }
    } catch (error) {
      console.error('Error generating quote from template:', error)
    }
  }

  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchQuotes()
        if (selectedQuote && selectedQuote.id === quoteId) {
          const updatedQuote = await response.json()
          setSelectedQuote(updatedQuote)
        }
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
    }
  }

  const handleViewQuote = async (quoteId) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`)
      if (response.ok) {
        const quote = await response.json()
        setSelectedQuote(quote)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching quote details:', error)
    }
  }

  const resetNewQuote = () => {
    setNewQuote({
      customer_id: '',
      title: '',
      description: '',
      service_type: '',
      service_street: '',
      service_house_number: '',
      service_postal_code: '',
      service_city: '',
      valid_until: '',
      tax_rate: 19.0,
      notes: '',
      terms_conditions: '',
      quote_items: []
    })
  }

  const addQuoteItem = () => {
    setNewQuote({
      ...newQuote,
      quote_items: [
        ...newQuote.quote_items,
        {
          description: '',
          quantity: 1,
          unit: 'Stück',
          unit_price: 0,
          notes: ''
        }
      ]
    })
  }

  const updateQuoteItem = (index, field, value) => {
    const updatedItems = [...newQuote.quote_items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewQuote({ ...newQuote, quote_items: updatedItems })
  }

  const removeQuoteItem = (index) => {
    const updatedItems = newQuote.quote_items.filter((_, i) => i !== index)
    setNewQuote({ ...newQuote, quote_items: updatedItems })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Entwurf'
      case 'sent':
        return 'Versendet'
      case 'accepted':
        return 'Angenommen'
      case 'rejected':
        return 'Abgelehnt'
      case 'expired':
        return 'Abgelaufen'
      default:
        return status
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
          <h2 className="text-2xl font-bold text-gray-900">Angebote</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Angebote</h2>
          <p className="text-gray-600">Erstellen und verwalten Sie Ihre Angebote</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Aus Vorlage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Angebot aus Vorlage erstellen</DialogTitle>
                <DialogDescription>
                  Wählen Sie eine Vorlage und einen Kunden aus.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          {getServiceTypeText(template.service_type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>Kunde auswählen:</Label>
                        <Select onValueChange={(customerId) => {
                          if (customerId) {
                            handleGenerateFromTemplate(template.id, { customer_id: parseInt(customerId) })
                          }
                        }}>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Neues Angebot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neues Angebot erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie ein individuelles Angebot für einen Kunden.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddQuote} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_id">Kunde *</Label>
                    <Select value={newQuote.customer_id} onValueChange={(value) => setNewQuote({...newQuote, customer_id: value})}>
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
                    <Select value={newQuote.service_type} onValueChange={(value) => setNewQuote({...newQuote, service_type: value})}>
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
                    value={newQuote.title}
                    onChange={(e) => setNewQuote({...newQuote, title: e.target.value})}
                    placeholder="z.B. Angebot für Büroreinigung"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={newQuote.description}
                    onChange={(e) => setNewQuote({...newQuote, description: e.target.value})}
                    placeholder="Detaillierte Beschreibung des Angebots"
                  />
                </div>

                {/* Service Address */}
                <div className="space-y-2">
                  <Label>Service-Adresse</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        placeholder="Straße"
                        value={newQuote.service_street}
                        onChange={(e) => setNewQuote({...newQuote, service_street: e.target.value})}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Hausnummer"
                        value={newQuote.service_house_number}
                        onChange={(e) => setNewQuote({...newQuote, service_house_number: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="PLZ"
                      value={newQuote.service_postal_code}
                      onChange={(e) => setNewQuote({...newQuote, service_postal_code: e.target.value})}
                    />
                    <Input
                      placeholder="Stadt"
                      value={newQuote.service_city}
                      onChange={(e) => setNewQuote({...newQuote, service_city: e.target.value})}
                    />
                  </div>
                </div>

                {/* Quote Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Angebotspositionen</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addQuoteItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Position hinzufügen
                    </Button>
                  </div>
                  
                  {newQuote.quote_items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-4">
                            <Label>Beschreibung</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                              placeholder="Leistungsbeschreibung"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Menge</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateQuoteItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Einheit</Label>
                            <Select value={item.unit} onValueChange={(value) => updateQuoteItem(index, 'unit', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Stück">Stück</SelectItem>
                                <SelectItem value="Stunden">Stunden</SelectItem>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="lfd. Meter">lfd. Meter</SelectItem>
                                <SelectItem value="Pauschale">Pauschale</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label>Einzelpreis (€)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateQuoteItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Label>Gesamt</Label>
                            <div className="text-sm font-medium p-2">
                              {(item.quantity * item.unit_price).toFixed(2)} €
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuoteItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_until">Gültig bis</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={newQuote.valid_until}
                      onChange={(e) => setNewQuote({...newQuote, valid_until: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_rate">MwSt. (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={newQuote.tax_rate}
                      onChange={(e) => setNewQuote({...newQuote, tax_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="terms_conditions">Geschäftsbedingungen</Label>
                  <Textarea
                    id="terms_conditions"
                    value={newQuote.terms_conditions}
                    onChange={(e) => setNewQuote({...newQuote, terms_conditions: e.target.value})}
                    placeholder="Allgemeine Geschäftsbedingungen"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit">
                    Angebot erstellen
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="sent">Versendet</SelectItem>
                <SelectItem value="accepted">Angenommen</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
                <SelectItem value="expired">Abgelaufen</SelectItem>
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

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>Angebotsliste ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Keine Angebote gefunden.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{quote.title}</h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusText(quote.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getServiceTypeText(quote.service_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {quote.quote_number} • Kunde: {quote.customer?.first_name} {quote.customer?.last_name}
                        {quote.customer?.company_name && ` (${quote.customer.company_name})`}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Euro className="mr-1 h-3 w-3" />
                          {quote.total_amount.toFixed(2)} €
                        </span>
                        {quote.valid_until && (
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            Gültig bis: {new Date(quote.valid_until).toLocaleDateString('de-DE')}
                          </span>
                        )}
                        <span>
                          Erstellt: {new Date(quote.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {quote.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuoteStatus(quote.id, 'sent')}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {quote.status === 'sent' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuoteStatus(quote.id, 'accepted')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuoteStatus(quote.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQuote(quote.id)}
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

      {/* Quote Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Angebotsdetails</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Angebotsnummer</Label>
                  <p className="font-mono text-sm">{selectedQuote.quote_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedQuote.status)}>
                    {getStatusText(selectedQuote.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Titel</Label>
                <p className="font-semibold">{selectedQuote.title}</p>
              </div>

              {selectedQuote.description && (
                <div>
                  <Label>Beschreibung</Label>
                  <p className="text-gray-700">{selectedQuote.description}</p>
                </div>
              )}

              {selectedQuote.customer && (
                <div>
                  <Label>Kunde</Label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">
                      {selectedQuote.customer.first_name} {selectedQuote.customer.last_name}
                    </p>
                    {selectedQuote.customer.company_name && (
                      <p className="text-sm text-gray-600">{selectedQuote.customer.company_name}</p>
                    )}
                    <p className="text-sm text-gray-600">{selectedQuote.customer.email}</p>
                  </div>
                </div>
              )}

              {selectedQuote.quote_items && selectedQuote.quote_items.length > 0 && (
                <div>
                  <Label>Angebotspositionen</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Beschreibung</th>
                          <th className="px-4 py-2 text-right">Menge</th>
                          <th className="px-4 py-2 text-right">Einheit</th>
                          <th className="px-4 py-2 text-right">Einzelpreis</th>
                          <th className="px-4 py-2 text-right">Gesamtpreis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuote.quote_items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">{item.unit}</td>
                            <td className="px-4 py-2 text-right">{item.unit_price.toFixed(2)} €</td>
                            <td className="px-4 py-2 text-right font-semibold">{item.total_price.toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t">
                        <tr>
                          <td colSpan="4" className="px-4 py-2 text-right font-semibold">Zwischensumme:</td>
                          <td className="px-4 py-2 text-right font-semibold">{selectedQuote.subtotal.toFixed(2)} €</td>
                        </tr>
                        <tr>
                          <td colSpan="4" className="px-4 py-2 text-right">MwSt. ({selectedQuote.tax_rate}%):</td>
                          <td className="px-4 py-2 text-right">{selectedQuote.tax_amount.toFixed(2)} €</td>
                        </tr>
                        <tr className="border-t">
                          <td colSpan="4" className="px-4 py-2 text-right font-bold">Gesamtsumme:</td>
                          <td className="px-4 py-2 text-right font-bold text-lg">{selectedQuote.total_amount.toFixed(2)} €</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Erstellt am</Label>
                  <p>{new Date(selectedQuote.created_at).toLocaleDateString('de-DE')}</p>
                </div>
                {selectedQuote.valid_until && (
                  <div>
                    <Label>Gültig bis</Label>
                    <p>{new Date(selectedQuote.valid_until).toLocaleDateString('de-DE')}</p>
                  </div>
                )}
              </div>

              {selectedQuote.terms_conditions && (
                <div>
                  <Label>Geschäftsbedingungen</Label>
                  <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
                    {selectedQuote.terms_conditions}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Quotes

