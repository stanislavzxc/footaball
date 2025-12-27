import React, { useState, useRef, useEffect, useMemo } from "react";

type SelectorOption = {
  value: string;
  label: React.ReactNode;
};

interface SelectorProps {
  name: string;
  value: string;
  options: SelectorOption[];
  placeholder?: string;
  /**
   * Простое уведомление о смене значения.
   * Используем (name, value), чтобы легко интегрироваться с существующей логикой форм.
   */
  onChange: (name: string, value: string) => void;
  style?: React.CSSProperties;
}

/**
 * Определяет, является ли устройство мобильным на основе платформы Telegram
 */
const isMobilePlatform = (): boolean => {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.platform) {
    // Если Telegram WebApp недоступен, определяем по user agent
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  const platform = window.Telegram.WebApp.platform.toLowerCase();
  return platform === 'android' || platform === 'ios';
};

export const Selector: React.FC<SelectorProps> = ({
  name,
  value,
  options,
  placeholder = "Выберите значение",
  onChange,
  style = {},
}) => {
  const isMobile = useMemo(() => isMobilePlatform(), []);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((opt) => opt.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange(name, optionValue);
    setOpen(false);
    // после выбора убираем фокус, чтобы закрыть меню и убрать outline
    if (triggerRef.current) {
      (triggerRef.current as HTMLElement).blur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const updateMenuPosition = () => {
      if (open && triggerRef.current && menuRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuHeight = 220; // maxHeight
        
        // Вычисляем позицию слева с учетом границ экрана
        let left = Math.max(10, rect.left);
        const maxWidth = Math.min(rect.width, viewportWidth - 20, 320);
        
        // Если меню выходит за правую границу, сдвигаем влево
        if (left + maxWidth > viewportWidth - 10) {
          left = Math.max(10, viewportWidth - maxWidth - 10);
        }
        
        // Вычисляем позицию сверху
        let top = rect.bottom + 6;
        
        // Если меню не помещается снизу, показываем сверху
        if (top + menuHeight > viewportHeight - 10) {
          top = Math.max(10, rect.top - menuHeight - 6);
        }
        
        menuRef.current.style.top = `${top}px`;
        menuRef.current.style.left = `${left}px`;
        menuRef.current.style.width = `${maxWidth}px`;
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updateMenuPosition, true);
      window.addEventListener("resize", updateMenuPosition);
      // Обновляем позицию сразу
      updateMenuPosition();
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [open]);

  // На мобильных устройствах используем стандартный select
  if (isMobile) {
    return (
      <select
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="custom-selector-mobile"
        style={{
          width: "100%",
          padding: "12px",
          paddingRight: "40px",
          border: "2px solid rgba(255,255,255,0.3)",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.1)",
          color: "white",
          fontSize: "1rem",
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          ...style,
        }}
      >
        {!value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          // Преобразуем React.ReactNode в строку для option
          // Если label это строка, используем её, иначе преобразуем в строку
          const labelText = typeof opt.label === 'string' 
            ? opt.label 
            : String(opt.label || opt.value);
          
          return (
            <option key={opt.value} value={opt.value}>
              {labelText}
            </option>
          );
        })}
      </select>
    );
  }

  // На десктопе используем кастомный компонент
  return (
    <div
      className="custom-selector"
      style={{ position: "relative", width: "100%" }}
    >
      <div
        ref={triggerRef}
        tabIndex={0}
        className="custom-selector-trigger"
        style={{
          width: "100%",
          padding: "12px",
          border: "2px solid rgba(255,255,255,0.3)",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.1)",
          color: "white",
          fontSize: "1rem",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          ...style,
        }}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ marginLeft: "8px", opacity: 0.8 }}>▾</span>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="custom-selector-menu"
          style={{
            position: "fixed",
            top: triggerRef.current ? `${triggerRef.current.getBoundingClientRect().bottom + 6}px` : "auto",
            left: triggerRef.current ? `${Math.max(10, triggerRef.current.getBoundingClientRect().left)}px` : "10px",
            width: triggerRef.current ? `${Math.min(triggerRef.current.getBoundingClientRect().width, window.innerWidth - 20)}px` : "calc(100% - 20px)",
            maxWidth: "320px",
            background: "rgba(15,23,42,0.98)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 2147483647,
            maxHeight: "220px",
            overflowY: "auto",
            overflowX: "hidden",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="custom-selector-option"
              data-selected={opt.value === value}
              onClick={() => handleOptionClick(opt.value)}
              style={{
                width: "calc(100% - 8px)",
                textAlign: "left",
                padding: "10px 12px",
                background:
                  opt.value === value
                    ? "rgba(59,130,246,0.25)"
                    : "transparent",
                border: "none",
                color: "white",
                fontSize: "0.95rem",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                display: "block",
                transition: "all 0.2s ease",
                borderRadius: "6px",
                margin: "2px 4px",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


