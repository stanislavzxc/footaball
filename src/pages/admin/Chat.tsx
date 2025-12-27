import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { AdminChat } from "../../components/AdminChat";
import { adminApi } from "../../services/adminApi";

interface ChatUser {
  user_id: number;
  username?: string;
  full_name?: string;
  telegram_id: number;
  last_message_at: string;
  unread_count: number;
}

export default function Chat() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatUserId, setChatUserId] = useState<number | null>(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [unreadSummary, setUnreadSummary] = useState<{
    total_unread_messages: number;
    users_with_unread: number;
  } | null>(null);

  useEffect(() => {
    loadUsers();
    loadUnreadSummary();
  }, [showOnlyUnread]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getChatUsers(showOnlyUnread);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading chat users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadSummary = async () => {
    try {
      const data = await adminApi.getChatUnreadSummary();
      setUnreadSummary(data);
    } catch (error) {
      console.error("Error loading unread summary:", error);
    }
  };

  const handleChatClose = () => {
    setChatUserId(null);
    // Перезагружаем данные после закрытия чата
    loadUsers();
    loadUnreadSummary();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} дн. назад`;
    } else if (diffHours > 0) {
      return `${diffHours} ч. назад`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} мин. назад`;
    }
  };

  return (
    <Layout title="Вопросы от пользователей" showBackButton>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          alignItems: "center",
          paddingBottom: "20px",
        }}
      >
        {/* Сводка */}
        {unreadSummary && (
          <TelegramCard style={{ textAlign: "center", marginBottom: "8px" }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              📊 Сводка по сообщениям
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Непрочитанных сообщений:{" "}
              <strong>{unreadSummary.total_unread_messages}</strong>
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              Пользователей с непрочитанными:{" "}
              <strong>{unreadSummary.users_with_unread}</strong>
            </div>
          </TelegramCard>
        )}

        {/* Фильтр */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <button
            onClick={() => setShowOnlyUnread(false)}
            style={{
              background: !showOnlyUnread
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.3)",
              color: !showOnlyUnread ? "#1E3A8A" : "white",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "8px 12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Все чаты
          </button>
          <button
            onClick={() => setShowOnlyUnread(true)}
            style={{
              background: showOnlyUnread
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.3)",
              color: showOnlyUnread ? "#1E3A8A" : "white",
              border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "8px 12px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Только непрочитанные
          </button>
        </div>

        {loading ? (
          <div
            style={{
              color: "white",
              textAlign: "center",
              fontSize: "1.1rem",
              marginTop: "50px",
            }}
          >
            Загрузка чатов...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              color: "white",
              textAlign: "center",
              fontSize: "1.1rem",
              marginTop: "50px",
              opacity: 0.8,
            }}
          >
            {showOnlyUnread
              ? "Нет непрочитанных сообщений"
              : "Нет сообщений от пользователей"}
          </div>
        ) : (
          users.map((user, index) => (
            <TelegramCard key={user.user_id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        minWidth: "20px",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {index + 1}.
                    </span>
                    <span style={{ fontWeight: "600" }}>
                      @{user.username || user.full_name || "Unknown"}
                    </span>
                    {user.unread_count > 0 && (
                      <span
                        style={{
                          background: "#FF4444",
                          color: "white",
                          borderRadius: "10px",
                          padding: "2px 6px",
                          fontSize: "0.7rem",
                          fontWeight: "600",
                          minWidth: "18px",
                          textAlign: "center",
                        }}
                      >
                        {user.unread_count}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.7,
                      marginBottom: "4px",
                    }}
                  >
                    🆔 Telegram ID: {user.telegram_id}
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.7,
                    }}
                  >
                    ⏰ Последнее сообщение: {formatTime(user.last_message_at)}
                  </div>
                </div>

                <button
                  onClick={() => setChatUserId(user.user_id)}
                  style={{
                    background:
                      user.unread_count > 0
                        ? "rgba(255, 68, 68, 0.2)"
                        : "rgba(255,255,255,0.1)",
                    border:
                      user.unread_count > 0
                        ? "1px solid rgba(255, 68, 68, 0.5)"
                        : "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                    color: user.unread_count > 0 ? "#FF4444" : "white",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  💬 Открыть чат
                </button>
              </div>
            </TelegramCard>
          ))
        )}

        <div style={{ marginTop: "20px" }}>
          <TelegramButton
            onClick={() => navigate("/admin")}
            variant="secondary"
          >
            Назад в админку
          </TelegramButton>
        </div>
      </div>

      {/* Чат с пользователем */}
      {chatUserId && (
        <AdminChat
          isOpen={true}
          onClose={handleChatClose}
          userId={chatUserId}
          isAdminMode={true}
        />
      )}
    </Layout>
  );
}
