import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { CancelModal } from "../components/CancelModal";
import { NotificationModal } from "../components/NotificationModal";
import { resetComponentState, debugState } from "../utils/stateManager";

import { PaymentButton } from "../components/PaymentButton";
import { CheckPaymentButton } from "../components/CheckPaymentButton";
import { Layout } from "../components/Layout";
import { TelegramCard } from "../components/TelegramCard";
import { TelegramButton } from "../components/TelegramButton";
import { TelegramLoader } from "../components/TelegramLoader";
import { useTheme } from '../hooks/ThemeContext'; // Добавлено: импорт useTheme
import cost from '../assets/cost.png';
import cost_black from '../assets/cost_black.png';
import time from '../assets/time.png'
import time_black from '../assets/time_black.png'
import date from '../assets/date.png'
import date_black from '../assets/date_black.png'
import shower from '../assets/shower.png';
import shower_black from '../assets/shower_black.png';
import park from '../assets/park.png';
import park_black from '../assets/parket_black.png';
import parket from '../assets/parket.png';
import parket_black from '../assets/parket_black.png';
import team from '../assets/team.png'; // Note: This seems to be using parket.png for team, but should probably be a team icon. Adjust if needed.
import team_black from '../assets/team_black.png'; // Same note as above.

interface Match {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  venue_id?: number;
  max_players: number;
  price: number;
  status: string;
  description?: string;
  venue?: {
    id: number;
    name: string;
    address: string;
    surface_type?: string;
    has_showers?: boolean;
    has_drinking_water?: boolean;
    has_parking?: boolean;
    contact_phone?: string;
    notes?: string;
    image_url?: string;
  };
}

interface UserRegistration {
  id: number;
  match_id: number;
  type: "main_list" | "reserve";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  registered_at: string;
  payment_url?: string; // Добавляем payment_url для случаев когда нужна немедленная оплата
}

