import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { api } from "../services/api";
import { CancelModal } from "../components/CancelModal";
import { CheckPaymentButton } from "../components/CheckPaymentButton";
import { TelegramCard } from "../components/TelegramCard";
import { TelegramButton } from "../components/TelegramButton";
import { TelegramLoader } from "../components/TelegramLoader";
import { formatTime } from "../utils/api";

interface Match {
  id: number;
  date: string;
  start_time: string;
  venue: {
    name: string;
    address: string;
  };
  status: string;
  price: number;
}

interface Registration {
  id: number;
  match_id: number;
  type: string;
  registered_at: string;
  payment_status?: string;
  match: Match;
}

export default function MyRegistrations() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const data = await api.getMyRegistrations();
        setRegistrations(data || []);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const handleCancelClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedRegistration) return;

    try {
      await api.cancelRegistration(selectedRegistration.match_id);
      // Обновляем список после отмены
      const updatedData = await api.getMyRegistrations();
      setRegistrations(updatedData || []);
      setShowCancelModal(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error("Error cancelling registration:", error);
    }
  };

  const now = new Date();
  const upcomingRegistrations = registrations.filter(
    (reg) => new Date(reg.match.start_time) > now
  );
  const pastRegistrations = registrations
    .filter(
      (reg) =>
        new Date(reg.match.start_time) <= now && reg.payment_status === "paid" // Показываем только успешно оплаченные матчи
    )
    .slice(0, 3); // Ограничиваем до 2-3 последних матчей согласно ТЗ

  const currentRegistrations =
    activeTab === "upcoming" ? upcomingRegistrations : pastRegistrations;

  if (loading) {
    return (
      <Layout title="Мои записи" showBackButton>
        <TelegramLoader message="Загрузка записей..." />
      </Layout>
    );
  }

  return (
    <Layout title="Мои записи" showBackButton>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          minHeight: 0,
        }}
      >
        {/* Фиксированные вкладки */}
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: "320px",
            marginBottom: "15px",
            borderRadius: "24px",
            overflow: "hidden",
            border: "2px solid rgba(0,0,0,0.8)", // Изменено: темный border для контраста на белом фоне
            backdropFilter: "blur(10px)",
            alignSelf: "center",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("upcoming")}
            style={{
              flex: 1,
              height: "50px",
              background:
                activeTab === "upcoming"
                  ? "rgba(0,0,0,0.2)" // Изменено: темный фон для активной вкладки
                  : "rgba(0,0,0,0.02)", // Изменено: очень светлый темный для неактивной
              border: "none",
              color: "#333333", // Изменено: темный текст вместо белого для видимости на светлом фоне
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            Предстоящие
          </button>
          <button
            onClick={() => setActiveTab("past")}
            style={{
              flex: 1,
              height: "50px",
              background:
                activeTab === "past"
                  ? "rgba(0,0,0,0.2)" // Изменено: темный фон для активной вкладки
                  : "rgba(0,0,0,0.02)", // Изменено: очень светлый темный для неактивной
              border: "none",
              color: "#333333", // Изменено: темный текст вместо белого
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            Прошедшие
          </button>
        </div>

        {/* Прокручиваемый список записей */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            alignItems: "center",
            flex: 1,
            overflowY: "auto",
            paddingBottom: "20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {currentRegistrations.length === 0 ? (
            <div
              style={{
                color: "#333333", // Изменено: темный текст вместо белого для видимости
                fontSize: "1.1rem",
                textAlign: "center",
                opacity: 0.8,
                padding: "40px 20px",
                marginTop: "20px",
              }}
            >
              {activeTab === "upcoming"
                ? "У вас нет предстоящих записей"
                : "У вас нет прошедших записей"}
            </div>
          ) : (
            currentRegistrations.map((registration) => (
              <TelegramCard key={registration.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#333333", // Изменено: темный текст для заголовка даты
                    }}
                  >
                    {new Date(registration.match.date).toLocaleDateString(
                      "ru-RU",
                      {
                        day: "numeric",
                        month: "long",
                      }
                    )}
                  </div>
                  <div
                    style={{
                      background:
                        registration.type === "main_list"
                          ? "rgba(0,255,0,0.2)" // Оставлено: зеленый для основного
                          : "rgba(255,165,0,0.2)", // Оставлено: оранжевый для резерва
                      padding: "4px 8px",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "#333333", // Изменено: темный текст для типа
                    }}
                  >
                    {registration.type === "main_list" ? "Основной" : "Резерв"}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "6px",
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#333333", // Изменено: темный текст для времени
                  }}
                >
                  <img
                    src="/icon-time.png"
                    alt="Время"
                    style={{ width: "16px", height: "16px" }}
                  />
                  {formatTime(registration.match.start_time)}
                </div>

                <div
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "6px",
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#333333", // Изменено: темный текст для веню
                  }}
                >
                  🏟️ {registration.match.venue.name}
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    opacity: 0.7,
                    marginBottom: "12px",
                    color: "#666666", // Изменено: более тусклый темный для адреса
                  }}
                >
                  {registration.match.venue.address}
                </div>

                {/* Статус платежа */}
                {registration.payment_status && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                      fontSize: "0.9rem",
                      color: "#333333", // Изменено: темный текст для статуса
                    }}
                  >
                    <span>Платеж:</span>
                    {registration.payment_status === "paid" && (
                      <span style={{ color: "#4CAF50" }}>
                        ✅ Оплачено вы записаны!
                      </span>
                    )}
                    {registration.payment_status === "pending" && (
                      <span style={{ color: "#FF9800" }}>
                        ⏳ Ожидает оплаты
                      </span>
                    )}
                    {registration.payment_status === "failed" && (
                      <span style={{ color: "#F44336" }}>❌ Не оплачено</span>
                    )}
                  </div>
                )}

                {/* Информация об оплате для pending статуса */}
                {activeTab === "upcoming" &&
                  registration.payment_status === "pending" && (
                    <div
                      style={{
                        background: "rgba(255, 165, 0, 0.1)", // Оставлено: оранжевый фон
                        border: "1px solid rgba(255, 165, 0, 0.3)", // Оставлено
                        borderRadius: "8px",
                        padding: "12px",
                        marginTop: "12px",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        color: "#333333", // Изменено: темный текст
                      }}
                    >
                      <div style={{ marginBottom: "8px", fontWeight: "600" }}>
                        ⏰ Ожидает оплаты
                      </div>
                      <div style={{ fontSize: "0.8rem", opacity: 0.8, marginBottom: "12px" }}>
                        После оплаты нажмите кнопку "Проверить оплату".
                      </div>
                      <CheckPaymentButton
                        registrationId={registration.id}
                        onPaymentChecked={async (success, message) => {
                          if (success) {
                            // Обновляем список регистраций
                            const updatedData = await api.getMyRegistrations();
                            setRegistrations(updatedData || []);
                          }
                          console.log(message);
                        }}
                      />
                    </div>
                  )}

                {activeTab === "upcoming" && (
                  <button
                    onClick={() => handleCancelClick(registration)}
                    style={{
                      width: "100%",
                      height: "36px",
                      background: "rgba(255,0,0,0.2)", // Оставлено: красный фон
                      border: "2px solid rgba(255,0,0,0.5)", // Оставлено
                      borderRadius: "18px",
                      color: "#333333", // Изменено: темный текст вместо белого
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      marginTop:
                        registration.payment_status === "pending"
                          ? "12px"
                          : "0",
                    }}
                  >
                    Отменить бронирование
                  </button>
                )}

                {activeTab === "past" && (
                  <TelegramButton
                    to={`/match/${registration.match_id}/result`}
                    variant="secondary"
                    style={{ height: "36px", fontSize: "0.9rem" }}
                  >
                    Посмотреть результат
                  </TelegramButton>
                )}
              </TelegramCard>
            ))
          )}

          {/* Предупреждение */}
          <TelegramCard
            style={{
              background: "rgba(255,165,0,0.1)", // Оставлено: оранжевый фон
              borderColor: "rgba(255,165,0,0.5)", // Оставлено
              textAlign: "center",
              fontSize: "0.85rem",
              lineHeight: "1.4",
              marginBottom: "20px",
              marginTop: "20px",
              color: "#333333", // Изменено: темный текст
            }}
          >
            <strong>⚠️ Внимание!</strong>
            <br />
            Если у тебя что-то случилось и ты не сможешь прийти, пожалуйста,
            отмени бронь в своём профиле или напиши нам
          </TelegramCard>

          <TelegramButton to="/profile" variant="secondary">
            Назад в профиль
          </TelegramButton>
        </div>
      </div>

      {/* Модальное окно отмены */}
      {showCancelModal && selectedRegistration && (
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
          matchDate={new Date(
            selectedRegistration.match.date
          ).toLocaleDateString("ru-RU")}
          matchTime={formatTime(selectedRegistration.match.start_time)}
        />
      )}
    </Layout>
  );
}
