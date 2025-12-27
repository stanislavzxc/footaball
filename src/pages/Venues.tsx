import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layout } from '../components/Layout';
import { TelegramCard } from '../components/TelegramCard';
import { TelegramButton } from '../components/TelegramButton';
import { TelegramLoader } from '../components/TelegramLoader';
import { Venue } from '../types';

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await api.getVenues();
        setVenues(data || []);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const getSurfaceTypeText = (surfaceType: string) => {
    switch (surfaceType) {
      case 'artificial_grass': return 'иск. трава';
      case 'grass': return 'натур. трава';
      case 'indoor': return 'зал';
      default: return surfaceType;
    }
  };

  const getVenueFeatures = (venue: Venue) => {
    const features = [];
    features.push(getSurfaceTypeText(venue.surface_type));
    features.push('5х5');
    if (venue.has_showers) features.push('душевые');
    if (venue.has_drinking_water) features.push('вода');
    if (venue.has_parking) features.push('паркет');
    return features.join(' | ');
  };

  if (loading) {
    return (
      <Layout title="Площадки" showBackButton>
        <TelegramLoader message="Загрузка площадок..." />
      </Layout>
    );
  }

  return (
    <Layout title="Площадки" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {venues.length > 0 ? (
          venues.map((venue) => (
            <TelegramCard key={venue.id}>
              {venue.image_url && (
                <div style={{ 
                  width: '100%', 
                  height: '120px', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏟️ {venue.name}
              </div>
              
              <div style={{ 
                fontSize: '0.9rem', 
                marginBottom: '12px',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📍 {venue.address}
              </div>
              
              <div style={{ 
                fontSize: '0.85rem', 
                opacity: 0.9,
                marginBottom: '8px',
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 10px',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                {getVenueFeatures(venue)}
              </div>
              
              {venue.contact_phone && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <img src="/icon-time.png" alt="Телефон" style={{ width: "14px", height: "14px" }} />
                  {venue.contact_phone}
                </div>
              )}
              
              {venue.notes && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.7, 
                  marginTop: '8px',
                  fontStyle: 'italic',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  💡 {venue.notes}
                </div>
              )}
            </TelegramCard>
          ))
        ) : (
          <div style={{ 
            color: 'white', 
            textAlign: 'center', 
            fontSize: '1.1rem',
            marginTop: '50px',
            opacity: 0.8
          }}>
            Площадки не найдены
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton to="/" variant="secondary">
            Назад на главную
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}