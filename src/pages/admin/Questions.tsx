import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { showNotification, formatDateTime } from "../../utils/api";

interface Question {
  id: number;
  user: {
    username?: string;
    full_name?: string;
  };
  question: string;
  created_at: string;
  status: string;
}

export default function Questions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await adminApi.getQuestions("pending");
      setQuestions(data.questions || data);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const handleAnswerQuestion = async (questionId: number) => {
    if (!answer.trim()) {
      alert("Введите ответ на вопрос");
      return;
    }

    setLoading(true);
    try {
      await adminApi.answerQuestion(questionId, answer);
      setSuccess(true);

      // Перезагружаем список
      await loadQuestions();
      setSelectedQuestion(null);
      setAnswer("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error answering question:", error);
      alert("Ошибка при отправке ответа");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQuestion = async (questionId: number) => {
    if (!window.confirm("Подтвердите ответ")) return;

    setLoading(true);
    try {
      await adminApi.closeQuestion(questionId);
      setSuccess(true);

      // Перезагружаем список
      await loadQuestions();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error closing question:", error);
      alert("Ошибка при закрытии вопроса");
    } finally {
      setLoading(false);
    }
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
            <div style={{ fontSize: "1rem", opacity: 0.9, lineHeight: "1.4" }}>
              Ответ отправлен пользователю
            </div>
          </TelegramCard>

          <TelegramButton onClick={() => setSuccess(false)}>
            Назад к списку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  if (selectedQuestion) {
    return (
      <Layout title="Ответ на вопрос" showBackButton>
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
          {/* Информация о вопросе */}
          <TelegramCard>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Вопрос от @
              {selectedQuestion.user?.username ||
                selectedQuestion.user?.full_name}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                opacity: 0.7,
                marginBottom: "12px",
              }}
            >
              {formatDateTime(selectedQuestion.created_at)}
            </div>
            <div
              style={{
                fontSize: "1rem",
                lineHeight: "1.4",
                background: "rgba(255,255,255,0.1)",
                padding: "12px",
                borderRadius: "10px",
              }}
            >
              {selectedQuestion.question}
            </div>
          </TelegramCard>

          {/* Форма ответа */}
          <TelegramCard>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Ваш ответ:
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Введите ответ на вопрос..."
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
                resize: "vertical",
                minHeight: "120px",
              }}
            />
          </TelegramCard>

          {/* Кнопки действий */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <button
              onClick={() => handleAnswerQuestion(selectedQuestion.id)}
              disabled={loading || !answer.trim()}
              style={{
                width: "100%",
                maxWidth: "320px",
                height: "48px",
                background:
                  loading || !answer.trim()
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.02)",
                border: "2px solid rgba(255,255,255,0.8)",
                borderRadius: "24px",
                color: "white",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading || !answer.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
                opacity: loading || !answer.trim() ? 0.5 : 1,
              }}
            >
              {loading ? "Отправка..." : "Отправить ответ"}
            </button>

            <TelegramButton
              onClick={() => setSelectedQuestion(null)}
              variant="secondary"
            >
              Назад к списку
            </TelegramButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Вопросы от игроков" showBackButton>
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
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "white",
            marginBottom: "8px",
          }}
        >
          Список вопросов:
        </div>

        {questions.length === 0 ? (
          <div
            style={{
              color: "white",
              textAlign: "center",
              fontSize: "1.1rem",
              marginTop: "50px",
              opacity: 0.8,
            }}
          >
            Нет новых вопросов
          </div>
        ) : (
          questions.map((question, index) => (
            <TelegramCard key={question.id}>
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
                      {question.user?.username ||
                        question.user?.full_name ||
                        "Unknown"}
                      :
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "8px",
                      lineHeight: "1.4",
                      background: "rgba(255,255,255,0.1)",
                      padding: "8px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {question.question}
                  </div>

                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    {formatDateTime(question.created_at)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <button
                    onClick={() => setSelectedQuestion(question)}
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
                    Написать
                  </button>

                  <button
                    onClick={() => handleCloseQuestion(question.id)}
                    disabled={loading}
                    style={{
                      background: "rgba(76, 175, 80, 0.2)",
                      border: "1px solid rgba(76, 175, 80, 0.5)",
                      borderRadius: "12px",
                      color: "#4CAF50",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      padding: "4px 8px",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: loading ? 0.5 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ответил
                  </button>
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
    </Layout>
  );
}
