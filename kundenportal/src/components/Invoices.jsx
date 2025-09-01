import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Badge } from './ui/badge.jsx'
import { Button } from './ui/button.jsx'
import { 
  Receipt, 
  Download, 
  Eye, 
  DollarSign,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { customerPortalAPI } from '../utils/api.js'

const Invoices = ({ customerId }) => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchInvoices()
  }, [customerId])

  const fetchInvoices = async () => {
    try {
      // Für Demo-Zwecke verwenden wir Demo-Daten
      const demoData = customerPortalAPI.getDemoData()
      setInvoices(demoData.invoices)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'paid': { label: 'Bezahlt', className: 'bg-green-100 text-green-800' },
      'unpaid': { label: 'Offen', className: 'bg-red-100 text-red-800' },
      'overdue': { label: 'Überfällig', className: 'bg-orange-100 text-orange-800' }
    }
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true
    return invoice.status === filter
  })

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const unpaidAmount = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, invoice) => sum + invoice.total_amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Meine Rechnungen</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Meine Rechnungen</h2>
          <p className="text-gray-600">Übersicht über alle Ihre Rechnungen</p>
        </div>
        <Button onClick={fetchInvoices} variant="outline">
          Aktualisieren
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamtbetrag</p>
                <p className="text-2xl font-bold text-gray-900">{totalAmount.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offene Beträge</p>
                <p className="text-2xl font-bold text-red-600">{unpaidAmount.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Anzahl Rechnungen</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              Alle ({invoices.length})
            </Button>
            <Button 
              variant={filter === 'unpaid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unpaid')}
            >
              Offen ({invoices.filter(i => i.status === 'unpaid').length})
            </Button>
            <Button 
              variant={filter === 'paid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('paid')}
            >
              Bezahlt ({invoices.filter(i => i.status === 'paid').length})
            </Button>
            <Button 
              variant={filter === 'overdue' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('overdue')}
            >
              Überfällig ({invoices.filter(i => i.status === 'overdue').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Rechnungen gefunden</h3>
              <p className="text-gray-600">Sie haben noch keine Rechnungen in diesem Status.</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100' :
                      invoice.status === 'overdue' ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Erstellt: {invoice.created_at}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Fällig: {invoice.due_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Betrag: {invoice.total_amount}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Anzeigen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default Invoices