export default function MatchDetails() {
  const { matchId } = useParams<{ matchId: string }>();
  const { isDarkTheme } = useTheme(); // Добавлено: получение isDarkTheme
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] =
    useState<UserRegistration | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Новые состояния и функции для прокси изображений
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const getImageUrl = (url: string | undefined, matchId: number): string => {
    if (!url) return getFallbackImage();
    if (failedImages.has(matchId)) return getFallbackImage();
    let fixedUrl = url.replace(/^hhttps:/, 'https:');
    return `https://images.weserv.nl/?url=${encodeURIComponent(fixedUrl)}&w=400&h=160&fit=cover`;
  };

  const getFallbackImage = (): string => "/Image31.png";

  const handleImageError = (matchId: number) => {
    setFailedImages(prev => new Set(prev).add(matchId));
  };

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    type:
      | "cancel-registration"
      | "cancel-booking"
      | "no-places"
      | "success-registration"
      | "reserve-registration";
  }>({ isOpen: false, type: "success-registration" });

  const fetchMatch = async () => {
    if (!matchId) return;

    try {
      // Получаем данные матча
      const data = await api.getMatch(Number(matchId));
      setMatch(data);

      // Проверяем регистрацию пользователя
      try {
        const registrations = await api.getMyRegistrations();
        const currentRegistration = registrations.find(
          (reg: any) => reg.match_id === Number(matchId)
        );

        if (currentRegistration) {
          setIsRegistered(true);
          setUserRegistration(currentRegistration);
          console.log("Found current registration:", currentRegistration);
          debugState("MatchDetails-fetchMatch", {
            isRegistered: true,
            userRegistration: currentRegistration,
            matchId: Number(matchId),
          });
        } else {
          setIsRegistered(false);
          setUserRegistration(null);
          console.log("No current registration found for match", matchId);
          debugState("MatchDetails-fetchMatch", {
            isRegistered: false,
            userRegistration: null,
            matchId: Number(matchId),
            totalRegistrations: registrations.length,
          });
        }
      } catch (regError) {
        console.error("Error fetching user registrations:", regError);
        // В случае ошибки полностью сбрасываем состояние регистрации
        setIsRegistered(false);
        setUserRegistration(null);
      }
    } catch (error) {
      console.error("Error fetching match:", error);
      // В случае ошибки также сбрасываем состояние
      setMatch(null);
      setIsRegistered(false);
      setUserRegistration(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Очищаем состояние модала при загрузке страницы
    setNotificationModal({ isOpen: false, type: "success-registration" });

    // Полностью сбрасываем состояние при смене матча
    setIsRegistered(false);
    setUserRegistration(null);
    setMatch(null);
    setLoading(true);

    // Очищаем кэш при смене матча
    resetComponentState();

    fetchMatch();

    // Cleanup function для очистки состояния при размонтировании
    return () => {
      setNotificationModal({ isOpen: false, type: "success-registration" });
      setIsRegistered(false);
      setUserRegistration(null);
      resetComponentState();
    };
  }, [matchId]);

  // Обновляем данные при фокусе на странице и при изменении видимости
  useEffect(() => {
    const handleFocus = () => {
      console.log("Page focused, refreshing match data");
      fetchMatch();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing match data");
        fetchMatch();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [matchId]);

  const handleRegister = async () => {
    if (!matchId) return;

    try {
      setRegistering(true);

      // Очищаем предыдущее состояние перед новой регистрацией
      setIsRegistered(false);
      setUserRegistration(null);

      const result = await api.registerForMatch(Number(matchId));

      if (result && "id" in result) {
        // Обновляем состояние регистрации
        setIsRegistered(true);
        setUserRegistration(result);

        // Принудительно обновляем данные матча для получения актуальной информации
        await fetchMatch();

        // Проверяем тип регистрации
        if (result.type === "main_list") {
          // Попал в основной список - просто обновляем данные
          // Кнопка "Оплатить" появится автоматически
          console.log(
            "Registered in main list, payment_status:",
            result.payment_status
          );
        } else if (result.type === "reserve") {
          // Попал в резерв - показываем уведомление
          setNotificationModal({ isOpen: true, type: "reserve-registration" });
        } else {
          // Неожиданный тип регистрации - просто логируем
          console.log("Unexpected registration type:", result.type);
        }
      } else {
        // Нет результата - обновляем данные на всякий случай
        await fetchMatch();
        console.log("No registration result received");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      // В случае ошибки тоже обновляем данные
      await fetchMatch();

      if (error.response?.status === 400) {
        setNotificationModal({ isOpen: true, type: "no-places" });
      } else {
        // Просто логируем ошибку, не показываем модал
        console.error("Registration error:", error.message);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!matchId) return;

    try {
      await api.cancelRegistration(Number(matchId));
      setShowCancelModal(false);

      // Полностью очищаем состояние регистрации
      setIsRegistered(false);
      setUserRegistration(null);

      // Очищаем кэш и состояние
      resetComponentState();

      // Принудительно обновляем данные матча
      await fetchMatch();

      debugState("MatchDetails", {
        isRegistered: false,
        userRegistration: null,
      });

      setNotificationModal({ isOpen: true, type: "cancel-registration" });
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Ошибка отмены");
    }
  };

  const handleRetryPayment = () => {
    setNotificationModal({ isOpen: false, type: "success-registration" });
    handleRegister();
  };

  const handleRefund = () => {
    setNotificationModal({ isOpen: false, type: "success-registration" });
    // Here you would implement refund logic
    console.log("Processing refund...");
  };

  if (loading) {
    return (
      <Layout>
        <TelegramLoader message="Загрузка матча..." />
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout title="Матч не найден" showBackButton>
        <div
          style={{
            color: "grey", // Изменено: серый текст
            fontSize: "1.2rem",
            textAlign: "center",
            marginTop: "50px",
            marginBottom: "2rem",
          }}
        >
          Матч не найден
        </div>
        
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          alignItems: "center",
          paddingBottom: "20px",
          
        }}
      >
        {/* Карточка с информацией о матче */}
        <TelegramCard style={{ 
          padding: "0", 
          overflow: "hidden",
          background: isDarkTheme ? 'transparent' : '#f5f5f5', // Изменено: светло-серый фон для белой темы
        }}>
          <>
            {/* Обновлено: Используем прокси для изображений */}
            <img
              src={getImageUrl(match.venue?.image_url, match.id)}
              alt="Match venue"
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "18px 18px 0 0",
                display: "block",
              }}
              onError={() => handleImageError(match.id)}
            />
            <div style={{ padding: "16px" }}>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  lineHeight: "1.3",
                  color: 'grey', // Изменено: серый текст
                }}
              >
                {match.venue?.name || "Площадка"}
              </div>

              <div
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "12px",
                  opacity: 0.8,
                  color: 'grey', // Изменено: серый текст
                }}
              >
                {match.venue?.address || "Адрес не указан"}
              </div>
               

              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  marginBottom: "12px",
                  color: 'grey', // Изменено: серый текст
                }}
              >
                <div 
                style={{
                    display:'flex',
                  justifyContent:'center',
                  alignItems:'center',
                  gap:'5px',
                }}
                >
                  <img src={isDarkTheme ? date : date_black} alt="" // Изменено: условное использование иконки
                                  style={{
                                    width:'15px',
                                    height:'15px',
                  }}/>
                {new Date(match.start_time).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                {" "}
                </div>
                <div  style={{
                  display:'flex',
                  justifyContent:'center',
                  alignItems:'center',
                  gap:'5px',
                }}>
                <img src={isDarkTheme ? time : time_black} alt="" // Изменено: условное использование иконки
                                  style={{
                                    width:'15px',
                                    height:'15px',
                  }}/>
                {new Date(match.start_time).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                -
                {new Date(match.end_time).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                
              
                </div>
                <div 
                style={{
                  display:'flex',
                  justifyContent:'center',
                  alignItems:'center',
                  gap:'5px',
                }}
                >
                  <img src={isDarkTheme ? cost : cost_black} alt="" // Изменено: условное использование иконки
                  style={{
                    width:'15px',
                    height:'15px',
                  }}
                  />
                  {match.price} руб.
                </div>
                </div>

      
              {/* Характеристики площадки */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 0.6fr",
                  gap: "8px",
                  fontSize: "0.85rem",
                  opacity: 0.9,
                  color: 'grey', // Изменено: серый текст
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                   <img src={isDarkTheme ? team : team_black} alt="" style={{width:'15px',height:'15px',}}/> 5х5
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                   <img src={isDarkTheme ? shower : shower_black} alt="" style={{width:'15px',height:'15px',}}/> {match.venue?.has_showers ? "Душевые есть" : "Без душевых"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <img src={isDarkTheme ? parket : parket_black} alt="" style={{width:'15px',height:'15px',}}/>
                  {match.venue?.surface_type === "artificial_grass" && "Резиновое покрытие"}
                  {match.venue?.surface_type === "grass" && "Натуральная трава"}
                  {match.venue?.surface_type === "parquet" && "паркет"}
                  {match.venue?.surface_type === "rubber" && "Резиновое покрытие"}
                  {match.venue?.surface_type === "indoor" && "Зал"}
                  {!match.venue?.surface_type && "Резиновое покрытие"}
                </div>
                {match.venue?.has_drinking_water && <div>💧 Питьевая вода</div>}
                {match.venue?.has_parking && <div style={{display:'flex', alignContent:'center', gap:'5px',}}><img src={isDarkTheme ? park : park_black} alt="" style={{width:'15px',height:'15px',}}/> парковка</div>}
              </div>

              {/* Дополнительная информация о площадке */}
              {match.venue?.notes && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.7,
                    fontStyle: "italic",
                    marginTop: "8px",
                    padding: "8px",
                    background: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", // Изменено: светлый фон для белой темы
                    borderRadius: "8px",
                    color: 'grey', // Изменено: серый текст
                  }}
                >
                  💡 {match.venue.notes}
                </div>
              )}

              {/* Контактная информация */}
              {match.venue?.contact_phone && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "8px",
                    opacity: 0.8,
                    color: 'grey', // Изменено: серый текст
                  }}
                >
                  📞 {match.venue.contact_phone}
                </div>
              )}
            </div>
          </>
        </TelegramCard>

        {/* Статус регистрации и платежа */}
        {isRegistered && userRegistration && (
          <TelegramCard style={{ 
            textAlign: "center",
            background: isDarkTheme ? 'transparent' : '#f5f5f5', // Изменено: светло-серый фон для белой темы
          }}>
            <>
              {userRegistration.type === "reserve" ? (
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginBottom: "8px",
                      lineHeight: "1.4",
                      color: 'grey', // Изменено: серый текст
                    }}
                  >
                    К сожалению мест не осталось 😔
                    <br />
                    добавили тебя в резерв, если место освободится — обязательно напишем!
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: 'grey', // Изменено: серый текст
                    }}
                  >
                    {userRegistration.payment_status === "paid"
                      ? "Вы записаны на матч!"
                      : "Оплатите чтобы остаться в списке"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginBottom: "8px",
                      color: 'grey', // Изменено: серый текст
                    }}
                  >
                    <span>Статус:</span>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        background: "rgba(0,255,0,0.2)", // Оставлено: зеленый акцент
                      }}
                    >
                      Основной состав
                    </span>
                  </div>

                  {userRegistration.payment_status && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ color: 'grey' }}>Платеж:</span> {/* Изменено: серый текст для "Платеж:" */}
                      {userRegistration.payment_status === "paid" && (
                        <span style={{ color: "#4CAF50" }}>✅ Оплачено</span>
                      )}
                      {userRegistration.payment_status === "pending" && (
                        <span style={{ color: "#FF9800" }}>
                          ⏳ Ожидает оплаты
                        </span>
                      )}
                      {userRegistration.payment_status === "failed" && (
                        <span style={{ color: "#F44336" }}>
                          ❌ Оплата не прошла
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Кнопки оплаты и проверки для pending и failed статусов (только для основного состава) */}
              {userRegistration.type === "main_list" && (userRegistration.payment_status === "pending" ||
                userRegistration.payment_status === "failed") && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
                    <TelegramButton 
                      to="/payment-instructions" 
                      style={{ 
                        fontSize: "0.9rem",
                        backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#e0e0e0', // Изменено: светло-серый для белой темы
                        borderColor: isDarkTheme ? 'rgba(255,255,255,0.6)' : '#b0b0b0', // Изменено: светло-серый border для белой темы
                        color: 'grey' // Изменено: серый текст
                      }}
                    >
                      Как оплатить
                    </TelegramButton>
                    
                    <PaymentButton
                      registrationId={userRegistration.id}
                      amount={match?.price || 0}
                      onPaymentCreated={() => {
                        // После создания платежа просто обновляем данные
                        fetchMatch();
                      }}
                    />
                    
                    <CheckPaymentButton
                      registrationId={userRegistration.id}
                      onPaymentChecked={(success, message) => {
                        if (success) {
                          // Обновляем данные при успешной оплате
                          fetchMatch();
                        }
                        // Можно показать уведомление с сообщением
                        console.log(message);
                      }}
                    />
                  </div>

                  {/* Информативные сообщения в зависимости от статуса */}
                  {userRegistration.payment_status === "pending" && (
                    <div
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.9rem",
                        color: "rgba(255,193,7,0.9)", // Оставлено: оранжевый акцент
                        textAlign: "center",
                        padding: "12px",
                        background: isDarkTheme ? "rgba(255,193,7,0.15)" : "rgba(255,193,7,0.1)", // Изменено: слегка светлее для белой темы
                        borderRadius: "12px",
                        border: "1px solid rgba(255,193,7,0.3)",
                      }}
                    >
                      ⏳ <strong>Ожидается оплата</strong>
                      <br />
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        Оплатите в течение 30 минут. После оплаты нажмите "Проверить оплату".
                      </span>
                    </div>
                  )}

                  {userRegistration.payment_status === "failed" && (
                    <div
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.9rem",
                        color: "rgba(244,67,54,0.9)", // Оставлено: красный акцент
                        textAlign: "center",
                        padding: "12px",
                        background: isDarkTheme ? "rgba(244,67,54,0.15)" : "rgba(244,67,54,0.1)", // Изменено: слегка светлее для белой темы
                        borderRadius: "12px",
                        border: "1px solid rgba(244,67,54,0.3)",
                      }}
                    >
                      ❌ <strong>Оплата не прошла</strong>
                      <br />
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        Попробуйте еще раз - у вас есть время до истечения 30
                        минут
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Сообщение для успешной оплаты */}
              {userRegistration.payment_status === "paid" && (
                <div
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.9rem",
                    color: "rgba(76,175,80,0.9)", // Оставлено: зеленый акцент
                    textAlign: "center",
                    padding: "12px",
                    background: isDarkTheme ? "rgba(76,175,80,0.15)" : "rgba(76,175,80,0.1)", // Изменено: слегка светлее для белой темы
                    borderRadius: "12px",
                    border: "1px solid rgba(76,175,80,0.3)",
                  }}
                >
                  ✅ <strong>Оплата успешна - вы записаны!</strong>
                  <br />
                  <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    Увидимся на поле! ⚽
                  </span>
                </div>
              )}
            </>
          </TelegramCard>
        )}

        {/* Кнопки действий */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            alignItems: "center",
          }}
        >
          {!isRegistered ? (
            <TelegramButton
              onClick={handleRegister}
              disabled={registering}
              variant="register"
              style={{
                opacity: registering ? 0.7 : 1,
                padding:'10px 24px',
                background:'#50C862',
                color:"white",
              }}
            >
              {registering ? "Записываем..." : "ЗАПИСАТЬСЯ"}
            </TelegramButton>
          ) : (
            <TelegramButton
              onClick={() => setShowCancelModal(true)}
              variant="secondary"
            >
              Отменить бронь
            </TelegramButton>
          )}

          <TelegramButton to={`/match/${matchId}/players`} variant="secondary">
            Кто уже записался
          </TelegramButton>
        </div>

        { <div style={{ marginTop: "20px" }}>
          <TelegramButton to="/" variant="secondary">
            Назад к площадкам
          </TelegramButton>
        </div> }
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelRegistration}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => {
          setNotificationModal({ ...notificationModal, isOpen: false });
          // Обновляем данные при закрытии модального окна
          fetchMatch();
        }}
        type={notificationModal.type}
        onRetry={handleRetryPayment}
        onRefund={handleRefund}
      />
    </Layout>
  );
}
