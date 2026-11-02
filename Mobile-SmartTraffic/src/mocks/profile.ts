import type { ProfileSnapshot } from '@/services/contracts/profile';

export const demoProfile: ProfileSnapshot = {
  user: {
    id: 'user-2024-0817',
    name: 'Mariana Costa',
    role: 'Operadora de tráfego',
    roleLabel: 'Operador',
    employeeId: '2024-0817',
    email: 'mariana.costa@registro.sp.gov.br',
    phone: '(13) 99642-0817',
    maskedTaxId: '***.***.***-12',
    shift: '06h–14h',
    sector: 'Centro',
    municipality: 'Registro',
    region: 'Vale do Ribeira',
    lastAccessAt: 'hoje, 06:02 · 26 out 2026',
  },
  activity: {
    openTickets: 3,
    camerasMonitoredToday: 18,
    periodLabel: 'Hoje',
  },
  preferences: {
    offlineCameraAlerts: true,
    ticketUpdates: true,
    theme: 'dark',
    language: 'pt-BR',
  },
};
