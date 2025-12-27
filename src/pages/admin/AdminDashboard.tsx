import { Layout } from "../../components/Layout";
import { TelegramCard } from "../../components/TelegramCard";
import { TelegramButton } from "../../components/TelegramButton";

export default function AdminDashboard() {
  const adminMenuItems = [
    {
      title: "Добавить матч для записи",
      description: "Создать новый матч",
      path: "/admin/matches/create",
      icon: "⚽"
    },
    {
      title: "Текущие брони",
      description: "Просмотр активных записей",
      path: "/admin/bookings",
      icon: "📋"
    },
    {
      title: "Внести данные о матче",
      description: "Результаты завершенных матчей",
      path: "/admin/match-results",
      icon: "🏆"
    },
    {
      title: "Оповещение игроков",
      description: "Отправить уведомления",
      path: "/admin/notifications",
      icon: "📢"
    },
    {
      title: "Запросы на возврат",
      description: "Обработка возвратов",
      path: "/admin/refunds",
      icon: "💰"
    },

    {
      title: "Список всех игроков",
      description: "Статистика игроков",
      path: "/admin/players",
      icon: "👥"
    },
    {
      title: "Управление площадками",
      description: "Добавить/редактировать площадки",
      path: "/admin/venues",
      icon: "🏟️"
    },
    {
      title: "Логи",
      description: "Мониторинг активности",
      path: "/admin/logs",
      icon: "📊"
    },
    {
      title: "Excel управление",
      description: "Экспорт/импорт статистики",
      path: "/admin/excel",
      icon: "📈"
    }
  ];

  return (
    <Layout title="Админ панель" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {adminMenuItems.map((item, index) => (
          <TelegramCard key={index} to={item.path}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '4px',
                  lineHeight: '1.2'
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  opacity: 0.8,
                  lineHeight: '1.2'
                }}>
                  {item.description}
                </div>
              </div>
            </div>
          </TelegramCard>
        ))}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to="/" variant="secondary">
            На главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}