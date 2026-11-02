import type { Ticket, TicketSummary } from '@/services/contracts/tickets';

export const demoTicketSummary: TicketSummary = {
  open: 5,
  inProgress: 3,
  done: 12,
};

export const demoTickets: Ticket[] = [
  {
    id: '2041',
    cameraId: 'CAM-0034',
    cameraAddress: 'Rua Dom Pedro II',
    neighborhood: 'Centro',
    cameraStatus: 'offline',
    cameraModel: 'Intelbras VIP 3230',
    issueType: 'Câmera offline',
    priority: 'critical',
    status: 'inProgress',
    description:
      'A câmera deixou de enviar imagens após oscilação de energia. Não responde ao teste de rede. Verificar alimentação e conexão no poste.',
    openedAt: '26 out 2026 · 13:48',
    openedBy: 'Mariana Costa',
    assignee: 'Rafael Oliveira',
    history: [
      {
        id: 'history-2041-1',
        title: 'Aberto',
        detail: '26 out · 13:48',
        occurredAt: '26 out · 13:48',
        actor: 'Mariana Costa',
        status: 'complete',
      },
      {
        id: 'history-2041-2',
        title: 'Em análise · Atual',
        detail: '26 out · 14:05',
        occurredAt: '26 out · 14:05',
        actor: 'Rafael Oliveira',
        status: 'current',
      },
      {
        id: 'history-2041-3',
        title: 'Técnico a caminho',
        detail: 'Aguardando deslocamento',
        occurredAt: '',
        status: 'pending',
      },
      {
        id: 'history-2041-4',
        title: 'Resolvido',
        detail: 'Aguardando conclusão',
        occurredAt: '',
        status: 'pending',
      },
    ],
    comments: [
      {
        id: 'comment-2041-1',
        author: 'Rafael Oliveira',
        message: 'Testes remotos sem resposta. Vou verificar o ponto de energia antes do deslocamento.',
        time: '14:05',
      },
    ],
  },
  {
    id: '2038',
    cameraId: 'CAM-0006',
    cameraAddress: 'Rua Seiji Sumida',
    neighborhood: 'Centro',
    cameraStatus: 'online',
    issueType: 'Falha serial do microcontrolador',
    priority: 'high',
    status: 'open',
    description: 'O microcontrolador perdeu comunicação serial com o semáforo durante a operação.',
    openedAt: '26 out 2026 · 11:20',
    openedBy: 'Mariana Costa',
    assignee: null,
    history: [
      {
        id: 'history-2038-1',
        title: 'Aberto',
        detail: '26 out · 11:20',
        occurredAt: '26 out · 11:20',
        actor: 'Mariana Costa',
        status: 'current',
      },
      {
        id: 'history-2038-2',
        title: 'Em análise',
        detail: 'Aguardando atribuição',
        occurredAt: '',
        status: 'pending',
      },
      {
        id: 'history-2038-3',
        title: 'Técnico a caminho',
        detail: 'Aguardando análise',
        occurredAt: '',
        status: 'pending',
      },
      {
        id: 'history-2038-4',
        title: 'Resolvido',
        detail: 'Aguardando conclusão',
        occurredAt: '',
        status: 'pending',
      },
    ],
    comments: [],
  },
];

export const ticketIssueTypes = [
  'Câmera offline',
  'Lente embaçada ou obstruída',
  'Baixa iluminação noturna',
  'Falha serial do microcontrolador',
  'Falha de energia ou relé',
  'Desalinhamento da câmera',
  'Outro',
] as const;
