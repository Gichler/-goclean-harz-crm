import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { config } from '@/config'

export function CustomerForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    customer_type: 'private'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/customers`, {
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
          first_name: '',
          last_name: '',
          company: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postal_code: '',
          customer_type: 'private'
        })
      } else {
        alert('Fehler beim Erstellen des Kunden')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Fehler beim Erstellen des Kunden')
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
    <Modal isOpen={isOpen} onClose={onClose} title="Neuer Kunde" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname *
            </label>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              placeholder="Max"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname *
            </label>
            <Input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unternehmen
          </label>
          <Input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Mustermann GmbH (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="max@mustermann.de"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+49 123 456789"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Musterstraße 123"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stadt
            </label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Musterstadt"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PLZ
            </label>
            <Input
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="12345"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kundentyp
          </label>
          <select
            name="customer_type"
            value={formData.customer_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="private">Privatkunde</option>
            <option value="business">Geschäftskunde</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Wird erstellt...' : 'Kunde erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

