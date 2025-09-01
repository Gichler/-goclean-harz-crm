// API-Konfiguration für das Kundenportal
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Zentrale API-Funktionen für das Kundenportal
export const customerPortalAPI = {
  // Kunden-spezifische Endpunkte
  getCustomerOrders: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/orders`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  getCustomerInvoices: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/invoices`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  getCustomerProfile: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/profile`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  updateCustomerProfile: async (customerId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  getCustomerMessages: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/messages`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  sendMessage: async (customerId, messageData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/${customerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  // Fallback für Demo-Zwecke
  getDemoData: () => {
    return {
      customer: {
        id: 1,
        first_name: "Max",
        last_name: "Mustermann",
        email: "max@mustermann.de",
        phone: "+49 123 456789",
        company_name: "Mustermann GmbH",
        street: "Musterstraße",
        house_number: "123",
        postal_code: "12345",
        city: "Musterstadt"
      },
      orders: [
        {
          id: 1,
          order_number: "A-2024-001",
          service_type: "reinigung",
          status: "in_progress",
          scheduled_date: "2024-01-15",
          estimated_duration: 120,
          price: 150.00,
          notes: "Büroreinigung - Besondere Aufmerksamkeit auf Konferenzraum"
        },
        {
          id: 2,
          order_number: "A-2024-002",
          service_type: "gartenpflege",
          status: "pending",
          scheduled_date: "2024-01-20",
          estimated_duration: 180,
          price: 200.00,
          notes: "Frühjahrsputz im Garten"
        },
        {
          id: 3,
          order_number: "A-2024-003",
          service_type: "winterdienst",
          status: "completed",
          scheduled_date: "2024-01-10",
          estimated_duration: 90,
          price: 120.00,
          notes: "Schneeräumung und Streuen"
        }
      ],
      invoices: [
        {
          id: 1,
          invoice_number: "RE-2024-001",
          total_amount: 150.00,
          status: "paid",
          due_date: "2024-01-30",
          created_at: "2024-01-01"
        },
        {
          id: 2,
          invoice_number: "RE-2024-002",
          total_amount: 200.00,
          status: "unpaid",
          due_date: "2024-02-15",
          created_at: "2024-01-15"
        },
        {
          id: 3,
          invoice_number: "RE-2024-003",
          total_amount: 120.00,
          status: "overdue",
          due_date: "2024-01-05",
          created_at: "2024-01-01"
        }
      ],
      messages: [
        {
          id: 1,
          subject: "Terminbestätigung",
          content: "Ihr Termin am 15.01.2024 wurde bestätigt.",
          type: "email",
          created_at: "2024-01-10"
        },
        {
          id: 2,
          subject: "Rechnung RE-2024-002",
          content: "Ihre Rechnung für die Gartenpflege ist verfügbar.",
          type: "notification",
          created_at: "2024-01-15"
        },
        {
          id: 3,
          subject: "Auftrag abgeschlossen",
          content: "Ihr Winterdienst-Auftrag wurde erfolgreich abgeschlossen.",
          type: "email",
          created_at: "2024-01-12"
        }
      ]
    }
  }
}
