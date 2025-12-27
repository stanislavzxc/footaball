import { Layout } from "../components/Layout";
import { TelegramCard } from "../components/TelegramCard";
import { TelegramButton } from "../components/TelegramButton";

export default function PaymentInstructions() {
  return (
    <Layout title="Как записаться на матч" showBackButton>
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
        {/* Заголовок */}
        <TelegramCard style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              marginBottom: "8px",
              color: "#20B136",
            }}
          >
            КАК ЗАПИСАТЬСЯ НА МАТЧ
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              opacity: 0.8,
              lineHeight: "1.4",
            }}
          >
            Всего три шага и ты в игре!
          </div>
        </TelegramCard>

        {/* Шаг 1 */}
        <TelegramCard>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#20B136",
                color: "white",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Нажми кнопку «💳 Оплатить»
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.8,
                  lineHeight: "1.4",
                  marginBottom: "12px",
                }}
              >
                Переходи в бот и нажми кнопку «Оплатить 100 ₽»
              </div>
              <div
                style={{
                  width: "100%",
                  height: "120px",
                  backgroundImage: "url('/Group 34.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(32, 177, 54, 0.1)",
                }}
              />
            </div>
          </div>
        </TelegramCard>

        {/* Шаг 2 */}
        <TelegramCard>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#20B136",
                color: "white",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Произведи оплату
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.8,
                  lineHeight: "1.4",
                  marginBottom: "12px",
                }}
              >
                Выбери удобный способ оплаты в Юкассе и оплати
              </div>
            </div>
          </div>
        </TelegramCard>

        {/* Шаг 3 */}
        <TelegramCard>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#20B136",
                color: "white",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Проверь оплату
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.8,
                  lineHeight: "1.4",
                  marginBottom: "12px",
                }}
              >
                Вернись в бот и нажми кнопку «🔍 Проверить оплату»
              </div>
              <div
                style={{
                  width: "100%",
                  height: "120px",
                  backgroundImage: "url('/Group 35.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(32, 177, 54, 0.1)",
                }}
              />
            </div>
          </div>
        </TelegramCard>

        {/* Готово */}
        <TelegramCard
          style={{
            textAlign: "center",
            border: "2px solid rgba(32, 177, 54, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#20B136",
            }}
          >
            Готово! 🎉
          </div>
          <div
            style={{
              width: "100%",
              height: "120px",
              backgroundImage: "url('/Group 36.png')",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(32, 177, 54, 0.1)",
            }}
          />
        </TelegramCard>

        {/* Важная информация */}
        <TelegramCard
          style={{
            background: "rgba(255, 193, 7, 0.1)",
            border: "2px solid rgba(255, 193, 7, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#FFC107",
            }}
          >
            ⚠️ Важно!
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              opacity: 0.9,
              lineHeight: "1.4",
            }}
          >
            Пожалуйста, после оплаты не забудь вернуться в бот и нажать кнопку
            «🔍 Проверить оплату»
          </div>
        </TelegramCard>

        <div style={{ marginTop: "20px" }}>
          <TelegramButton
            onClick={() => window.history.back()}
            variant="secondary"
          >
            Назад
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}
