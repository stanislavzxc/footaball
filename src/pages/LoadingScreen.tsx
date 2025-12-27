import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

export default function LoadingScreen() {
  const mockMatches = [
    { id: 1, date: '15 апреля, пн.', time: '20:30-21:30' },
    { id: 2, date: '17 апреля, ср.', time: '21:00-22:00' },
    { id: 3, date: '19 апреля, пт.', time: '21:30-23:00' },
    { id: 4, date: '21 апреля, пн.', time: '21:00-22:00' }
  ];

  return (
    <Layout title="Записаться на игру" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {mockMatches.map((match) => (
          <TelegramCard key={match.id} to={`/match/${match.id}`}>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {match.date} ({match.time})
            </div>
          </TelegramCard>
        ))}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to="/" variant="secondary">
            Назад на главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}