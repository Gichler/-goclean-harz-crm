import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Input } from './ui/input.jsx'
import { Textarea } from './ui/textarea.jsx'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Save,
  Edit
} from 'lucide-react'
import { customerPortalAPI } from '../utils/api.js'

const Profile = ({ customerId }) => {
  const [customer, setCustomer] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchCustomerProfile()
  }, [customerId])

  const fetchCustomerProfile = async () => {
    try {
      // Für Demo-Zwecke verwenden wir Demo-Daten
      const demoData = customerPortalAPI.getDemoData()
      setCustomer(demoData.customer)
      setFormData(demoData.customer)
    } catch (error) {
      console.error('Error fetching customer profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      // Hier würde die API-Aktualisierung stattfinden
      console.log('Saving profile:', formData)
      setCustomer(formData)
      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData(customer)
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Mein Profil</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mein Profil</h2>
          <p className="text-gray-600">Verwalten Sie Ihre persönlichen Daten</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Persönliche Daten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vorname
              </label>
              {editing ? (
                <Input
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Vorname"
                />
              ) : (
                <p className="text-gray-900">{customer.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nachname
              </label>
              {editing ? (
                <Input
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Nachname"
                />
              ) : (
                <p className="text-gray-900">{customer.last_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="E-Mail"
                />
              ) : (
                <p className="text-gray-900">{customer.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              {editing ? (
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Telefon"
                />
              ) : (
                <p className="text-gray-900">{customer.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Firmendaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firmenname
            </label>
            {editing ? (
              <Input
                value={formData.company_name || ''}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Firmenname"
              />
            ) : (
              <p className="text-gray-900">{customer.company_name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Straße
              </label>
              {editing ? (
                <Input
                  value={formData.street || ''}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Straße"
                />
              ) : (
                <p className="text-gray-900">{customer.street}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hausnummer
              </label>
              {editing ? (
                <Input
                  value={formData.house_number || ''}
                  onChange={(e) => handleInputChange('house_number', e.target.value)}
                  placeholder="Hausnummer"
                />
              ) : (
                <p className="text-gray-900">{customer.house_number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PLZ
              </label>
              {editing ? (
                <Input
                  value={formData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="PLZ"
                />
              ) : (
                <p className="text-gray-900">{customer.postal_code}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stadt
            </label>
            {editing ? (
              <Input
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Stadt"
              />
            ) : (
              <p className="text-gray-900">{customer.city}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {editing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Profile
