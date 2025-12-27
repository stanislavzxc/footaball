import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { showNotification } from "../../utils/api";
import { Selector } from "../../components/Selector";

interface Venue {
  id: number;
  name: string;
  address: string;
}

export default function CreateMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    venue_id: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    // Добавляем небольшую задержку, чтобы авторизация успела пройти
    const timer = setTimeout(() => {
      loadVenues();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const loadVenues = async () => {
    try {
      const data = await adminApi.getVenues();
      setVenues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading venues:", error);
    }
  };

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return 0;

    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours;
  };

  const getMaxPlayers = () => {
    const duration = calculateDuration();
    if (duration <= 1) return 12;
    if (duration <= 1.5) return 15;
    return 12; // default
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка что цена больше 0
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      showNotification("Цена должна быть больше 0", "error");
      return;
    }
    
    setLoading(true);

    try {
      const matchData = {
        date: formData.date,
        start_time: `${formData.date}T${formData.start_time}:00`,
        end_time: `${formData.date}T${formData.end_time}:00`,
        venue_id: parseInt(formData.venue_id),
        price: price,
        description: formData.description,
      };

      await adminApi.createMatch(matchData);
      setSuccess(true);
    } catch (error) {
      console.error("Error creating match:", error);
      showNotification("Ошибка при создании матча", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectorChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (success) {
    return (
      <Layout title="Матч создан" showBackButton>
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
              Матч появился в клиентской части в разделе "Записаться на игру"
            </div>
          </TelegramCard>

          <TelegramButton onClick={() => navigate("/admin")}>
            Назад в админку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Добавить матч для записи">
      <div className="create-match-container">
        <form onSubmit={handleSubmit} className="create-match-form">
          <div className="form-group">
            <label htmlFor="date">Дата матча</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Время начала</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">Время окончания</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {formData.start_time && formData.end_time && (
            <div className="duration-info">
              <p>Продолжительность: {calculateDuration()} ч</p>
              <p>
                Лимит основного списка:{" "}
                <strong>{getMaxPlayers()} человек</strong>
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="venue_id">Площадка</label>
            <Selector
              name="venue_id"
              value={formData.venue_id}
              onChange={handleSelectorChange}
              placeholder="Выберите площадку"
              options={venues.map((venue) => ({
                value: String(venue.id),
                label: `${venue.name} - ${venue.address}`,
              }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Стоимость (руб.)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание (необязательно)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Дополнительная информация о матче..."
            />
          </div>

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
              {loading ? "Создание..." : "Создать матч"}
            </button>

            <TelegramButton
              onClick={() => navigate("/admin")}
              variant="secondary"
            >
              Отмена
            </TelegramButton>
          </div>
        </form>
      </div>
    </Layout>
  );
}
