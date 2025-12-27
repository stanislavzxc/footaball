/**
 * Утилиты для скачивания файлов с поддержкой macOS
 */

// Детектор операционной системы и среды
export const detectOS = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const isNgrok = window.location.hostname.includes('ngrok');
  
  return {
    isMacOS: /Mac|iPod|iPhone|iPad/.test(platform) || /Macintosh/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isNgrok,
    userAgent,
    platform
  };
};

// Интерфейс для опций скачивания
interface DownloadOptions {
  filename: string;
  mimeType?: string;
  forceDirectDownload?: boolean;
  debug?: boolean;
  apiEndpoint?: string; // Для прямых ссылок на API
}

// Основная функция скачивания с fallback методами
export const downloadBlob = async (
  blob: Blob, 
  options: DownloadOptions
): Promise<void> => {
  const { 
    filename, 
    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    forceDirectDownload = false,
    debug = false,
    apiEndpoint
  } = options;
  
  const osInfo = detectOS();
  
  if (debug) {
    console.log('Download debug info:', {
      osInfo,
      blobSize: blob.size,
      blobType: blob.type,
      filename,
      mimeType,
      apiEndpoint
    });
  }
  
  // Проверяем размер blob
  if (blob.size === 0) {
    throw new Error('Cannot download empty file');
  }
  
  // Если это ngrok или принудительное прямое скачивание, используем API ссылку
  if (osInfo.isNgrok || forceDirectDownload) {
    if (apiEndpoint) {
      if (debug) console.log('Using direct API link for ngrok');
      await downloadViaDirectLink(apiEndpoint, filename, debug);
      return;
    }
  }
  
  // Создаем правильный blob с нужным MIME-типом
  const correctBlob = new Blob([blob], { type: mimeType });
  
  // Выбираем метод скачивания
  if (osInfo.isMacOS && osInfo.isSafari) {
    // Для Safari на macOS используем прямую ссылку если возможно
    if (debug) console.log('Using direct download method for Safari');
    await downloadDirect(correctBlob, filename, debug);
  } else {
    // Стандартный метод через blob URL
    if (debug) console.log('Using blob URL method');
    await downloadWithBlobURL(correctBlob, filename, osInfo.isMacOS, debug);
  }
};

// Скачивание через blob URL (стандартный метод)
const downloadWithBlobURL = async (
  blob: Blob, 
  filename: string, 
  isMacOS: boolean,
  debug: boolean = false
): Promise<void> => {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    a.rel = 'noopener noreferrer';
    
    // Добавляем в DOM
    document.body.appendChild(a);
    
    // Кликаем для скачивания
    a.click();
    
    // Для macOS добавляем задержку перед очисткой
    const cleanupDelay = isMacOS ? 500 : 100;
    
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (debug) console.log('Blob URL cleaned up');
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    }, cleanupDelay);
    
    if (debug) console.log(`Download initiated, cleanup in ${cleanupDelay}ms`);
    
  } catch (error) {
    console.error('Error in downloadWithBlobURL:', error);
    throw error;
  }
};

// Прямое скачивание (fallback метод)
const downloadDirect = async (
  blob: Blob, 
  filename: string,
  debug: boolean = false
): Promise<void> => {
  try {
    // Пытаемся использовать File System Access API если доступен
    if ('showSaveFilePicker' in window) {
      if (debug) console.log('Using File System Access API');
      
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Excel files',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
          }
        }]
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      if (debug) console.log('File saved using File System Access API');
      return;
    }
    
    // Fallback к обычному методу
    if (debug) console.log('Falling back to blob URL method');
    await downloadWithBlobURL(blob, filename, true, debug);
    
  } catch (error) {
    if (debug) console.log('Direct download failed, using blob URL:', error);
    await downloadWithBlobURL(blob, filename, true, debug);
  }
};

// Проверка поддержки скачивания
export const checkDownloadSupport = () => {
  const osInfo = detectOS();
  
  return {
    ...osInfo,
    supportsBlob: typeof Blob !== 'undefined',
    supportsURL: typeof URL !== 'undefined' && typeof URL.createObjectURL !== 'undefined',
    supportsDownload: 'download' in document.createElement('a'),
    supportsFileSystemAccess: 'showSaveFilePicker' in window,
    recommendedMethod: osInfo.isNgrok ? 'direct-api' : osInfo.isMacOS && osInfo.isSafari ? 'direct' : 'blob'
  };
};

// Скачивание через прямую ссылку на API (для ngrok)
const downloadViaDirectLink = async (
  apiEndpoint: string,
  filename: string,
  debug: boolean = false
): Promise<void> => {
  try {
    if (debug) console.log('Opening direct API link:', apiEndpoint);
    
    // Получаем токен авторизации
    const adminId = localStorage.getItem("admin_telegram_id");
    const adminToken = localStorage.getItem("admin_token");
    
    // Создаем URL с параметрами авторизации
    const url = new URL(apiEndpoint, window.location.origin);
    if (adminId) {
      url.searchParams.set('admin_id', adminId);
    }
    
    // Создаем временную ссылку
    const a = document.createElement('a');
    a.href = url.toString();
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    
    // Добавляем заголовки через fetch и создаем blob URL как fallback
    try {
      const response = await fetch(url.toString(), {
        headers: adminId ? { 'X-Telegram-User-Id': adminId } : {}
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        
        if (debug) console.log('Downloaded via fetch + blob URL');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (fetchError) {
      // Fallback к прямой ссылке
      if (debug) console.log('Fetch failed, using direct link:', fetchError);
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (debug) console.log('Opened direct link');
    }
    
  } catch (error) {
    console.error('Error in downloadViaDirectLink:', error);
    throw error;
  }
};

// Функция для создания имени файла с датой
export const generateFilename = (prefix: string, extension: string = 'xlsx'): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
};