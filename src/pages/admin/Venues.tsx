import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { adminApi } from "../../services/adminApi";
import { showNotification } from "../../utils/api";
import { Selector } from "../../components/Selector";

import type { Venue as ApiVenue } from "../../types";

interface Venue extends ApiVenue {
  surface_type: string;
  has_showers: boolean;
  has_drinking_water: boolean;
  has_parking: boolean;
}

export default function AdminVenues() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    surface_type: 'artificial_grass',
    capacity: 20,
    has_showers: false,
    has_drinking_water: false,
    has_parking: false,
    contact_phone: '',
    notes: '',
    image_url: ''
  });

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      console.log('Loading venues...');
      const data = await adminApi.getVenues();
      console.log('Venues data received:', data);
      
      // API теперь возвращает массив напрямую
      const venuesArray: Venue[] = Array.isArray(data)
        ? data.map((v: any) => ({
            ...v,
            surface_type: v.surface_type || 'artificial_grass',
            has_showers: !!v.has_showers,
            has_drinking_water: !!v.has_drinking_water,
            has_parking: !!v.has_parking,
          }))
        : [];
      
      console.log('Setting venues:', venuesArray);
      setVenues(venuesArray);
    } catch (error) {
      console.error('Error loading venues:', error);
      showNotification('Ошибка загрузки площадок', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      surface_type: 'artificial_grass',
      capacity: 20,
      has_showers: false,
      has_drinking_water: false,
      has_parking: false,
      contact_phone: '',
      notes: '',
      image_url: ''
    });
    setEditingVenue(null);
    setShowForm(false);
  };

  const handleEdit = (venue: Venue) => {
    setFormData({
      name: venue.name,
      address: venue.address,
      surface_type: venue.surface_type || 'artificial_grass',
      capacity: 20, // Default capacity
      has_showers: venue.has_showers || false,
      has_drinking_water: venue.has_drinking_water || false,
      has_parking: venue.has_parking || false,
      contact_phone: venue.contact_phone || '',
      notes: venue.notes || '',
      image_url: venue.image_url || ''
    });
    setEditingVenue(venue);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingVenue) {
        // Update existing venue
        await adminApi.updateVenue(editingVenue.id, formData);
        showNotification('Площадка обновлена', 'success');
      } else {
        // Create new venue
        await adminApi.createVenue(formData);
        showNotification('Площадка создана', 'success');
      }
      
      setSuccess(true);
      await loadVenues();
      resetForm();
    } catch (error) {
      console.error('Error saving venue:', error);
      showNotification('Ошибка при сохранении площадки', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: number) => {
    if (!window.confirm('Удалить площадку? Это действие нельзя отменить.')) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.deleteVenue(venueId);
      showNotification('Площадка удалена', 'success');
      await loadVenues();
    } catch (error) {
      console.error('Error deleting venue:', error);
      showNotification('Ошибка при удалении площадки', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectorChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <Layout title="Площадка сохранена" showBackButton>
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
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px' }}>
              Данные успешно обновлены
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9, lineHeight: '1.4' }}>
              Площадка {editingVenue ? 'обновлена' : 'создана'}
            </div>
          </TelegramCard>
          
          <TelegramButton onClick={() => setSuccess(false)}>
            Назад к списку
          </TelegramButton>
        </div>
      </Layout>
    );
  }

  if (showForm) {
    return (
      <Layout title={editingVenue ? "Редактировать площадку" : "Добавить площадку"} showBackButton>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px', 
          width: '100%', 
          alignItems: 'center',
          paddingBottom: '20px'
        }}>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px' }}>
            {/* Название площадки */}
            <TelegramCard>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Название площадки *
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Например: Стадион Центральный"
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
            </TelegramCard>

            {/* Адрес */}
            <TelegramCard>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Адрес *
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Полный адрес площадки"
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
            </TelegramCard>

            {/* Тип покрытия */}
            <TelegramCard>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Тип покрытия
              </div>
              <Selector
                name="surface_type"
                value={formData.surface_type}
                onChange={handleSelectorChange}
                options={[
                  { value: "artificial_grass", label: "Искусственная трава" },
                  { value: "grass", label: "Натуральная трава" },
                  { value: "parquet", label: "паркет" },
                  { value: "rubber", label: "Резиновое покрытие" },
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

            {/* Контактный телефон */}
            <TelegramCard>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Контактный телефон
              </div>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="+7 (xxx) xxx-xx-xx"
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
            </TelegramCard>

            {/* Удобства */}
            <TelegramCard>
              <div style={{ marginBottom: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
                Удобства
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <input
                    type="checkbox"
                    name="has_showers"
                    checked={formData.has_showers}
                    onChange={handleInputChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  🚿 Душевые
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <input
                    type="checkbox"
                    name="has_drinking_water"
                    checked={formData.has_drinking_water}
                    onChange={handleInputChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  💧 Питьевая вода
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  <input
                    type="checkbox"
                    name="has_parking"
                    checked={formData.has_parking}
                    onChange={handleInputChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  🚗 паркет
                </label>
              </div>
            </TelegramCard>

            {/* Дополнительная информация */}
            <TelegramCard>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Дополнительная информация
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Особенности площадки, правила, дополнительная информация..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </TelegramCard>

            {/* Изображение площадки */}
            <TelegramCard>
              <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Изображение площадки
              </div>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
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
              {formData.image_url && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>
                    Предварительный просмотр:
                  </div>
                  <img
                    src={formData.image_url}
                    alt="Предварительный просмотр"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </TelegramCard>

            {/* Кнопки */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              alignItems: 'center',
              marginTop: '20px'
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '48px',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                  border: '2px solid rgba(255,255,255,0.8)',
                  borderRadius: '24px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Сохранение...' : (editingVenue ? 'Обновить' : 'Создать')}
              </button>

          <TelegramButton
                onClick={resetForm}
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

  return (
    <Layout title="Управление площадками" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Заголовок и кнопка добавления */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '320px',
          marginBottom: '8px'
        }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            color: 'white'
          }}>
            Список площадок
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'rgba(76, 175, 80, 0.2)',
              border: '2px solid rgba(76, 175, 80, 0.6)',
              borderRadius: '16px',
              color: '#4CAF50',
              fontSize: '0.9rem',
              fontWeight: '600',
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            + Добавить
          </button>
        </div>
        
        {venues.length === 0 ? (
          <div style={{ 
            color: 'white', 
            textAlign: 'center', 
            fontSize: '1.1rem',
            marginTop: '50px',
            opacity: 0.8
          }}>
            Площадки не найдены
          </div>
        ) : (
          venues.map((venue) => (
            <TelegramCard key={venue.id}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                width: '100%'
              }}>
                {venue.image_url && (
                  <div style={{ 
                    width: '80px', 
                    height: '60px', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    flexShrink: 0
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
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    🏟️ {venue.name}
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    marginBottom: '4px',
                    opacity: 0.8
                  }}>
                    📍 {venue.address}
                  </div>
                  
                  <div style={{
                    fontSize: '0.85rem',
                    marginBottom: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'inline-block',
                    width: 'fit-content'
                  }}>
                    {venue.surface_type === 'artificial_grass' && '🌱 Искусственная трава'}
                    {venue.surface_type === 'grass' && '🌿 Натуральная трава'}
                    {venue.surface_type === 'parquet' && '🏀 паркет'}
                    {venue.surface_type === 'rubber' && '🏃 Резиновое покрытие'}
                    {venue.surface_type === 'indoor' && '🏢 Зал'}
                  </div>
                  
                  {venue.contact_phone && (
                    <div style={{
                      fontSize: '0.85rem',
                      marginBottom: '4px',
                      opacity: 0.8
                    }}>
                      📞 {venue.contact_phone}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '4px'
                  }}>
                    {venue.has_showers && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        🚿 Душевые
                      </span>
                    )}
                    {venue.has_drinking_water && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        💧 Вода
                      </span>
                    )}
                    {venue.has_parking && (
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        🚗 паркет
                      </span>
                    )}
                  </div>
                  
                  {venue.notes && (
                    <div style={{
                      fontSize: '0.8rem',
                      opacity: 0.7,
                      fontStyle: 'italic',
                      marginTop: '4px'
                    }}>
                      💡 {venue.notes}
                    </div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  flexShrink: 0
                }}>
                  <button
                    onClick={() => handleEdit(venue)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Изменить
                  </button>
                  
                  <button
                    onClick={() => handleDelete(venue.id)}
                    disabled={loading}
                    style={{
                      background: 'rgba(255,0,0,0.2)',
                      border: '1px solid rgba(255,0,0,0.5)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '4px 8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: loading ? 0.5 : 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </TelegramCard>
          ))
        )}

        <div style={{ marginTop: '20px' }}>
          <TelegramButton onClick={() => navigate('/admin')} variant="secondary">
            Назад в админку
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}