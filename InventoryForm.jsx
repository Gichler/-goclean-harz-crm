import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { config } from '@/config'

export function InventoryForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_stock: '',
    minimum_stock: '',
    unit: '',
    supplier: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/inventory/items`, {
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
          name: '',
          category: '',
          current_stock: '',
          minimum_stock: '',
          unit: '',
          supplier: ''
        })
      } else {
        alert('Fehler beim Erstellen des Inventarartikels')
      }
    } catch (error) {
      console.error('Error creating inventory item:', error)
      alert('Fehler beim Erstellen des Inventarartikels')
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
    <Modal isOpen={isOpen} onClose={onClose} title="Neuer Inventarartikel" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="z.B. Reinigungsmittel A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorie
          </label>
          <Input
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="z.B. Verbrauchsmaterialien"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktueller Bestand *
            </label>
            <Input
              name="current_stock"
              type="number"
              value={formData.current_stock}
              onChange={handleChange}
              required
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mindestbestand *
            </label>
            <Input
              name="minimum_stock"
              type="number"
              value={formData.minimum_stock}
              onChange={handleChange}
              required
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Einheit
            </label>
            <Input
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="z.B. Liter, Stück, kg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieferant
            </label>
            <Input
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="z.B. Großhandel XYZ"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Wird erstellt...' : 'Artikel erstellen'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

