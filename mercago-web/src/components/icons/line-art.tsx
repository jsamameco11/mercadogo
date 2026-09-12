type IconProps = { className?: string };

export function IconSearch({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconHeart({ className = "h-5 w-5", filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.5s-7.5-4.7-10-9.3C.5 8 2 4.5 5.5 3.7 8 3.1 10.3 4.4 12 6.6 13.7 4.4 16 3.1 18.5 3.7 22 4.5 23.5 8 22 11.2 19.5 15.8 12 20.5 12 20.5Z" />
    </svg>
  );
}

export function IconChat({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}

export function IconPlus({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconUser({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconLocation({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function IconCamera({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  );
}

export function IconClose({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconChevronRight({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconChevronLeft({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function IconMenu({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconShare({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <circle cx="18" cy="5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="19" r="2.2" />
      <path d="M8 10.8l8-4.4M8 13.2l8 4.4" />
    </svg>
  );
}

export function IconFlag({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M6 3v18" />
      <path d="M6 4h12l-3 4 3 4H6" />
    </svg>
  );
}

export function IconCheck({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M5 13l4 4 10-10" />
    </svg>
  );
}

export function IconTag({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M11 4h6a1 1 0 0 1 1 1v6l-9 9-7-7 9-9Z" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconStore({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`line-art ${className}`}>
      <path d="M4 9l1.5-4h13L20 9" />
      <path d="M4 9v10h16V9" />
      <path d="M9 19v-5h6v5" />
      <path d="M4 9a2.5 2.5 0 0 0 5 0M9 9a2.5 2.5 0 0 0 5 0M14 9a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
