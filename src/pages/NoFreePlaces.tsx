import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';

export default function NoFreePlaces() {
  const { matchId } = useParams<{ matchId: string }>();

  return (
    <Layout title="Нет свободных мест" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        paddingTop: '40px',
        paddingBottom: '20px',
        gap: '20px'
      }}>
        <TelegramCard style={{ 
          textAlign: 'center',
          padding: '32px 24px',
          minHeight: '250px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ 
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            😔
          </div>
          
          <div style={{ 
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            Упс! Мест нет
          </div>
          
          <div style={{ 
            fontSize: '1rem', 
            opacity: 0.9,
            lineHeight: '1.5',
            marginBottom: '16px'
          }}>
            К сожалению, все места на этот матч уже заняты.<br />
            Попробуйте записаться на другую игру.
          </div>

          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.7,
            background: 'rgba(255,165,0,0.2)',
            padding: '12px',
            borderRadius: '10px',
            marginTop: '12px',
            lineHeight: '1.4'
          }}>
            💡 Совет: следите за уведомлениями - иногда освобождаются места из-за отмен
          </div>
        </TelegramCard>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          alignItems: 'center' 
        }}>
          <TelegramButton to="/register">
            Другие игры
          </TelegramButton>

          {matchId && (
            <TelegramButton to={`/match/${matchId}/players`} variant="secondary">
              Посмотреть список
            </TelegramButton>
          )}

          <TelegramButton to="/" variant="secondary">
            На главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}