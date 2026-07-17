import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconDumbbell = () => (
  <Icon>
    <path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10M2 12h2M20 12h2" />
  </Icon>
);

export const IconTarget = () => (
  <Icon>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </Icon>
);

export const IconTrend = () => (
  <Icon>
    <path d="M3 20h18" />
    <path d="M4 15l5-5 4 3 6-7" />
    <path d="M19 6h.01M15 6h4v4" />
  </Icon>
);

export const IconList = () => (
  <Icon>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="2.6" />
  </Icon>
);

export const IconChat = () => (
  <Icon>
    <path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.6A8 8 0 1 1 21 12Z" />
  </Icon>
);

export const IconGear = () => (
  <Icon>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9" />
  </Icon>
);

export const IconInfo = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5h.01" strokeWidth="2.2" />
  </Icon>
);

export const IconFlame = () => (
  <Icon>
    <path d="M12 3c1 3-2.5 4.5-2.5 8a4.5 4.5 0 0 0 9 0c0-2-1-3.5-2-4.5.2 2-.8 3-1.7 3.2C15.5 8 15 5 12 3Z" />
    <path d="M9.5 14.5A6.5 6.5 0 1 0 18.5 14" />
  </Icon>
);
