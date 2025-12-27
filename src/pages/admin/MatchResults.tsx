import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { TabSwitcher } from "../../components/TabSwitcher";
import { adminApi } from "../../services/adminApi";
import { showNotification, formatDateTime } from "../../utils/api";
import { Selector } from "../../components/Selector";

interface User {
  id: number;
  username?: string;
  full_name?: string;
}

interface Match {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  venue: {
    name: string;
  };
}

export default function MatchResults() {
  const navigate = useNavigate();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [matchesWithResults, setMatchesWithResults] = useState<Match[]>([]);
  const [matchesWithoutResults, setMatchesWithoutResults] = useState<Match[]>(
    []
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasExistingResults, setHasExistingResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"empty" | "filled">("empty");
  const [categorizing, setCategorizing] = useState(false);

  const [teamColors, setTeamColors] = useState({
    team1: "red",
    team2: "green",
  });

  const [formData, setFormData] = useState({
    winning_team: "draw",
    best_player_id: "",
    best_goal_player_id: "",
    best_save_player_id: "",
    notes: "",
  });

  useEffect(() => {
    loadCompletedMatches();
    loadPlayers();
  }, []);

  const loadCompletedMatches = async () => {
    try {
      console.log("Loading completed matches...");
      const data = await adminApi.getMatches(); // Получаем все матчи
      console.log("Matches data received:", data);

      // Проверяем разные форматы ответа
      let matchesArray = [];
      if (Array.isArray(data)) {
        matchesArray = data;
      } else if (data && Array.isArray(data.matches)) {
        matchesArray = data.matches;
      } else if (data && Array.isArray((data as any).data)) {
        matchesArray = (data as any).data;
      } else {
        console.warn("Unexpected matches data format:", data);
        matchesArray = [];
      }

      // Фильтруем прошедшие матчи
      const pastMatches = matchesArray.filter(
        (match: Match) => new Date(match.start_time) < new Date()
      );

      // Сортируем по убыванию времени (новые сверху)
      const sortedMatches = pastMatches.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );

      console.log("Setting past matches:", sortedMatches);
      setAllMatches(sortedMatches);

      // Разделяем матчи на те, у которых есть результаты и у которых нет
      await categorizeMatches(sortedMatches);
    } catch (error) {
      console.error("Error loading matches:", error);
      showNotification("Ошибка загрузки матчей", "error");
    }
  };

  const categorizeMatches = async (matches: Match[]) => {
    setCategorizing(true);
    const withResults: Match[] = [];
    const withoutResults: Match[] = [];

    for (const match of matches) {
      try {
        const fullMatch = await adminApi.getMatchWithResults(match.id);
        if (fullMatch.results) {
          withResults.push(match);
        } else {
          withoutResults.push(match);
        }
      } catch (error) {
        console.warn(`Failed to load results for match ${match.id}:`, error);
        // Если не удалось загрузить результаты, считаем что их нет
        withoutResults.push(match);
      }
    }

    setMatchesWithResults(withResults);
    setMatchesWithoutResults(withoutResults);
    setCategorizing(false);

    console.log("Matches with results:", withResults.length);
    console.log("Matches without results:", withoutResults.length);
  };

  const loadPlayers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setPlayers(data);
    } catch (error) {
      console.error("Error loading players:", error);
    }
  };

  const handleMatchSelect = async (match: Match) => {
    setSelectedMatch(match);

    // Загружаем полную информацию о матче с результатами
    try {
      const fullMatch = await adminApi.getMatchWithResults(match.id);

      if (fullMatch.results) {
        // Заполняем форму существующими данными
        // Определяем какие команды использовались в результатах
        const redScore = fullMatch.results.red_team_score || 0;
        const greenScore = fullMatch.results.green_team_score || 0;
        const blueScore = fullMatch.results.blue_team_score || 0;

        // Определяем какие команды играли на основе счета и победителя
        const usedTeams = [];

        // Добавляем команды, которые имеют ненулевой счет или являются победителем
        if (redScore > 0 || fullMatch.results.winning_team === "red") {
          usedTeams.push("red");
        }
        if (greenScore > 0 || fullMatch.results.winning_team === "green") {
          usedTeams.push("green");
        }
        if (blueScore > 0 || fullMatch.results.winning_team === "blue") {
          usedTeams.push("blue");
        }

        // Если у нас меньше 2 команд, добавляем команды с нулевым счетом
        if (usedTeams.length < 2) {
          if (!usedTeams.includes("red")) usedTeams.push("red");
          if (!usedTeams.includes("green") && usedTeams.length < 2)
            usedTeams.push("green");
          if (!usedTeams.includes("blue") && usedTeams.length < 2)
            usedTeams.push("blue");
        }

        // Берем только первые 2 команды
        const finalTeams = usedTeams.slice(0, 2);

        // Если все еще меньше 2 команд, используем дефолтные
        if (finalTeams.length < 2) {
          finalTeams.length = 0;
          finalTeams.push("red", "green");
        }

        // Устанавливаем цвета команд
        setTeamColors({
          team1: finalTeams[0] || "red",
          team2: finalTeams[1] || "green",
        });

        // Определяем счет для каждой команды
        let team1Score = "";
        let team2Score = "";

        if (finalTeams[0] === "red") team1Score = redScore.toString();
        else if (finalTeams[0] === "green") team1Score = greenScore.toString();
        else if (finalTeams[0] === "blue") team1Score = blueScore.toString();

        if (finalTeams[1] === "red") team2Score = redScore.toString();
        else if (finalTeams[1] === "green") team2Score = greenScore.toString();
        else if (finalTeams[1] === "blue") team2Score = blueScore.toString();

        setFormData({
          winning_team: fullMatch.results.winning_team || "draw",
          best_player_id: fullMatch.results.best_player_id?.toString() || "",
          best_goal_player_id:
            fullMatch.results.best_goal_player_id?.toString() || "",
          best_save_player_id:
            fullMatch.results.best_save_player_id?.toString() || "",
          notes: fullMatch.results.notes || "",
        });
        setHasExistingResults(true);
      } else {
        // Сбрасываем форму для нового результата
        // Сбрасываем на дефолтные значения
        setTeamColors({ team1: "red", team2: "green" });
        setFormData({
          winning_team: "draw",
          best_player_id: "",
          best_goal_player_id: "",
          best_save_player_id: "",
          notes: "",
        });
        setHasExistingResults(false);
      }
    } catch (error) {
      console.error("Error loading match details:", error);
      showNotification("Ошибка загрузки данных матча", "error");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectorChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamColorChange = (team: "team1" | "team2", color: string) => {
    const newTeamColors = { ...teamColors };

    // Если выбранный цвет уже используется другой командой, меняем их местами
    if (team === "team1" && color === teamColors.team2) {
      newTeamColors.team1 = color;
      newTeamColors.team2 = teamColors.team1;
    } else if (team === "team2" && color === teamColors.team1) {
      newTeamColors.team2 = color;
      newTeamColors.team1 = teamColors.team2;
    } else {
      newTeamColors[team] = color;
    }

    setTeamColors(newTeamColors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setLoading(true);
    try {
      // Формируем результаты с выбранным победителем
      const results: any = {
        winning_team: formData.winning_team || "draw",
        red_team_score: 0,
        green_team_score: 0,
        blue_team_score: 0,
        best_player_id: formData.best_player_id
          ? parseInt(formData.best_player_id)
          : undefined,
        best_goal_player_id: formData.best_goal_player_id
          ? parseInt(formData.best_goal_player_id)
          : undefined,
        best_save_player_id: formData.best_save_player_id
          ? parseInt(formData.best_save_player_id)
          : undefined,
        notes: formData.notes || undefined,
      };

      console.log("Sending results:", results); // Для отладки

      await adminApi.updateMatchResults(selectedMatch.id, results);
      setSuccess(true);
    } catch (error) {
      console.error("Error updating match results:", error);
      showNotification("Ошибка при внесении результатов", "error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout title="Результаты внесены" showBackButton>
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
              Данные появились в клиентской части в "История матчей"
              <br />
              Обновлена личная статистика игроков
            </div>
          </TelegramCard>

          <TelegramButton onClick={() => navigate("/admin")}>
            Назад в админку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  if (!selectedMatch) {
    const currentMatches =
      activeTab === "empty" ? matchesWithoutResults : matchesWithResults;

    if (categorizing) {
      return (
        <Layout title="Внести данные о матче" showBackButton>
          <LoadingSpinner message="Анализ матчей..." />
        </Layout>
      );
    }

    return (
      <Layout title="Внести данные о матче" showBackButton>
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
          {/* Переключатель вкладок */}
          <TabSwitcher
            tabs={[
              {
                id: "empty",
                label: "Ввести данные",
                icon: "📝",
                count: matchesWithoutResults.length,
              },
              {
                id: "filled",
                label: "Редактировать",
                icon: "✏️",
                count: matchesWithResults.length,
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as "empty" | "filled")}
          />

          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "white",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            {activeTab === "empty"
              ? "Матчи без результатов:"
              : "Матчи с результатами:"}
          </div>

          {currentMatches.length === 0 ? (
            <EmptyState
              icon={activeTab === "empty" ? "✅" : "📊"}
              title={
                activeTab === "empty"
                  ? "Все матчи имеют результаты"
                  : "Нет матчей с результатами"
              }
              description={
                activeTab === "empty"
                  ? "Отличная работа! Все завершенные матчи имеют внесенные результаты."
                  : "Пока нет матчей с внесенными результатами для редактирования."
              }
              action={
                <TelegramButton
                  onClick={() => navigate("/admin")}
                  variant="secondary"
                >
                  Назад в админку
                </TelegramButton>
              }
            />
          ) : (
            currentMatches.map((match) => (
              <TelegramCard
                key={match.id}
                onClick={() => handleMatchSelect(match)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      {formatDateTime(match.date, match.start_time)} -{" "}
                      {new Date(match.end_time).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        opacity: 0.8,
                        marginBottom: "4px",
                      }}
                    >
                      {match.venue.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: activeTab === "empty" ? "#FFA500" : "#90EE90",
                        fontWeight: "600",
                      }}
                    >
                      {activeTab === "empty"
                        ? "📝 Введите данные"
                        : "✏️ Редактировать"}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.2rem", opacity: 0.7 }}>→</div>
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

  return (
    <Layout
      title={
        hasExistingResults
          ? "Редактирование результатов"
          : "Ввод результатов матча"
      }
      showBackButton
    >
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
        {/* Информация о матче */}
        <TelegramCard style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            {formatDateTime(selectedMatch.date, selectedMatch.start_time)} -{" "}
            {new Date(selectedMatch.end_time).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div
            style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "8px" }}
          >
            {selectedMatch.venue.name}
          </div>
          {hasExistingResults && (
            <div
              style={{
                fontSize: "0.8rem",
                color: "#FFA500",
                fontWeight: "600",
                background: "rgba(255,165,0,0.1)",
                padding: "4px 8px",
                borderRadius: "8px",
                display: "inline-block",
              }}
            >
              ✏️ Редактирование существующих результатов
            </div>
          )}
        </TelegramCard>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", maxWidth: "320px" }}
        >
          {/* Победитель */}
          <TelegramCard>
            <div
              style={{
                marginBottom: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              🏆 Победитель матча
            </div>
            <Selector
              name="winning_team"
              value={formData.winning_team || "draw"}
              onChange={handleSelectorChange}
              options={[
                { value: "draw", label: "🤝 Ничья" },
                { value: "red", label: "🔴 Красные" },
                { value: "green", label: "🟢 Зеленые" },
                { value: "blue", label: "🔵 Синие" },
              ]}
              style={{
                padding: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </TelegramCard>

          {/* Лучший игрок */}
          <TelegramCard>
            <div
              style={{
                marginBottom: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              🌟 Лучший игрок матча
            </div>
            <Selector
              name="best_player_id"
              value={formData.best_player_id}
              onChange={handleSelectorChange}
              options={[
                { value: "", label: "Не выбран" },
                ...players.map((player) => ({
                  value: String(player.id),
                  label: `${player.full_name} (@${player.username})`,
                })),
              ]}
              style={{
                padding: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </TelegramCard>

          {/* Лучший гол */}
          <TelegramCard>
            <div
              style={{
                marginBottom: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              ⚡ Лучший гол матча
            </div>
            <Selector
              name="best_goal_player_id"
              value={formData.best_goal_player_id}
              onChange={handleSelectorChange}
              options={[
                { value: "", label: "Не выбран" },
                ...players.map((player) => ({
                  value: String(player.id),
                  label: `${player.full_name} (@${player.username})`,
                })),
              ]}
              style={{
                padding: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </TelegramCard>

          {/* Лучший сейв */}
          <TelegramCard>
            <div
              style={{
                marginBottom: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              🥅 Лучший сейв матча
            </div>
            <Selector
              name="best_save_player_id"
              value={formData.best_save_player_id}
              onChange={handleSelectorChange}
              options={[
                { value: "", label: "Не выбран" },
                ...players.map((player) => ({
                  value: String(player.id),
                  label: `${player.full_name} (@${player.username})`,
                })),
              ]}
              style={{
                padding: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </TelegramCard>

          {/* Заметки */}
          <TelegramCard>
            <div
              style={{
                marginBottom: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              📝 Дополнительные заметки
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Дополнительная информация о матче..."
              className="form-group"
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
                minHeight: "80px",
                caretColor: "white",
              }}
            />
          </TelegramCard>

          {/* Кнопки */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              className="telegram-button telegram-button-primary"
              style={{
                width: "100%",
                maxWidth: "320px",
                height: "48px",
                background: loading
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.02)",
                border: "2px solid rgba(255,255,255,0.8)",
                borderRadius: "24px",
                color: "white",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Сохранение..."
                : hasExistingResults
                ? "Обновить результаты"
                : "Внести результаты"}
            </button>

            <TelegramButton
              onClick={() => setSelectedMatch(null)}
              variant="secondary"
            >
              Назад к списку
            </TelegramButton>
          </div>
        </form>
      </div>
    </Layout>
  );
}
