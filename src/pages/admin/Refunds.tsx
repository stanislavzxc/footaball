import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { formatDateTime } from "../../utils/api";
import type { RefundRequest } from "../../types";

export default function Refunds() {
  const navigate = useNavigate();
  const [newRefunds, setNewRefunds] = useState<RefundRequest[]>([]);
  const [approvedRefunds, setApprovedRefunds] = useState<RefundRequest[]>([]);
  const [rejectedRefunds, setRejectedRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "approved" | "rejected">(
    "new"
  );
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    username: string;
  }>({
    isOpen: false,
    userId: null,
    username: "",
  });
  const [messageText, setMessageText] = useState("");
  
  // Состояние для модального окна отклонения
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    refundId: number | null;
  }>({
    isOpen: false,
    refundId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      // Загружаем все возвраты и разделяем по статусам
      const [newData, approvedData, rejectedData] = await Promise.all([
        adminApi.getRefunds("pending"),
        adminApi.getRefunds("approved"),
        adminApi.getRefunds("rejected"),
      ]);

      setNewRefunds(newData.refunds);
      setApprovedRefunds(approvedData.refunds);
      setRejectedRefunds(rejectedData.refunds);
    } catch (error) {
      console.error("Error loading refunds:", error);
      setNewRefunds([]);
      setApprovedRefunds([]);
      setRejectedRefunds([]);
    }
  };

  const handleApproveRefund = async (refundId: number) => {
    if (!window.confirm("Одобрить возврат?")) {
      console.log("Approval cancelled by user");
      return;
    }

    console.log(`Attempting to approve refund ${refundId}`);
    setLoading(true);

    try {
      const result = await adminApi.approveRefund(refundId);
      console.log("Refund approval result:", result);

      setSuccess(true);
      await loadRefunds();
      setTimeout(() => setSuccess(false), 3000);

      console.log(`Refund ${refundId} approved successfully`);
    } catch (error: any) {
      console.error("Error approving refund:", error);

      // Более детальная обработка ошибок
      let errorMessage = "Ошибка при одобрении возврата";

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        if (error.response.status === 404) {
          errorMessage = "Запрос на возврат не найден";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || "Неверный запрос";
        } else if (error.response.status === 500) {
          errorMessage = "Внутренняя ошибка сервера";
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "Нет ответа от сервера";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage = `Ошибка запроса: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRefund = (refundId: number) => {
    console.log(`handleRejectRefund called with refundId: ${refundId}`);
    
    // Открываем модальное окно для ввода причины отклонения
    setRejectModal({ isOpen: true, refundId });
    setRejectReason("");
  };

  const confirmRejectRefund = async () => {
    if (!rejectModal.refundId || !rejectReason.trim()) {
      console.log("Rejection cancelled - no reason provided");
      return;
    }

    console.log(
      `Attempting to reject refund ${rejectModal.refundId} with reason: "${rejectReason}"`
    );
    setLoading(true);

    try {
      const result = await adminApi.rejectRefund(rejectModal.refundId, rejectReason.trim());
      console.log("Refund rejection result:", result);

      // Закрываем модальное окно
      setRejectModal({ isOpen: false, refundId: null });
      setRejectReason("");
      
      setSuccess(true);
      await loadRefunds();
      setTimeout(() => setSuccess(false), 3000);

      console.log(`Refund ${rejectModal.refundId} rejected successfully`);
    } catch (error: any) {
      console.error("Error rejecting refund:", error);

      // Более детальная обработка ошибок
      let errorMessage = "Ошибка при отклонении возврата";

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        if (error.response.status === 404) {
          errorMessage = "Запрос на возврат не найден";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || "Неверный запрос";
        } else if (error.response.status === 500) {
          errorMessage = "Внутренняя ошибка сервера";
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "Нет ответа от сервера";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage = `Ошибка запроса: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messageModal.userId) return;

    setLoading(true);
    try {
      // Отправляем сообщение через бота
      await adminApi.sendMessageToUser(messageModal.userId, messageText.trim());

      setSuccess(true);
      setMessageModal({ isOpen: false, userId: null, username: "" });
      setMessageText("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Ошибка при отправке сообщения");
    } finally {
      setLoading(false);
    }
  };

  const openMessageModal = (userId: number, username: string) => {
    setMessageModal({
      isOpen: true,
      userId,
      username,
    });
    setMessageText("");
  };



  if (success) {
    return (
      <Layout title="Данные обновлены" showBackButton>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "40px",
            paddingBottom: "20px",
            gap: "20px",
          }}
        >
          <TelegramCard
            style={{
              textAlign: "center",
              padding: "32px 24px",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Данные успешно обновлены
            </div>
          </TelegramCard>

          <TelegramButton onClick={() => setSuccess(false)}>
            Назад к списку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  const getCurrentRefunds = () => {
    switch (activeTab) {
      case "new":
        return newRefunds;
      case "approved":
        return approvedRefunds;
      case "rejected":
        return rejectedRefunds;
      default:
        return newRefunds;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "new":
        return `Новые запросы (${newRefunds.length})`;
      case "approved":
        return `Одобренные (${approvedRefunds.length})`;
      case "rejected":
        return `Отклоненные (${rejectedRefunds.length})`;
      default:
        return "Запросы на возврат";
    }
  };

  return (
    <Layout title="Запросы на возврат" showBackButton>
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
        {/* Табы */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          {[
            {
              key: "new",
              label: `Новые (${newRefunds.length})`,
              color: "#FFC107",
            },
            {
              key: "approved",
              label: `Одобренные (${approvedRefunds.length})`,
              color: "#4CAF50",
            },
            {
              key: "rejected",
              label: `Отклоненные (${rejectedRefunds.length})`,
              color: "#F44336",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "12px",
                border:
                  activeTab === tab.key
                    ? `2px solid ${tab.color}`
                    : "1px solid rgba(255,255,255,0.3)",
                background:
                  activeTab === tab.key
                    ? `${tab.color}20`
                    : "rgba(255,255,255,0.1)",
                color: activeTab === tab.key ? tab.color : "white",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "white",
            marginBottom: "8px",
          }}
        >
          {getTabTitle()}
        </div>

        {getCurrentRefunds().length === 0 ? (
          <div
            style={{
              color: "white",
              textAlign: "center",
              fontSize: "1.1rem",
              marginTop: "50px",
              opacity: 0.8,
            }}
          >
            {activeTab === "new" && "Нет новых запросов на возврат"}
            {activeTab === "approved" && "Нет одобренных запросов"}
            {activeTab === "rejected" && "Нет отклоненных запросов"}
          </div>
        ) : (
          getCurrentRefunds().map((refund, index) => (
            <TelegramCard key={refund.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
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
                      @
                      {refund.user?.username ||
                        refund.user?.full_name ||
                        "Unknown"}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.9rem",
                      marginBottom: "4px",
                      opacity: 0.8,
                    }}
                  >
                    📅 {refund.match && formatDateTime(refund.match.start_time)}{" "}
                    | {refund.match?.venue.name}
                  </div>

                  <div
                    style={{
                      fontSize: "0.9rem",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    💰 Сумма: {refund.amount} руб.
                  </div>

                  {refund.reason && (
                    <div
                      style={{
                        fontSize: "0.85rem",
                        opacity: 0.7,
                        fontStyle: "italic",
                        marginBottom: "4px",
                      }}
                    >
                      Причина: {refund.reason}
                    </div>
                  )}

                  {refund.refund_id && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        opacity: 0.6,
                        marginBottom: "4px",
                      }}
                    >
                      🆔 YooKassa ID: {refund.refund_id.substring(0, 8)}...
                    </div>
                  )}

                  {refund.expected_timeframe && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        opacity: 0.7,
                        marginBottom: "4px",
                      }}
                    >
                      ⏰ Сроки: {refund.expected_timeframe}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        padding: "2px 6px",
                        borderRadius: "8px",
                        background:
                          refund.status === "pending"
                            ? "rgba(255, 193, 7, 0.2)"
                            : refund.status === "approved"
                            ? "rgba(76, 175, 80, 0.2)"
                            : refund.status === "completed" ||
                              refund.status === "processed"
                            ? "rgba(33, 150, 243, 0.2)"
                            : "rgba(244, 67, 54, 0.2)",
                        color:
                          refund.status === "pending"
                            ? "#FFC107"
                            : refund.status === "approved"
                            ? "#4CAF50"
                            : refund.status === "completed" ||
                              refund.status === "processed"
                            ? "#2196F3"
                            : "#F44336",
                      }}
                    >
                      {refund.status === "pending"
                        ? "Ожидает"
                        : refund.status === "approved"
                        ? "Одобрен"
                        : refund.status === "completed" ||
                          refund.status === "processed"
                        ? "Обработан"
                        : refund.status}
                    </div>

                    {refund.yookassa_status &&
                      refund.yookassa_status !== refund.status && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            padding: "2px 6px",
                            borderRadius: "8px",
                            background: "rgba(156, 39, 176, 0.2)",
                            color: "#9C27B0",
                          }}
                        >
                          YK: {refund.yookassa_status}
                        </div>
                      )}
                  </div>

                  {refund.admin_notes && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.6,
                        marginTop: "4px",
                        fontStyle: "italic",
                      }}
                    >
                      📝 {refund.admin_notes}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() =>
                      openMessageModal(
                        refund.user.id,
                        refund.user?.username ||
                          refund.user?.full_name ||
                          "Unknown"
                      )
                    }
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      padding: "4px 8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    💬 Написать
                  </button>

                  {activeTab === "new" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Approve button clicked for refund:", refund.id);
                          handleApproveRefund(refund.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={loading}
                        style={{
                          background: "rgba(76, 175, 80, 0.2)",
                          border: "1px solid rgba(76, 175, 80, 0.5)",
                          borderRadius: "12px",
                          color: "#4CAF50",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          padding: "6px 10px", // Увеличиваем padding для лучшего клика на десктопе
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                          opacity: loading ? 0.5 : 1,
                          whiteSpace: "nowrap",
                          minHeight: "32px", // Минимальная высота для лучшего клика
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          WebkitTouchCallout: "none",
                          WebkitTapHighlightColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.background = "rgba(76, 175, 80, 0.3)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.background = "rgba(76, 175, 80, 0.2)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        Одобрить
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Reject button clicked for refund:", refund.id);
                          handleRejectRefund(refund.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={loading}
                        style={{
                          background: "rgba(244, 67, 54, 0.2)",
                          border: "1px solid rgba(244, 67, 54, 0.5)",
                          borderRadius: "12px",
                          color: "#F44336",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          padding: "6px 10px", // Увеличиваем padding для лучшего клика на десктопе
                          cursor: loading ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                          opacity: loading ? 0.5 : 1,
                          whiteSpace: "nowrap",
                          minHeight: "32px", // Минимальная высота для лучшего клика
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          WebkitTouchCallout: "none",
                          WebkitTapHighlightColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.background = "rgba(244, 67, 54, 0.3)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.currentTarget.style.background = "rgba(244, 67, 54, 0.2)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                </div>
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

      {/* Модальное окно для отправки сообщения */}
      {messageModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "400px",
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Сообщение пользователю
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                color: "#666",
                textAlign: "center",
              }}
            >
              @{messageModal.username}
            </div>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Напишите сообщение пользователю..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                resize: "none",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
            />

            <div
              style={{
                fontSize: "0.8rem",
                color: "#666",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Сообщение будет отправлено пользователю в Telegram бот с указанием
              вашего username для связи
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
                onClick={() =>
                  setMessageModal({ isOpen: false, userId: null, username: "" })
                }
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Отмена
              </button>

              <button
                onClick={handleSendMessage}
                disabled={loading || !messageText.trim()}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor:
                    loading || !messageText.trim() ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    loading || !messageText.trim() ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                {loading ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для отклонения возврата */}
      {rejectModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001, // Выше чем у модального окна сообщений
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "400px",
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              Отклонение возврата
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                color: "#666",
                textAlign: "center",
              }}
            >
              Укажите причину отклонения возврата:
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Причина отклонения..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                resize: "none",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
              autoFocus // Автофокус для удобства
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
                onClick={() => {
                  setRejectModal({ isOpen: false, refundId: null });
                  setRejectReason("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Отмена
              </button>

              <button
                onClick={confirmRejectRefund}
                disabled={loading || !rejectReason.trim()}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor:
                    loading || !rejectReason.trim() ? "#ccc" : "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    loading || !rejectReason.trim() ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                {loading ? "Отклонение..." : "Отклонить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
