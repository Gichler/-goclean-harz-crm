import { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockIcon = (status) => {
    switch (status) {
      case 'low': return AlertTriangle
      case 'normal': return TrendingDown
      case 'high': return TrendingUp
      default: return Package
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lager</h1>
        <p className="text-gray-600">Verwalten Sie Ihren Bestand und Ihre Lieferanten</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const StatusIcon = getStockIcon(item.stock_status)
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <StatusIcon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bestand:</span>
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mindestbestand:</span>
                    <span>{item.min_stock} {item.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preis:</span>
                    <span>€{parseFloat(item.price || 0).toFixed(2)}</span>
                  </div>
                  {item.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lagerort:</span>
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStockStatusColor(item.stock_status)}>
                    {item.stock_status === 'low' ? 'Niedrig' :
                     item.stock_status === 'normal' ? 'Normal' : 'Hoch'}
                  </Badge>
                  {item.supplier_name && (
                    <span className="text-xs text-gray-500">{item.supplier_name}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Keine Lagerartikel gefunden.</p>
        </div>
      )}
    </div>
  )
}

