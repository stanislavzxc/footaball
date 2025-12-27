import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { showNotification } from "../../utils/api";
import type { PlayerStats } from "../../types";

export default function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  // Обновляем filteredPlayers когда загружаются players
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlayers(players);
    }
  }, [players, searchQuery]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      console.log("Loading players...");

      // Сначала пробуем загрузить всех пользователей
      const data = await adminApi.getAllUsers();
      console.log("Players data from getAllUsers:", data);
      
      // Преобразуем User[] в PlayerStats[]
      const playersData = Array.isArray(data)
        ? data.map(
            (user): PlayerStats => ({
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              created_at: user.created_at,
              total_matches: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              mvp_count: 0,
              best_goal_count: 0,
              best_save_count: 0,
            })
          )
        : [];
      
      setPlayers(playersData);
      setFilteredPlayers(playersData);
      
      console.log("Processed players data:", playersData);
      
    } catch (error) {
      console.error("Error loading players:", error);
      showNotification("Ошибка загрузки игроков", "error");
      
      // Показываем пустой список вместо ошибки
      setPlayers([]);
      setFilteredPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Функция поиска
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPlayers(players);
      return;
    }

    const filtered = players.filter(player => 
      (player.full_name?.toLowerCase().includes(query.toLowerCase())) ||
      (player.username?.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredPlayers(filtered);
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
              Игрок убран из общего списка
            </div>
          </TelegramCard>

          <TelegramButton onClick={() => setSuccess(false)}>
            Назад к списку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Список всех игроков" showBackButton>
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
        {loading ? (
          <div
            style={{
              color: "white",
              fontSize: "1.1rem",
              textAlign: "center",
              marginTop: "50px",
            }}
          >
            Загрузка статистики...
          </div>
        ) : (
          <>
            {/* Поле поиска */}
            <TelegramCard style={{ width: '100%', maxWidth: '320px' }}>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                🔍 Поиск игроков
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Введите имя или @username"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              {searchQuery && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.7, 
                  marginTop: '8px' 
                }}>
                  Найдено: {filteredPlayers.length} из {players.length}
                </div>
              )}
            </TelegramCard>

            {filteredPlayers.length === 0 ? (
              <div
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: "1.1rem",
                  marginTop: "50px",
                  opacity: 0.8,
                }}
              >
                Нет данных об игроках
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <TelegramCard key={player.id}>
                  <div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      @{player.username || player.full_name}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "6px",
                        fontSize: "0.85rem",
                        opacity: 0.9,
                      }}
                    >
                      <div>🏆 Побед: {player.wins || 0}</div>
                      <div>🤝 Ничьих: {player.draws || 0}</div>
                      <div>❌ Поражений: {player.losses || 0}</div>
                      <div>⚽ Всего: {player.total_matches || 0}</div>
                      <div>🌟 MVP: {player.mvp_count || 0}</div>
                      <div>⚡ Голы: {player.best_goal_count || 0}</div>
                    </div>
                  </div>
                </TelegramCard>
              ))
            )}
          </>
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
