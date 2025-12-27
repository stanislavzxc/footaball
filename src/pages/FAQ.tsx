import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
// import { AdminChat } from '../components/AdminChat'; // Отключено
import { TelegramCard } from "../components/TelegramCard";
import { TelegramButton } from "../components/TelegramButton";
import { useTelegram } from "../hooks/useTelegram";

interface FAQSection {
  title: string;
  content: string[];
}

interface FAQData {
  sections: FAQSection[];
  contact_info: {
    title: string;
    description: string;
  };
}

export default function FAQ() {
  const [faqData, setFaqData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  // const [chatOpen, setChatOpen] = useState(false); // Отключено
  const { userId } = useTelegram();

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const data = await api.getFAQ();
        setFaqData(data);
      } catch (error) {
        console.error("Error fetching FAQ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  if (loading) {
    return (
      <Layout title="FAQ" showBackButton>
        <div
          style={{
            color: "white",
            fontSize: "1.2rem",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          Загрузка FAQ...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ответы на вопросы" showBackButton>
      <hr style={{
        width: '100%',
        border: 'none',
        height: '1px',
        backgroundColor: '#575757',
        margin: '0 0 20px 0'
      }}/>
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
        {faqData?.sections.map((section, index) => (
          <TelegramCard
            key={index}
            onClick={() => toggleSection(index)}
          
            style={{ cursor: "pointer",background:'#35363A', border:'none',}}
          >
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                
              }}
            >
              <span>
                {section.title}
              </span>
              <span style={{ fontSize: "1.2rem", opacity: 0.7, background:'#697281', padding:'0px 10px 0px 10px', borderRadius:'15px',}}>
                {expandedSection === index ? "−" : "+"}
              </span>
            </div>
            {expandedSection === index && (
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  opacity: 0.9,
                  paddingTop: "12px",
                  borderTop: "1px solid #697281",
                }}
              >
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ marginBottom: "8px" }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </TelegramCard>
        ))}

        {faqData?.contact_info && (
          <TelegramCard style={{ textAlign: "center", marginTop: "8px" }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              {faqData.contact_info.title}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                opacity: 0.9,
                marginBottom: "12px",
              }}
            >
              {faqData.contact_info.description}
            </div>
            <button
              onClick={async () => {
                try {
                  // Получаем конфигурацию админа
                  const response = await fetch("/api/public/config/admin");

                  if (response.ok) {
                    const config = await response.json();
                    const username = config.admin_username;

                    if (username) {
                      // Открываем чат с админом по username
                      const telegramUrl = `https://t.me/${username}`;

                      // Для iPhone используем window.location.href вместо window.open
                      const isIOS = /iPad|iPhone|iPod/.test(
                        navigator.userAgent
                      );

                      if (isIOS) {
                        window.location.href = telegramUrl;
                      } else {
                        window.open(telegramUrl, "_blank");
                      }
                      return;
                    }
                  }

                  // Fallback - открываем по ID первого админа
                  const adminId = 1680940651; // из .env
                  const telegramUrl = `tg://user?id=${adminId}`;

                  // Для iPhone используем window.location.href вместо window.open
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

                  if (isIOS) {
                    window.location.href = telegramUrl;
                  } else {
                    window.open(telegramUrl, "_blank");
                  }
                } catch (error) {
                  console.error("Error opening admin chat:", error);
                  // Fallback - открываем по ID
                  const adminId = 1680940651;
                  const telegramUrl = `tg://user?id=${adminId}`;

                  // Для iPhone используем window.location.href вместо window.open
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

                  if (isIOS) {
                    window.location.href = telegramUrl;
                  } else {
                    window.open(telegramUrl, "_blank");
                  }
                }
              }}
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "#1E3A8A",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "20px",
                padding: "10px 16px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
              }}
            >
              Написать администратору
            </button>
          </TelegramCard>
        )}

        <div style={{ marginTop: "20px" }}>
          <TelegramButton to="/" variant="secondary">
            Назад на главную
          </TelegramButton>
        </div>
      </div>

      {/* AdminChat отключен - теперь используется прямая ссылка на Telegram */}
      {/* <AdminChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        userId={userId}
      /> */}
    </Layout>
  );
}
