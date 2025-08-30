import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin } from 'lucide-react'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [customerType, setCustomerType] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    company_name: '',
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
    customer_type: 'private',
    preferred_contact_method: 'email'
  })

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, customerType])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (customerType) params.append('customer_type', customerType)
      params.append('per_page', '50')

      const response = await fetch(`/api/customers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewCustomer({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          mobile: '',
          company_name: '',
          street: '',
          house_number: '',
          postal_code: '',
          city: '',
          customer_type: 'private',
          preferred_contact_method: 'email'
        })
        fetchCustomers()
      }
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleViewCustomer = async (customerId) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const customer = await response.json()
        setSelectedCustomer(customer)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
  }

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'business':
        return 'bg-blue-100 text-blue-800'
      case 'private':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kunden</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Kunden</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Kundendaten</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Kunde
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
              <DialogDescription>
                Geben Sie die Kundendaten ein, um einen neuen Kunden zu erstellen.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Vorname *</Label>
                  <Input
                    id="first_name"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nachname *</Label>
                  <Input
                    id="last_name"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobil</Label>
                  <Input
                    id="mobile"
                    value={newCustomer.mobile}
                    onChange={(e) => setNewCustomer({...newCustomer, mobile: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company_name">Firmenname</Label>
                <Input
                  id="company_name"
                  value={newCustomer.company_name}
                  onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="street">Straße</Label>
                  <Input
                    id="street"
                    value={newCustomer.street}
                    onChange={(e) => setNewCustomer({...newCustomer, street: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="house_number">Hausnummer</Label>
                  <Input
                    id="house_number"
                    value={newCustomer.house_number}
                    onChange={(e) => setNewCustomer({...newCustomer, house_number: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">PLZ</Label>
                  <Input
                    id="postal_code"
                    value={newCustomer.postal_code}
                    onChange={(e) => setNewCustomer({...newCustomer, postal_code: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_type">Kundentyp</Label>
                  <Select value={newCustomer.customer_type} onValueChange={(value) => setNewCustomer({...newCustomer, customer_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Privatkunde</SelectItem>
                      <SelectItem value="business">Geschäftskunde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferred_contact_method">Bevorzugter Kontakt</Label>
                  <Select value={newCustomer.preferred_contact_method} onValueChange={(value) => setNewCustomer({...newCustomer, preferred_contact_method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="phone">Telefon</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Kunde hinzufügen
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Kunden suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={customerType} onValueChange={setCustomerType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Kundentyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Typen</SelectItem>
                <SelectItem value="private">Privatkunden</SelectItem>
                <SelectItem value="business">Geschäftskunden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Kundenliste ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Keine Kunden gefunden.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {customer.first_name[0]}{customer.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </h3>
                        <Badge className={getCustomerTypeColor(customer.customer_type)}>
                          {customer.customer_type === 'business' ? 'Geschäft' : 'Privat'}
                        </Badge>
                      </div>
                      {customer.company_name && (
                        <p className="text-sm text-gray-600">{customer.company_name}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {customer.email}
                        </span>
                        {customer.phone && (
                          <span className="flex items-center">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                        {(customer.street || customer.city) && (
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {customer.street} {customer.house_number}, {customer.postal_code} {customer.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCustomer(customer.id)}
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

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kundendetails</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kundennummer</Label>
                  <p className="font-mono text-sm">{selectedCustomer.customer_number}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={selectedCustomer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedCustomer.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p>{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                </div>
                <div>
                  <Label>Kundentyp</Label>
                  <p>{selectedCustomer.customer_type === 'business' ? 'Geschäftskunde' : 'Privatkunde'}</p>
                </div>
              </div>

              {selectedCustomer.company_name && (
                <div>
                  <Label>Firmenname</Label>
                  <p>{selectedCustomer.company_name}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>E-Mail</Label>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label>Bevorzugter Kontakt</Label>
                  <p>{selectedCustomer.preferred_contact_method}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefon</Label>
                  <p>{selectedCustomer.phone || 'Nicht angegeben'}</p>
                </div>
                <div>
                  <Label>Mobil</Label>
                  <p>{selectedCustomer.mobile || 'Nicht angegeben'}</p>
                </div>
              </div>

              <div>
                <Label>Adresse</Label>
                <p>
                  {selectedCustomer.street} {selectedCustomer.house_number}<br />
                  {selectedCustomer.postal_code} {selectedCustomer.city}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Erstellt am</Label>
                  <p>{new Date(selectedCustomer.created_at).toLocaleDateString('de-DE')}</p>
                </div>
                <div>
                  <Label>Zuletzt aktualisiert</Label>
                  <p>{new Date(selectedCustomer.updated_at).toLocaleDateString('de-DE')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Customers

