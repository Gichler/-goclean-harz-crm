import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Input } from './ui/input.jsx'
import { Textarea } from './ui/textarea.jsx'
import { Badge } from './ui/badge.jsx'
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Bell,
  Plus
} from 'lucide-react'
import { customerPortalAPI } from '../utils/api.js'

const Messages = ({ customerId }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [customerId])

  const fetchMessages = async () => {
    try {
      // Für Demo-Zwecke verwenden wir Demo-Daten
      const demoData = customerPortalAPI.getDemoData()
      setMessages(demoData.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    try {
      // Hier würde die API-Aktualisierung stattfinden
      const messageData = {
        id: messages.length + 1,
        subject: newMessage.subject,
        content: newMessage.content,
        type: 'outgoing',
        created_at: new Date().toISOString().split('T')[0]
      }
      
      setMessages(prev => [messageData, ...prev])
      setNewMessage({ subject: '', content: '' })
      setShowNewMessage(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const getMessageIcon = (type) => {
    return type === 'email' ? <Mail className="h-5 w-5" /> : <Bell className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Nachrichten</h2>
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
          <h2 className="text-2xl font-bold text-gray-900">Nachrichten</h2>
          <p className="text-gray-600">Kommunikation mit GoClean Harz</p>
        </div>
        <Button onClick={() => setShowNewMessage(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Nachricht
        </Button>
      </div>

      {/* New Message Form */}
      {showNewMessage && (
        <Card>
          <CardHeader>
            <CardTitle>Neue Nachricht senden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Betreff
              </label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Betreff der Nachricht"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nachricht
              </label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Ihre Nachricht..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowNewMessage(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.subject || !newMessage.content}>
                <Send className="h-4 w-4 mr-2" />
                Senden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Nachrichten</h3>
              <p className="text-gray-600">Sie haben noch keine Nachrichten erhalten.</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${
                    message.type === 'outgoing' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {getMessageIcon(message.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                      <Badge variant={message.type === 'outgoing' ? 'default' : 'secondary'}>
                        {message.type === 'outgoing' ? 'Gesendet' : 'Empfangen'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{message.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{message.created_at}</span>
                      <span className="capitalize">{message.type}</span>
                    </div>
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

export default Messages
