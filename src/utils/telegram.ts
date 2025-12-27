// Telegram Mini App utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        platform: string;
        version: string;
        onEvent?: (eventType: string, callback: () => void) => void;
        offEvent?: (eventType: string, callback: () => void) => void;
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
        openInvoice?: (url: string, callback?: (status: string) => void) => void;
      };
    };
  }
}

export class TelegramWebApp {
  private static instance: TelegramWebApp;
  private webApp: typeof window.Telegram.WebApp;

  private constructor() {
    this.webApp = window.Telegram?.WebApp;
  }

  public static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  public init(): void {
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();
      this.webApp.MainButton.hide();
      this.webApp.BackButton.hide();
      
      // Дополнительные настройки для iPhone
      if (this.isIOS()) {
        // Принудительно устанавливаем viewport
        setTimeout(() => {
          this.webApp.expand();
          this.fixIOSViewport();
        }, 100);
      }
    }
  }

  private fixIOSViewport(): void {
    // Исправляем проблемы с viewport на iOS
    const height = this.getViewportStableHeight();
    document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
    
    // Принудительно устанавливаем высоту body
    document.body.style.height = `${height}px`;
    document.body.style.maxHeight = `${height}px`;
    
    // Исправляем root контейнер
    const root = document.getElementById('root');
    if (root) {
      root.style.height = `${height}px`;
      root.style.maxHeight = `${height}px`;
    }
  }

  public getUserData() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  public getUserId(): number {
    return this.getUserData()?.id || 1; // Fallback для разработки
  }

  public getTheme() {
    return {
      colorScheme: this.webApp?.colorScheme || 'dark',
      themeParams: this.webApp?.themeParams || {}
    };
  }

  public showMainButton(text: string, callback: () => void): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.onClick(callback);
      this.webApp.MainButton.show();
    }
  }

  public hideMainButton(): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.hide();
    }
  }

  public showBackButton(callback: () => void): void {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.onClick(callback);
      this.webApp.BackButton.show();
    }
  }

  public hideBackButton(): void {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.hide();
    }
  }

  public close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  public isInTelegram(): boolean {
    return !!this.webApp;
  }

  public getViewportHeight(): number {
    // Для iPhone используем стабильную высоту если доступна
    if (this.webApp?.viewportStableHeight && this.isIOS()) {
      return this.webApp.viewportStableHeight;
    }
    return this.webApp?.viewportHeight || window.innerHeight;
  }

  public getViewportStableHeight(): number {
    return this.webApp?.viewportStableHeight || this.webApp?.viewportHeight || window.innerHeight;
  }

  public isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  public isExpanded(): boolean {
    return this.webApp?.isExpanded || false;
  }

  public expand(): void {
    if (this.webApp) {
      this.webApp.expand();
    }
  }

  public enableClosingConfirmation(): void {
    if (this.webApp && this.webApp.enableClosingConfirmation) {
      this.webApp.enableClosingConfirmation();
    }
  }

  public disableClosingConfirmation(): void {
    if (this.webApp && this.webApp.disableClosingConfirmation) {
      this.webApp.disableClosingConfirmation();
    }
  }

  public onEvent(eventType: string, callback: () => void): void {
    if (this.webApp && this.webApp.onEvent) {
      this.webApp.onEvent(eventType, callback);
    }
  }

  public offEvent(eventType: string, callback: () => void): void {
    if (this.webApp && this.webApp.offEvent) {
      this.webApp.offEvent(eventType, callback);
    }
  }

  public openLink(url: string): void {
    // Используем Telegram WebApp.openLink для открытия внешних ссылок
    // Это работает лучше, чем window.open, особенно в десктопном Telegram
    // openLink открывает ссылку внутри mini-app на всех платформах
    if (this.webApp && (this.webApp as any).openLink) {
      try {
        (this.webApp as any).openLink(url);
        return;
      } catch (error) {
        console.warn('Failed to use Telegram openLink:', error);
      }
    }
    
    // Fallback для случаев когда Telegram WebApp недоступен
    // Для всех платформ используем window.open с _blank, чтобы открыть внутри mini-app
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Если открытие заблокировано, используем редирект
        window.location.href = url;
      }
    } catch (error) {
      console.warn('Failed to open link:', error);
      // Последний fallback - прямой редирект
      window.location.href = url;
    }
  }

  public openInvoice(url: string, callback?: (status: string) => void): void {
    // Используем Telegram WebApp.openInvoice для открытия платежных форм
    // Это специальный метод для открытия инвойсов в Telegram
    if (this.webApp && (this.webApp as any).openInvoice) {
      try {
        (this.webApp as any).openInvoice(url, callback);
        return;
      } catch (error) {
        console.warn('Failed to use Telegram openInvoice:', error);
      }
    }
    
    // Fallback на openLink если openInvoice недоступен
    console.warn('openInvoice not available, falling back to openLink');
    this.openLink(url);
  }

  public isDesktop(): boolean {
    // Определяет, является ли устройство десктопным (не Android и не iOS)
    if (typeof window === 'undefined' || !window.Telegram?.WebApp?.platform) {
      // Если Telegram WebApp недоступен, определяем по user agent
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      return !isMobile;
    }
    
    const platform = window.Telegram.WebApp.platform.toLowerCase();
    return platform !== 'android' && platform !== 'ios';
  }
}

export const telegramWebApp = TelegramWebApp.getInstance();