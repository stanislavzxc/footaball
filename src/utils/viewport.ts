// Утилиты для работы с viewport на разных устройствах, особенно iPhone

export class ViewportManager {
  private static instance: ViewportManager;
  private currentHeight: number = 0;
  private callbacks: Array<(height: number) => void> = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): ViewportManager {
    if (!ViewportManager.instance) {
      ViewportManager.instance = new ViewportManager();
    }
    return ViewportManager.instance;
  }

  private init(): void {
    this.updateViewportHeight();
    this.setupEventListeners();
  }

  private updateViewportHeight(): void {
    // Получаем реальную высоту viewport
    let height = window.innerHeight;

    // Для iPhone используем специальную логику
    if (this.isIOS()) {
      // Используем Telegram WebApp API если доступен
      if (window.Telegram?.WebApp) {
        const tgHeight = window.Telegram.WebApp.viewportStableHeight || 
                        window.Telegram.WebApp.viewportHeight;
        if (tgHeight) {
          height = tgHeight;
        }
      } else {
        // Fallback для iPhone без Telegram
        height = window.screen.height;
        
        // Учитываем safe area
        const safeAreaTop = this.getSafeAreaInset('top');
        const safeAreaBottom = this.getSafeAreaInset('bottom');
        height = height - safeAreaTop - safeAreaBottom;
      }
    }

    if (height !== this.currentHeight) {
      this.currentHeight = height;
      this.setViewportHeight(height);
      this.notifyCallbacks(height);
    }
  }

  private setViewportHeight(height: number): void {
    // Устанавливаем CSS переменные
    document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    
    // Устанавливаем высоту для основных элементов
    document.body.style.height = `${height}px`;
    document.body.style.maxHeight = `${height}px`;
    document.body.style.minHeight = `${height}px`;
    
    const root = document.getElementById('root');
    if (root) {
      root.style.height = `${height}px`;
      root.style.maxHeight = `${height}px`;
      root.style.minHeight = `${height}px`;
    }
  }

  private setupEventListeners(): void {
    // Слушаем изменения размера окна
    window.addEventListener('resize', () => {
      setTimeout(() => this.updateViewportHeight(), 100);
    });

    // Слушаем изменения ориентации
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateViewportHeight(), 300);
    });

    // Слушаем изменения видимости (для обработки клавиатуры на iPhone)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => this.updateViewportHeight(), 100);
      }
    });

    // Для iPhone дополнительно слушаем события фокуса/блюра
    if (this.isIOS()) {
      window.addEventListener('focusin', () => {
        setTimeout(() => this.updateViewportHeight(), 300);
      });

      window.addEventListener('focusout', () => {
        setTimeout(() => this.updateViewportHeight(), 300);
      });
    }

    // Слушаем события Telegram WebApp
    if (window.Telegram?.WebApp?.onEvent) {
      window.Telegram.WebApp.onEvent('viewportChanged', () => {
        setTimeout(() => this.updateViewportHeight(), 100);
      });
    }
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private getSafeAreaInset(side: 'top' | 'bottom' | 'left' | 'right'): number {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style[side] = '0';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.padding = `env(safe-area-inset-${side}) 0 0 0`;
    document.body.appendChild(element);
    
    const inset = parseInt(getComputedStyle(element).paddingTop) || 0;
    document.body.removeChild(element);
    
    return inset;
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }

  public onHeightChange(callback: (height: number) => void): void {
    this.callbacks.push(callback);
  }

  public offHeightChange(callback: (height: number) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  private notifyCallbacks(height: number): void {
    this.callbacks.forEach(callback => callback(height));
  }

  public forceUpdate(): void {
    this.updateViewportHeight();
  }
}

// Экспортируем singleton instance
export const viewportManager = ViewportManager.getInstance();