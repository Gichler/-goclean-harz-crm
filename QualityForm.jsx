import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { config } from '@/config'

export function QualityForm({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    customer_id: '',
    inspection_date: new Date().toISOString().slice(0, 16),
    inspector_name: '',
    rating: 5,
    notes: '',
    status: 'completed'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
    }
  }, [isOpen])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/customers`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/quality/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        onClose()
        setFormData({
          customer_id: '',
          inspection_date: new Date().toISOString().slice(0, 16),
          inspector_name: '',
          rating: 5,
          notes: '',
          status: 'completed'
        })
      } else {
        alert('Fehler beim Erstellen der Qualitätsprüfung')
      }
    } catch (error) {
      console.error('Error creating quality inspection:', error)
      alert('Fehler beim Erstellen der Qualitätsprüfung')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Neue Qualitätsprüfung" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kunde *
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Kunde auswählen</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name} {customer.company && `(${customer.company})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inspektionsdatum und -uhrzeit *
          </label>
          <Input
            name="inspection_date"
            type="datetime-local"
            value={formData.inspection_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inspektor Name *
          </label>
          <Input
            name="inspector_name"
            value={formData.inspector_name}
            onChange={handleChange}
            required
            placeholder="Max Mustermann"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bewertung (1-5) *
          </label>
          <Input
            name="rating"
            type="number"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notizen
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Zusätzliche Notizen zur Inspektion..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="completed">Abgeschlossen</option>
            <option value="pending">Ausstehend</option>
            <option value="failed">Fehlgeschlagen</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Wird erstellt...' : 'Qualitätsprüfung erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

