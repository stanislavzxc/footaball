import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { showNotification } from "../../utils/api";

interface User {
  id: number;
  username?: string;
  full_name?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    recipients: '',
    message: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const parseRecipients = (recipientsStr: string): number[] => {
    // Парсим строку вида "@username @username2 ..." в массив user_id
    const usernames = recipientsStr
      .split(' ')
      .map(u => u.trim().replace('@', ''))
      .filter(u => u.length > 0);

    const userIds: number[] = [];
    
    usernames.forEach(username => {
      const user = users.find(u => u.username === username);
      if (user) {
        userIds.push(user.id);
      }
    });

    return userIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userIds = parseRecipients(formData.recipients);
      
      if (userIds.length === 0) {
        showNotification('Не найдены пользователи с указанными именами', 'error');
        return;
      }

      await adminApi.sendNotification({
        user_ids: userIds,
        message: formData.message,
        notification_type: 'admin'
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error sending notification:', error);
      showNotification('Ошибка при отправке уведомления', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!formData.message.trim()) {
      showNotification('Введите текст сообщения', 'error');
      return;
    }

    if (!window.confirm('Отправить сообщение всем пользователям?')) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.broadcastNotification(formData.message, false);
      setSuccess(true);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      showNotification('Ошибка при отправке уведомления', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout title="Уведомление отправлено" showBackButton>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          paddingTop: '40px',
          paddingBottom: '20px',
          gap: '20px'
        }}>
          <TelegramCard style={{ 
            textAlign: 'center',
            padding: '32px 24px',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px' }}>
              Оповещение успешно отправлено
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.4' }}>
              Уведомление доставлено указанным пользователям
            </div>
          </TelegramCard>
          
          <TelegramButton onClick={() => navigate('/admin')}>
            Назад в админку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Оповещение игроков">
      <div className="notifications-container">
        <form onSubmit={handleSubmit} className="notification-form">
          <div className="form-group">
            <label htmlFor="recipients">
              Введите список, кому будет отправлено оповещение
            </label>
            <input
              type="text"
              id="recipients"
              name="recipients"
              value={formData.recipients}
              onChange={handleInputChange}
              placeholder="@username @username2 @username3 ..."
              required
            />
            <small className="form-hint">
              Формат: @username @username2 ... @username (через пробел)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="message">Введите текст оповещения</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={6}
              placeholder="Текст уведомления для игроков..."
              required
            />
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            alignItems: 'center',
            marginTop: '20px'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '48px',
                background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                border: '2px solid rgba(255,255,255,0.8)',
                borderRadius: '24px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Отправка...' : 'Выслать оповещение'}
            </button>

            <button
              type="button"
              onClick={handleBroadcast}
              disabled={loading || !formData.message.trim()}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '48px',
                background: 'rgba(255,165,0,0.1)',
                border: '2px solid rgba(255,165,0,0.8)',
                borderRadius: '24px',
                color: '#FFA500',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (loading || !formData.message.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                opacity: (loading || !formData.message.trim()) ? 0.5 : 1
              }}
            >
              Отправить всем
            </button>
          </div>
        </form>

        <div className="users-reference">
          <h4>Доступные пользователи:</h4>
          <div className="users-list">
            {users.slice(0, 20).map(user => (
              <span key={user.id} className="user-tag">
                @{user.username || user.full_name}
              </span>
            ))}
            {users.length > 20 && (
              <span className="more-users">и ещё {users.length - 20}...</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <TelegramButton
            onClick={() => navigate('/admin')}
            variant="secondary"
          >
            Назад в админку
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}