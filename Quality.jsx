import { useState, useEffect } from 'react'
import { Shield, Star, CheckCircle, AlertTriangle, Plus, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QualityForm } from '@/components/forms/QualityForm'
import { config } from '@/config'

export function Quality() {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/quality/inspections`)
      if (response.ok) {
        const data = await response.json()
        setInspections(data)
      }
    } catch (error) {
      console.error('Error fetching inspections:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
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
          <h1 className="text-3xl font-bold text-gray-900">Qualitätskontrolle</h1>
          <p className="text-gray-600">Verwalten Sie Qualitätsprüfungen und Inspektionen</p>
        </div>
        <Button className="flex items-center space-x-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          <span>Neue Prüfung</span>
        </Button>
      </div>

      {inspections.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Keine Qualitätsprüfungen gefunden.</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>Erste Prüfung erstellen</Button>
        </div>
      )}

      <QualityForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          fetchInspections()
          alert("Qualitätsprüfung erfolgreich erstellt!")
        }}
      />
    </div>
  )
}
