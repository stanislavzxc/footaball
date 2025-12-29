import React, { useEffect, useState } from "react";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../services/api";
import { Layout } from "../components/Layout";
import { TelegramButton } from "../components/TelegramButton";
import defaultJoinImage from '../assets/default_join.png';
import defaultHistoryImage from '../assets/default_history_1.png';
import defaultHistoryImage2 from '../assets/default_history_2.png';
import defaultHistoryImage3 from '../assets/default_history_3.png';
import defaultHistoryImage4 from '../assets/default_history_4.png';
import defaultProfileImage from '../assets/default_profile.png';
import defaultAnswersImage from '../assets/default_answers.png';
import activeJoinImage from '../assets/active_join.png';
import activeProfileImage from '../assets/active_profille.png';
import acitveHistory from  '../assets/active_history_1.png';
import acitveHistory2 from '../assets/active_history_2.png';
import acitveHistory3 from '../assets/active_history_3.png';
import acitveHistory4 from '../assets/active_history_4.png';
import activeFaq from '../assets/active_anwsers.png';
import GameRegister from "./GameRegister";
import MyProfile from "./MyProfile";
import MatchHistory from "./MatchHistory";
import FAQ from "./FAQ";
// Добавляем импорт useTheme из ThemeContext
import { useTheme } from '../hooks/ThemeContext';  // Убедись, что путь правильный (если файл в hooks/, то '../hooks/ThemeContext')

