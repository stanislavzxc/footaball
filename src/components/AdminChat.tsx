import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { showNotification } from "../utils/api";
import type { ChatMessage } from "../types";

interface AdminChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  isAdminMode?: boolean; // Новый проп для определения режима
}

export function AdminChat({ isOpen, onClose, userId, isAdminMode = false }: AdminChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const url = isAdminMode 
        ? `/admin/chat/history/${userId}` 
        : `/chat/history/${userId}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Добавляем заголовки авторизации для админского режима
      if (isAdminMode) {
        const telegramId = localStorage.getItem("admin_telegram_id");
        const adminToken = localStorage.getItem("admin_token");
        
        if (telegramId) {
          headers["X-Telegram-User-Id"] = telegramId;
        } else if (adminToken) {
          headers["Authorization"] = `Bearer ${adminToken}`;
        }
      }
      
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load chat history:', response.status, response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      // Добавляем сообщение локально (оптимистичное обновление)
      const userMessage: ChatMessage = {
        id: Date.now(),
        text: messageText,
        isAdmin: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Отправляем сообщение через соответствующий API
      const url = isAdminMode 
        ? `/admin/chat/send/${userId}` 
        : '/chat/send';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Добавляем заголовки авторизации для админского режима
      if (isAdminMode) {
        const telegramId = localStorage.getItem("admin_telegram_id");
        const adminToken = localStorage.getItem("admin_token");
        
        if (telegramId) {
          headers["X-Telegram-User-Id"] = telegramId;
        } else if (adminToken) {
          headers["Authorization"] = `Bearer ${adminToken}`;
        }
      }
      
      const body = isAdminMode 
        ? JSON.stringify({ message_text: messageText })
        : JSON.stringify({ message_text: messageText, telegram_id: userId });
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      if (response.ok) {
        showNotification("Сообщение отправлено", "success");
        
        // Перезагружаем историю чата для получения актуальных данных
        await loadChatHistory();
      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      showNotification("Ошибка при отправке сообщения", "error");
      
      // Убираем сообщение из чата при ошибке
      setMessages(prev => prev.filter(msg => msg.id !== Date.now()));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '90%',
        maxWidth: '400px',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #eee',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
            {isAdminMode ? 'Ответ пользователю' : 'Чат с администратором'}
          </h3>
        </div>

        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: '40px'
            }}>
              <p>Начните диалог с администратором</p>
              <p>Мы ответим вам в ближайшее время</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.isAdmin ? 'flex-start' : 'flex-end',
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: message.isAdmin ? '#f0f0f0' : '#007bff',
                  color: message.isAdmin ? '#333' : 'white'
                }}>
                  {message.isAdmin && message.sender_name && (
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                      {message.sender_name}
                    </div>
                  )}
                  <div style={{ marginBottom: '4px' }}>{message.text}</div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.7,
                    textAlign: 'right'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          padding: '16px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end'
          }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваше сообщение..."
              rows={2}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !newMessage.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {loading ? '...' : 'Отправить'}
            </Button>
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center'
        }}>
          <p style={{ margin: '4px 0' }}>💬 Ваши сообщения будут переданы администратору</p>
          <p style={{ margin: '4px 0' }}>⏰ Обычно отвечаем в течение нескольких часов</p>
        </div>

        <div style={{
          padding: '16px',
          borderTop: '1px solid #eee'
        }}>
          <Button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
}