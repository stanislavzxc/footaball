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
        new Date(reg.match.start_time) <= now && reg.payment_status === "paid"
    )
    .slice(0, 3);

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
            border: "2px solid var(--tg-theme-hint-color, rgba(0,0,0,0.2))",
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
                  ? "var(--tg-theme-button-color, #2481cc)"
                  : "var(--tg-theme-secondary-bg-color, #f0f0f0)",
              border: "none",
              color:
                activeTab === "upcoming"
                  ? "var(--tg-theme-button-text-color, #ffffff)"
                  : "var(--tg-theme-text-color, #000000)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
              <div style={{color:'grey'}}>
            Предстоящие
            </div>
                      </button>
          <button
            onClick={() => setActiveTab("past")}
            style={{
              flex: 1,
              height: "50px",
              background:
                activeTab === "past"
                  ? "var(--tg-theme-button-color, #2481cc)"
                  : "var(--tg-theme-secondary-bg-color, #f0f0f0)",
              border: "none",
              color:
                activeTab === "past"
                  ? "var(--tg-theme-button-text-color, #ffffff)"
                  : "var(--tg-theme-text-color, #000000)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
              <div style={{color:'grey'}}>

            Прошедшие
</div>
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
                color: "var(--tg-theme-text-color, #000000)",
                fontSize: "1.1rem",
                textAlign: "center",
                opacity: 0.8,
                padding: "40px 20px",
                marginTop: "20px",
              }}
            >
              <div style={{color:'grey'}}>

              {activeTab === "upcoming"
                ? "У вас нет предстоящих записей"
                : "У вас нет прошедших записей"}
                </div>
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
                      color: "var(--tg-theme-text-color, #000000)",
                    }}
                  >
                    <div style={{color:'gray'}}>
                    {new Date(registration.match.date).toLocaleDateString(
                      "ru-RU",
                      {
                        day: "numeric",
                        month: "long",
                      }
                    )}
                    </div>

                  </div>
                  <div
                    style={{
                      background:
                        registration.type === "main_list"
                          ? "rgba(76, 175, 80, 0.2)"
                          : "rgba(255, 165, 0, 0.2)",
                      padding: "4px 8px",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--tg-theme-text-color, #000000)",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{color:'#68c9c9ff'}}>
                    {registration.type === "main_list" ? "Основной" : "Резерв"}
                    </div>
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
                    color: "var(--tg-theme-text-color, #000000)",
                  }}
                >
                  <img
                    src="/icon-time.png"
                    alt="Время"
                    style={{ width: "16px", height: "16px", opacity: 0.8 }}
                  />
                  <div style={{color:'gray'}}>
                  {formatTime(registration.match.start_time)}
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
                    color: "var(--tg-theme-text-color, #000000)",
                  }}
                >
                  <div style={{color:'grey'}}>
                
                  <span style={{ opacity: 0.8, }}>🏟️</span> {registration.match.venue.name}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    opacity: 0.7,
                    marginBottom: "12px",
                    color: "var(--tg-theme-subtitle-text-color, #666666)",
                  }}
                >
                  <div style={{color:'grey'}}>
                  {registration.match.venue.address}
                  </div>
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
                      color: "var(--tg-theme-text-color, #000000)",
                    }}
                  >
                    <span style={{ opacity: 0.8 }}>Платеж:</span>
                    {registration.payment_status === "paid" && (
                      <span style={{ color: "#4CAF50", fontWeight: "600" }}>
                        ✅ Оплачено вы записаны!
                      </span>
                    )}
                    {registration.payment_status === "pending" && (
                      <span style={{ color: "#FF9800", fontWeight: "600" }}>
                        ⏳ Ожидает оплаты
                      </span>
                    )}
                    {registration.payment_status === "failed" && (
                      <span style={{ color: "#F44336", fontWeight: "600" }}>
                        ❌ Не оплачено
                      </span>
                    )}
                  </div>
                )}

                {/* Информация об оплате для pending статуса */}
                {activeTab === "upcoming" &&
                  registration.payment_status === "pending" && (
                    <div
                      style={{
                        background: "rgba(255, 165, 0, 0.1)",
                        border: "1px solid rgba(255, 165, 0, 0.3)",
                        borderRadius: "8px",
                        padding: "12px",
                        marginTop: "12px",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        color: "var(--tg-theme-text-color, #000000)",
                      }}
                    >
                      <div style={{ 
                        marginBottom: "8px", 
                        fontWeight: "600",
                        color: "var(--tg-theme-text-color, #000000)" 
                      }}>
                        <div style={{color:'grey'}}>
                        ⏰ Ожидает оплаты
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: "0.8rem", 
                        opacity: 0.8, 
                        marginBottom: "12px",
                        color: "var(--tg-theme-subtitle-text-color, #666666)" 
                      }}>
                        После оплаты нажмите кнопку "Проверить оплату".
                      </div>
                      <CheckPaymentButton
                        registrationId={registration.id}
                        onPaymentChecked={async (success, message) => {
                          if (success) {
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
                      background: "rgba(244, 67, 54, 0.1)",
                      border: "2px solid rgba(244, 67, 54, 0.5)",
                      borderRadius: "18px",
                      color: "var(--tg-theme-text-color, #000000)",
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
                    <div style={{color:'red',}}>
                    Отменить бронирование
                    </div>
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
              background: "rgba(255,165,0,0.1)",
              borderColor: "rgba(255,165,0,0.5)",
              textAlign: "center",
              fontSize: "0.85rem",
              lineHeight: "1.4",
              marginBottom: "20px",
              marginTop: "20px",
              color: "var(--tg-theme-text-color, #000000)",
            }}
          >
            <strong style={{color:'grey',}}>⚠️ Внимание!</strong>
            <br />
            <div style={{color:'grey'}}>
            Если у тебя что-то случилось и ты не сможешь прийти, пожалуйста,
            отмени бронь в своём профиле или напиши нам
            </div>
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