const MainPage: React.FC = () => {
  const { isReady, user, isInTelegram, userId } = useTelegram();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState("register"); // Состояние для активной вкладки

  // Используем хук useTheme для получения состояния темы
  const { isDarkTheme } = useTheme();

  useEffect(() => {
    const initUser = async () => {
      if (isReady && isInTelegram && user) {
        try {
          await api.createOrGetUser();
        } catch (error) {
          console.error("Error creating/getting user:", error);
        }
      }
    };

    initUser();
  }, [isReady, isInTelegram, user]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isReady && userId) {
        try {
          setCheckingAdmin(true);
          const result = await api.checkAdminStatus(userId);
          setIsAdmin(result.is_admin || false);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [isReady, userId]);

  // Функция для рендеринга активного компонента
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "register":
        return <GameRegister />;
      case "profile":
        return <MyProfile />;
      case "matches":
        return <MatchHistory />;
      case "faq":
        return <FAQ />;
      default:
        return <GameRegister />;
    }
  };

  return (
    <Layout isMainPage={true}>
      {/* Активный компонент */}
      {renderActiveComponent()}
      
      {/* Кнопки навигации (sidebar) */}
      <div
        style={{
          position: "absolute",
          bottom: "0px",
          left: "50%",
          transform: "translateX(-50%)",
          gap: "12px",
          zIndex: 2,
          width: "100%",
          alignItems: "center",
          // Меняем background в зависимости от темы: тёмная (#35363A) или светлая (#fff)
          background: isDarkTheme ? '#35363A' : '#fff',
          height:'100px',
        }}
      >
        <div
        style={{
          position:'relative',
          display: "flex",
          justifyContent:'space-around',

        }}>

        <div style={
          {
            display: "flex",
          justifyContent:'space-around',
          gap: "12px",
          width:'100%',
          marginBottom:'5%',  
          position:'absolute',
          top:'10px',
          }
        }>
        {/* Кнопка Записаться */}
        <div 
          id="parent-button"
          style={{ 
            display: 'flex',       
            flexDirection: 'column', 
            width: '66px', 
            height: '50px',
            alignItems: 'center' 
          }}
          onClick={() => setActiveTab("register")}
        >
          <img 
            src={activeTab === "register" ? activeJoinImage : defaultJoinImage} 
            style={{
              width: '45%',
              margin: 'auto',
            }} 
            alt="" 
          />
          <div style={{
            fontSize: "0.7rem",
            textAlign:'center', 
            // Меняем цвет текста: активный остаётся #6FBBE5, неактивный — серый (#808080) в светлой теме, иначе #697281
            color: activeTab === "register" ? '#6FBBE5' : (isDarkTheme ? '#697281' : '#808080')
          }}>
            Записаться на матч
          </div>
        </div>

        
        {/* Кнопка История матчей */}
        <div 
          id="parent-button"
          style={{ 
            display: 'flex',       
            flexDirection: 'column', 
            width: '66px', 
            height: '50px',
            alignItems: 'center' 
          }}
          onClick={() => setActiveTab("matches")}
        >
          
          <div 
          style={{
            width:'100%',
            
          }}
          >
            <div
              style={{
                display:'flex',
            justifyContent:'center',
              }}
            >
               <img 
            src={activeTab === "matches" ? acitveHistory2 : defaultHistoryImage2} 
            style={{
              width: '15%',
            }} 
            alt=""
          />
           <img 
            src={activeTab === "matches" ? acitveHistory3 : defaultHistoryImage3} 
            style={{
              width: '15%',
            }} 
            alt=""
          />
           <img 
            src={activeTab === "matches" ? acitveHistory4 : defaultHistoryImage4} 
            style={{
              width: '15%',
            }} 
            alt=""
          />
            </div>
          <img 
            src={activeTab === "matches" ? acitveHistory : defaultHistoryImage} 
            style={{
              width: '45%',
              margin: 'auto',
              marginTop:'2px',
            }} 
            alt=""
          />
          </div>

          <div style={{
            fontSize: "0.7rem",
            textAlign:'center', 
            // Аналогично для текста
            color: activeTab === "matches" ? '#6FBBE5' : (isDarkTheme ? '#697281' : '#808080')
          }}>
            История матчей
          </div>
        </div>

        {/* Кнопка FAQ */}
        <div 
          id="parent-button"
          style={{ 
            display: 'flex',       
            flexDirection: 'column', 
            width: '66px', 
            height: '50px',
            alignItems: 'center'
          }}
          onClick={() => setActiveTab("faq")}
        >
          <img 
            src={activeTab === "faq" ? activeFaq : defaultAnswersImage} 
            style={{
              width: '45%',
              margin: 'auto',
            }} 
            alt="" 
          />
          <div style={{ 
            fontSize: "0.7rem", 
            textAlign:'center', 
            // Аналогично для текста
            color: activeTab === "faq" ? '#6FBBE5' : (isDarkTheme ? '#697281' : '#808080')
          }}>
            ответы на вопросы
          </div>
        </div>
        {/* Кнопка Профиль */}
        <div 
          id="parent-button"
          style={{ 
            display: 'flex',       
            flexDirection: 'column', 
            width: '66px', 
            height: '50px',
            alignItems: 'center' 
          }}
          onClick={() => setActiveTab("profile")}
        >
          <img 
            src={activeTab === "profile" ? activeProfileImage : defaultProfileImage} 
            style={{
              width: '45%',
              margin: 'auto',
            }} 
            alt=""
          />
          <div style={{
            fontSize: "0.7rem",
            textAlign:'center', 
            // Аналогично для текста
            color: activeTab === "profile" ? '#6FBBE5' : (isDarkTheme ? '#697281' : '#808080')
          }}>
            Мой профиль
          </div>
        </div>

        </div>
        </div>

      </div>

      {/* Отдельная кнопка админки пониже - показываем только если пользователь админ */}
      {isAdmin && !checkingAdmin && (
        <div
          style={{
            position: "absolute",
            top: "75%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            width: "85%",
            maxWidth: "320px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TelegramButton to="/admin" variant="admin">
            🔧 Админ панель
          </TelegramButton>
        </div>
      )}

      {/* Фоновые декоративные элементы - упрощенные */}
      <div
        style={{
          position: "absolute",
          top: "68%",
          right: "10%",
          transform: "rotate(-15deg)",
          opacity: 0.3,
          fontFamily: "EdoSZ, Inter, sans-serif",
          fontSize: "1rem",
          // Меняем цвет текста: белый в тёмной, серый в светлой
          color: isDarkTheme ? "white" : "#808080",
          zIndex: 1,
          pointerEvents: "none",
          textShadow: "0 0 5px rgba(255,255,255,0.3)",
        }}
      >
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "15%",
          transform: "rotate(10deg)",
          opacity: 0.3,
          fontFamily: "EdoSZ, Inter, sans-serif",
          fontSize: "0.8rem",
          // Аналогично
          color: isDarkTheme ? "white" : "#808080",
          zIndex: 1,
          pointerEvents: "none",
          textShadow: "0 0 5px rgba(255,255,255,0.3)",
        }}
      >
      </div>

      <div
        style={{
          position: "absolute",
          top: "70%",
          left: "8%",
          transform: "rotate(-12deg)",
          opacity: 0.3,
          fontFamily: "EdoSZ, Inter, sans-serif",
          fontSize: "1.2rem",
          // Аналогично
          color: isDarkTheme ? "white" : "#808080",
          zIndex: 1,
          pointerEvents: "none",
          textShadow: "0 0 5px rgba(255,255,255,0.3)",
        }}
      >
      </div>
    </Layout>
  );
};

export default MainPage;
