import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Badge } from './ui/badge.jsx'
import { CheckCircle, XCircle, RefreshCw, Database, Wifi } from 'lucide-react'
import { customerAPI, orderAPI, quoteAPI, invoiceAPI } from '../utils/api.js'

const ConnectionTest = () => {
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [overallStatus, setOverallStatus] = useState('unknown')

  const testEndpoints = [
    { name: 'Kunden API', test: () => customerAPI.getAll() },
    { name: 'Aufträge API', test: () => orderAPI.getAll() },
    { name: 'Angebote API', test: () => quoteAPI.getAll() },
    { name: 'Rechnungen API', test: () => invoiceAPI.getAll() }
  ]

  const runTests = async () => {
    setLoading(true)
    const results = {}

    for (const endpoint of testEndpoints) {
      try {
        const startTime = Date.now()
        await endpoint.test()
        const endTime = Date.now()
        const responseTime = endTime - startTime

        results[endpoint.name] = {
          status: 'success',
          responseTime,
          message: 'Verbindung erfolgreich'
        }
      } catch (error) {
        results[endpoint.name] = {
          status: 'error',
          responseTime: null,
          message: error.message
        }
      }
    }

    setTestResults(results)
    
    // Gesamtstatus bestimmen
    const allSuccessful = Object.values(results).every(r => r.status === 'success')
    setOverallStatus(allSuccessful ? 'success' : 'error')
    
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status) => {
    if (status === 'success') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (status === 'error') {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />
  }

  const getStatusBadge = (status) => {
    if (status === 'success') {
      return <Badge className="bg-green-100 text-green-800">Online</Badge>
    } else if (status === 'error') {
      return <Badge className="bg-red-100 text-red-800">Offline</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Unbekannt</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verbindungstest</h2>
          <p className="text-gray-600">Testet die Verbindung zum Backend-System</p>
        </div>
        <div className="flex items-center space-x-4">
          {getStatusBadge(overallStatus)}
          <Button onClick={runTests} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Test wiederholen
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wifi className="mr-2 h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Backend Server</p>
                  <p className="text-sm text-gray-600">Flask API auf Port 5000</p>
                </div>
              </div>
              {getStatusBadge(overallStatus)}
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Wifi className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Frontend Client</p>
                  <p className="text-sm text-gray-600">React App auf Port 5173</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint Tests */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testEndpoints.map((endpoint) => {
              const result = testResults[endpoint.name]
              return (
                <div key={endpoint.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result ? getStatusIcon(result.status) : <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />}
                    <div>
                      <p className="font-medium">{endpoint.name}</p>
                      <p className="text-sm text-gray-600">
                        {result ? result.message : 'Test läuft...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {result?.responseTime && (
                      <p className="text-sm text-gray-600">
                        {result.responseTime}ms
                      </p>
                    )}
                    {result && getStatusBadge(result.status)}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      {overallStatus === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Fehlerbehebung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-red-700">
              <p>• Stellen Sie sicher, dass das Backend läuft: <code className="bg-red-100 px-2 py-1 rounded">python main.py</code></p>
              <p>• Überprüfen Sie, ob Port 5000 verfügbar ist</p>
              <p>• Kontrollieren Sie die Backend-Logs auf Fehler</p>
              <p>• Stellen Sie sicher, dass alle Python-Abhängigkeiten installiert sind</p>
              <p>• Überprüfen Sie die Firewall-Einstellungen</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {overallStatus === 'success' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ Alle Tests erfolgreich!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Die Verbindung zwischen Frontend und Backend funktioniert einwandfrei. 
              Alle API-Endpunkte sind erreichbar und das System ist bereit für die Nutzung.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ConnectionTest
