import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Plus, Search, Edit, Eye, Package, AlertTriangle, TrendingUp, BarChart3, PlusCircle, MinusCircle } from 'lucide-react'

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    quantity: 0,
    unit: 'Stück',
    unit_price: 0.0,
    reorder_point: 0,
    supplier: '',
    location: '',
    status: 'active'
  })
  const [adjustmentData, setAdjustmentData] = useState({
    quantity_change: 0,
    transaction_type: 'adjustment',
    notes: ''
  })

  useEffect(() => {
    fetchInventory()
  }, [categoryFilter, statusFilter, lowStockFilter])

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.append('category', categoryFilter)
      if (statusFilter) params.append('status', statusFilter)
      if (lowStockFilter) params.append('low_stock', 'true')
      params.append('per_page', '50')

      const response = await fetch(`/api/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInventoryItems(data.inventory_items)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          quantity: parseInt(newItem.quantity),
          unit_price: parseFloat(newItem.unit_price),
          reorder_point: parseInt(newItem.reorder_point)
        }),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewItem({
          name: '',
          description: '',
          category: '',
          sku: '',
          quantity: 0,
          unit: 'Stück',
          unit_price: 0.0,
          reorder_point: 0,
          supplier: '',
          location: '',
          status: 'active'
        })
        fetchInventory()
      }
    } catch (error) {
      console.error('Error adding inventory item:', error)
    }
  }

  const handleAdjustQuantity = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/inventory/${selectedItem.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adjustmentData,
          quantity_change: parseInt(adjustmentData.quantity_change),
          user_id: 1 // Default user ID
        }),
      })

      if (response.ok) {
        setShowAdjustDialog(false)
        setAdjustmentData({
          quantity_change: 0,
          transaction_type: 'adjustment',
          notes: ''
        })
        fetchInventory()
      }
    } catch (error) {
      console.error('Error adjusting inventory quantity:', error)
    }
  }

  const handleViewItem = async (itemId) => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`)
      if (response.ok) {
        const item = await response.json()
        setSelectedItem(item)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching inventory item details:', error)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Artikel löschen möchten?')) {
      try {
        const response = await fetch(`/api/inventory/${itemId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchInventory()
        }
      } catch (error) {
        console.error('Error deleting inventory item:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { variant: 'default', text: 'Aktiv' },
      'inactive': { variant: 'outline', text: 'Inaktiv' },
      'discontinued': { variant: 'destructive', text: 'Eingestellt' }
    }
    
    const config = statusConfig[status] || { variant: 'outline', text: status }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getStockBadge = (quantity, reorderPoint) => {
    if (quantity <= 0) {
      return <Badge variant="destructive">Ausverkauft</Badge>
    } else if (quantity <= reorderPoint) {
      return <Badge variant="destructive">Niedriger Bestand</Badge>
    } else {
      return <Badge variant="default">Verfügbar</Badge>
    }
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
        <div className="text-gray-500">Lade Lagerbestand...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lagerverwaltung</h1>
          <p className="text-gray-600">Verwalten Sie Ihren Lagerbestand und Materialien</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Artikel
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
                placeholder="Artikelname, SKU..."
                className="mt-1"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Kategorien</SelectItem>
                  <SelectItem value="Reinigungsmittel">Reinigungsmittel</SelectItem>
                  <SelectItem value="Werkzeuge">Werkzeuge</SelectItem>
                  <SelectItem value="Ersatzteile">Ersatzteile</SelectItem>
                  <SelectItem value="Schutzausrüstung">Schutzausrüstung</SelectItem>
                  <SelectItem value="Verbrauchsmaterial">Verbrauchsmaterial</SelectItem>
                  <SelectItem value="Maschinen">Maschinen</SelectItem>
                  <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                  <SelectItem value="discontinued">Eingestellt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={lowStockFilter ? "default" : "outline"}
                onClick={() => setLowStockFilter(!lowStockFilter)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Niedriger Bestand
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Artikel</CardTitle>
          <CardDescription>
            {inventoryItems.length} Artikel gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.category} • SKU: {item.sku}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{item.quantity} {item.unit}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(item.unit_price)} pro {item.unit}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</div>
                  <div className="text-sm text-gray-500">Gesamtwert</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStockBadge(item.quantity, item.reorder_point)}
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewItem(item.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item)
                      setShowAdjustDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {inventoryItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Artikel gefunden
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuen Artikel erstellen</DialogTitle>
            <DialogDescription>
              Fügen Sie einen neuen Artikel zum Lager hinzu
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Artikelname *</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Artikelname"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                  placeholder="Stock Keeping Unit"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Artikelbeschreibung..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategorie *</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reinigungsmittel">Reinigungsmittel</SelectItem>
                    <SelectItem value="Werkzeuge">Werkzeuge</SelectItem>
                    <SelectItem value="Ersatzteile">Ersatzteile</SelectItem>
                    <SelectItem value="Schutzausrüstung">Schutzausrüstung</SelectItem>
                    <SelectItem value="Verbrauchsmaterial">Verbrauchsmaterial</SelectItem>
                    <SelectItem value="Maschinen">Maschinen</SelectItem>
                    <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit">Einheit</Label>
                <Select
                  value={newItem.unit}
                  onValueChange={(value) => setNewItem({...newItem, unit: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stück">Stück</SelectItem>
                    <SelectItem value="Liter">Liter</SelectItem>
                    <SelectItem value="Kilogramm">Kilogramm</SelectItem>
                    <SelectItem value="Meter">Meter</SelectItem>
                    <SelectItem value="Packung">Packung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Anfangsbestand</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="unit_price">Einzelpreis (€)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({...newItem, unit_price: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="reorder_point">Mindestbestand</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  min="0"
                  value={newItem.reorder_point}
                  onChange={(e) => setNewItem({...newItem, reorder_point: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Lieferant</Label>
                <Input
                  id="supplier"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                  placeholder="Lieferantenname"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Lagerort</Label>
                <Input
                  id="location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  placeholder="Regal, Bereich..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Artikel erstellen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Quantity Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bestand anpassen</DialogTitle>
            <DialogDescription>
              Passen Sie den Bestand für {selectedItem?.name} an
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAdjustQuantity} className="space-y-4">
            <div>
              <Label htmlFor="transaction_type">Transaktionstyp</Label>
              <Select
                value={adjustmentData.transaction_type}
                onValueChange={(value) => setAdjustmentData({...adjustmentData, transaction_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Zugang</SelectItem>
                  <SelectItem value="out">Abgang</SelectItem>
                  <SelectItem value="adjustment">Korrektur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity_change">Menge</Label>
              <Input
                id="quantity_change"
                type="number"
                min="0"
                value={adjustmentData.quantity_change}
                onChange={(e) => setAdjustmentData({...adjustmentData, quantity_change: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={adjustmentData.notes}
                onChange={(e) => setAdjustmentData({...adjustmentData, notes: e.target.value})}
                placeholder="Grund für die Anpassung..."
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdjustDialog(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Bestand anpassen</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Artikeldetails</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zum Artikel
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Artikelname</Label>
                  <div className="font-medium">{selectedItem.name}</div>
                </div>
                <div>
                  <Label>SKU</Label>
                  <div>{selectedItem.sku || 'N/A'}</div>
                </div>
                <div>
                  <Label>Kategorie</Label>
                  <div>{selectedItem.category}</div>
                </div>
                <div>
                  <Label>Einheit</Label>
                  <div>{selectedItem.unit}</div>
                </div>
                <div>
                  <Label>Bestand</Label>
                  <div className="font-medium">{selectedItem.quantity} {selectedItem.unit}</div>
                </div>
                <div>
                  <Label>Einzelpreis</Label>
                  <div>{formatCurrency(selectedItem.unit_price)}</div>
                </div>
                <div>
                  <Label>Gesamtwert</Label>
                  <div className="font-medium">{formatCurrency(selectedItem.quantity * selectedItem.unit_price)}</div>
                </div>
                <div>
                  <Label>Mindestbestand</Label>
                  <div>{selectedItem.reorder_point} {selectedItem.unit}</div>
                </div>
                <div>
                  <Label>Lieferant</Label>
                  <div>{selectedItem.supplier || 'N/A'}</div>
                </div>
                <div>
                  <Label>Lagerort</Label>
                  <div>{selectedItem.location || 'N/A'}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedItem.status)}</div>
                </div>
              </div>
              
              {selectedItem.description && (
                <div>
                  <Label>Beschreibung</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded">{selectedItem.description}</div>
                </div>
              )}
              
              {selectedItem.recent_transactions && selectedItem.recent_transactions.length > 0 && (
                <div>
                  <Label>Letzte Transaktionen</Label>
                  <div className="mt-2 space-y-2">
                    {selectedItem.recent_transactions.map((trans, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>{trans.transaction_type}</span>
                        <span>{trans.quantity} {selectedItem.unit}</span>
                        <span>{new Date(trans.transaction_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    ))}
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

export default Inventory

