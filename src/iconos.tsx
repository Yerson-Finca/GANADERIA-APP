import React from 'react'

interface IconoProps {
  nombre: string
  tamaño?: number
  className?: string
}

const Icono: React.FC<IconoProps> = ({ nombre, tamaño = 20, className = '' }) => {
  const props: React.SVGProps<SVGSVGElement> = {
    width: tamaño,
    height: tamaño,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className
  }

  const paths: Record<string, React.ReactNode> = {
    // Navegación
    'chart-bar': <><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></>,
    'list': <><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>,
    'cube': <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></>,
    'settings': <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>,

    // Acciones
    'plus': <path d="M12 5v14M5 12h14" />,
    'trash': <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>,
    'pencil': <><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></>,
    'check': <path d="M20 6 9 17l-5-5" />,
    'x': <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    'arrow-left': <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
    'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,

    // Finanzas
    'dollar': <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    'scale': <><path d="M3 3v18h18" /><path d="M7 16V8l-4 4" /><path d="M17 16V8l4 4" /></>,
    'trending-up': <><path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></>,
    'trending-down': <><path d="M23 18l-9.5-9.5-5 5L1 6" /><path d="M17 18h6v-6" /></>,

    // Estados
    'crown': <path d="M2 4l3 12h14l3-12-6 5-4-7-4 7-6-5z" />,
    'star': <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    'sparkles': <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0Z" /><path d="M20 3v4M22 5h-4M4 17v2M5 18H3" /></>,
    'alert': <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><circle cx="12" cy="17" r="1" fill="currentColor" /></>,

    // Alimentos
    'leaf': <><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>,
    'wheat': <><path d="M2 22 12 12" /><path d="M22 22 12 12" /><path d="M12 12V2" /><path d="M8 8 6 6" /><path d="M16 8l2-2" /></>,
    'droplet': <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0Z" />,
    'flask': <><path d="M10 2v7.31a2 2 0 0 1-.37 1.19L4.59 18.27A2 2 0 0 0 6.31 21h11.38a2 2 0 0 0 1.72-2.73L14.37 10.5A2 2 0 0 1 14 9.31V2" /><path d="M10 2h4" /></>,
    'cube-solid': <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
    'diamond': <path d="M2.45 13.48a2 2 0 0 0 0 3.04l5.03 5.03a2 2 0 0 0 3.04 0l5.03-5.03a2 2 0 0 0 0-3.04l-5.03-5.03a2 2 0 0 0-3.04 0Z" />,

    // Social / Perfil
    'cake': <><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 13h16" /><path d="M12 3v4" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    'baby': <><path d="M9 12h.01" /><path d="M15 12h.01" /><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" /><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.5 2.5-2 2.5c-.6 0-2 0-3.5.4" /></>,
    'milk': <><path d="M8 2h8" /><path d="M9 2v2.79a4 4 0 0 1-.85 2.54L4.79 12.5A4 4 0 0 0 4 15v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a4 4 0 0 0-.79-2.5l-3.36-5.17A4 4 0 0 1 15 4.79V2" /></>,
    'calendar': <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
    'clock': <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    'syringe': <><path d="m18 2 4 4" /><path d="m17 7 3-3" /><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" /><path d="m9 11 4 4" /><path d="m5 19-3 3" /><path d="m14 4 6 6" /></>,
    'camera': <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></>,
    'export': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>,
    'import': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>,
    'search': <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    'bell': <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
    'shield': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    'cow': <><circle cx="12" cy="10" r="5" /><path d="M6 7c-3 0-5 2-6 4" /><path d="M18 7c3 0 5 2 6 4" /><path d="M8 12c0 2 2 4 4 4s4-2 4-4" /></>,
  }

  return <svg {...props}>{paths[nombre] || paths['star']}</svg>
}

export default Icono
