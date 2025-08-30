import { useState, useEffect } from 'react'
import { Receipt, Euro, Calendar, User, Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { config } from '@/config'

export function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/invoices`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rechnungen</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Rechnungen und Zahlungen</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          <span>Neue Rechnung</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Rechnungen suchen..." className="pl-10" />
        </div>
        <div className="text-sm text-gray-500">
          {invoices.length} Rechnungen
        </div>
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Keine Rechnungen gefunden.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>Erste Rechnung erstellen</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {invoice.invoice_number || `Rechnung #${invoice.id}`}
                  </h3>
                  <p className="text-sm text-gray-600">{invoice.description || 'Rechnung'}</p>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status === 'draft' ? 'Entwurf' :
                   invoice.status === 'sent' ? 'Versendet' :
                   invoice.status === 'paid' ? 'Bezahlt' : 'Überfällig'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {invoice.customer_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{invoice.customer_name}</span>
                  </div>
                )}
                {invoice.due_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Fällig: {new Date(invoice.due_date).toLocaleDateString('de-DE')}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Euro className="w-4 h-4 mr-2" />
                  <span>€{parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InvoiceForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          fetchInvoices()
          alert('Rechnung erfolgreich erstellt!')
        }}
      />
    </div>
  )
}
