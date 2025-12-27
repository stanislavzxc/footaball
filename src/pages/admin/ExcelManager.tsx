import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { TelegramButton } from "../../components/TelegramButton";
import { TelegramCard } from "../../components/TelegramCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { adminApi } from "../../services/adminApi";
import { showNotification } from "../../utils/api";
import { downloadBlob, generateFilename, checkDownloadSupport } from "../../utils/downloadUtils";

export default function ExcelManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    updated_count: number;
    created_count?: number;
    total_processed?: number;
    errors: string[];
    message: string;
  } | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Проверяем поддержку скачивания
      const support = checkDownloadSupport();
      console.log('Download support info:', support);
      
      const blob = await adminApi.exportPlayerStats();
      const filename = generateFilename('football_stats');
      
      await downloadBlob(blob, {
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        debug: true,
        apiEndpoint: '/api/admin/excel/export-stats'
      });
      
      showNotification('Файл успешно экспортирован', 'success');
    } catch (error) {
      console.error('Error exporting stats:', error);
      showNotification(`Ошибка при экспорте файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      
      const blob = await adminApi.downloadExcelTemplate();
      
      await downloadBlob(blob, {
        filename: 'football_stats_template.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        debug: true,
        apiEndpoint: '/api/admin/excel/template'
      });
      
      showNotification('Шаблон скачан', 'success');
    } catch (error) {
      console.error('Error downloading template:', error);
      showNotification(`Ошибка при скачивании шаблона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting import process...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    try {
      setLoading(true);
      setImportResult(null);
      
      console.log('Calling adminApi.importPlayerStats...');
      const result = await adminApi.importPlayerStats(file);
      console.log('Import result received:', result);
      
      setImportResult(result);
      
      if (result.success) {
        const total = result.total_processed || result.updated_count;
        let message = `Импорт завершен: обработано ${total} игроков`;
        
        if (result.created_count && result.created_count > 0) {
          message += ` (создано ${result.created_count}, обновлено ${result.updated_count})`;
        }
        
        showNotification(message, 'success');
      } else {
        showNotification('Импорт завершен с ошибками', 'info');
      }
    } catch (error) {
      console.error('Error importing stats:', error);
      
      // Более детальная обработка ошибок
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Проверяем, есть ли информация об ошибке от сервера
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Server response:', axiosError.response?.data);
        console.error('Status code:', axiosError.response?.status);
        
        if (axiosError.response?.status === 400) {
          showNotification(`Ошибка валидации: ${axiosError.response?.data?.detail || 'Неверный формат файла'}`, 'error');
        } else if (axiosError.code === 'ECONNABORTED') {
          showNotification('Таймаут при загрузке файла. Попробуйте еще раз.', 'error');
        } else {
          showNotification('Ошибка при импорте файла', 'error');
        }
      } else {
        showNotification('Ошибка при импорте файла', 'error');
      }
    } finally {
      setLoading(false);
      // Сбрасываем значение input для возможности повторного выбора того же файла
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <Layout title="Excel управление" showBackButton>
        <LoadingSpinner message="Обработка файла..." />
      </Layout>
    );
  }

  return (
    <Layout title="Excel управление" showBackButton>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%', 
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        {/* Описание */}
        <TelegramCard style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            📊 Управление статистикой
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            Экспорт и импорт статистики игроков в формате Excel
          </div>
        </TelegramCard>

        {/* Экспорт */}
        <TelegramCard>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📤 Экспорт статистики
          </div>
          <div style={{ 
            fontSize: '0.85rem', 
            opacity: 0.8,
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            Скачать текущую статистику всех игроков в Excel файле
          </div>
          <TelegramButton 
            onClick={handleExport}
            variant="register"
            disabled={loading}
          >
            📥 Скачать статистику
          </TelegramButton>
        </TelegramCard>

        {/* Шаблон */}
        <TelegramCard>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Шаблон для импорта
          </div>
          <div style={{ 
            fontSize: '0.85rem', 
            opacity: 0.8,
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            Скачать пустой шаблон Excel файла для заполнения статистики
          </div>
          <TelegramButton 
            onClick={handleDownloadTemplate}
            variant="secondary"
            disabled={loading}
          >
            📄 Скачать шаблон
          </TelegramButton>
        </TelegramCard>

        {/* Импорт */}
        <TelegramCard>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📤 Импорт статистики
          </div>
          <div style={{ 
            fontSize: '0.85rem', 
            opacity: 0.8,
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            Загрузить Excel файл со статистикой для обновления данных игроков
          </div>
          
          <label style={{
            display: 'block',
            width: '100%',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <div style={{
              width: '100%',
              height: '48px',
              background: 'rgba(255,165,0,0.1)',
              border: '2px solid rgba(255,165,0,0.6)',
              borderRadius: '24px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1
            }}>
              📁 Выбрать Excel файл
            </div>
          </label>
        </TelegramCard>

        {/* Результат импорта */}
        {importResult && (
          <TelegramCard style={{
            background: importResult.success 
              ? 'rgba(76,175,80,0.1)' 
              : 'rgba(255,193,7,0.1)',
            border: importResult.success 
              ? '2px solid rgba(76,175,80,0.3)' 
              : '2px solid rgba(255,193,7,0.3)'
          }}>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: '600',
              marginBottom: '8px',
              color: importResult.success ? '#4CAF50' : '#FFC107'
            }}>
              {importResult.success ? '✅ Импорт завершен' : '⚠️ Импорт с ошибками'}
            </div>
            
            <div style={{ 
              fontSize: '0.9rem', 
              marginBottom: '8px'
            }}>
              {importResult.message}
            </div>

            {importResult.errors.length > 0 && (
              <div style={{ 
                fontSize: '0.8rem', 
                opacity: 0.9,
                marginTop: '8px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Ошибки ({importResult.errors.length}):
                </div>
                <div style={{ 
                  maxHeight: '100px',
                  overflowY: 'auto',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px',
                  borderRadius: '8px',
                  lineHeight: '1.3'
                }}>
                  {importResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {importResult.errors.length > 10 && (
                    <div>... и еще {importResult.errors.length - 10} ошибок</div>
                  )}
                </div>
              </div>
            )}
          </TelegramCard>
        )}

        {/* Инструкция */}
        <TelegramCard style={{ 
          background: 'rgba(33,150,243,0.1)',
          border: '2px solid rgba(33,150,243,0.3)'
        }}>
          <div style={{ 
            fontSize: '0.95rem', 
            fontWeight: '600',
            marginBottom: '8px',
            color: 'white'
          }}>
            💡 Инструкция
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            1. Скачайте текущую статистику или шаблон<br />
            2. Отредактируйте данные в Excel<br />
            3. Загрузите файл обратно для обновления<br />
            4. Проверьте результат импорта
          </div>
        </TelegramCard>

        <div style={{ marginTop: '20px' }}>
          <TelegramButton onClick={() => navigate('/admin')} variant="secondary">
            Назад в админку
          </TelegramButton>
        </div>
      </div>
    </Layout>
  );
}