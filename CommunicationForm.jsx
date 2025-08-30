import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { config } from '@/config'

export function CommunicationForm({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'email',
    subject: '',
    content: '',
    date: new Date().toISOString().slice(0, 16),
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
      const response = await fetch(`${config.API_BASE_URL}/api/communications`, {
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
          type: 'email',
          subject: '',
          content: '',
          date: new Date().toISOString().slice(0, 16),
        })
      } else {
        alert('Fehler beim Erstellen der Kommunikation')
      }
    } catch (error) {
      console.error('Error creating communication:', error)
      alert('Fehler beim Erstellen der Kommunikation')
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
    <Modal isOpen={isOpen} onClose={onClose} title="Neue Kommunikation" maxWidth="max-w-2xl">
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
            Typ *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">E-Mail</option>
            <option value="phone_call">Telefonanruf</option>
            <option value="meeting">Meeting</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Betreff
          </label>
          <Input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Betreff der Kommunikation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inhalt *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={5}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detaillierter Inhalt der Kommunikation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum und Uhrzeit *
          </label>
          <Input
            name="date"
            type="datetime-local"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Wird erstellt...' : 'Kommunikation erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

