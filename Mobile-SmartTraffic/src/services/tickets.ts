import { demoTicketSummary, demoTickets } from '@/mocks/tickets';
import type {
  CreateTicketPayload,
  Ticket,
  TicketComment,
  TicketFilters,
  TicketHistoryEntry,
  TicketStatus,
  TicketSummary,
} from '@/services/contracts/tickets';

export interface TicketDataSource {
  getTickets(filters?: TicketFilters): Promise<Ticket[]>;
  getTicketSummary(): Promise<TicketSummary>;
  getTicket(id: string): Promise<Ticket | null>;
  createTicket(payload: CreateTicketPayload): Promise<Ticket>;
  addComment(id: string, message: string): Promise<Ticket>;
  updateStatus(id: string, status: TicketStatus): Promise<Ticket>;
}

const waitForDemoResponse = () => new Promise((resolve) => setTimeout(resolve, 260));

type DemoTicketStore = {
  tickets: Ticket[];
  summary: TicketSummary;
  nextId: number;
};

const globalStore = globalThis as typeof globalThis & {
  __smartTrafficTicketStore?: DemoTicketStore;
};

// Expo Router may load screens in separate bundles; keep their demo mutations shared.
if (!globalStore.__smartTrafficTicketStore) {
  globalStore.__smartTrafficTicketStore = {
    tickets: demoTickets.map((ticket) => ({
      ...ticket,
      history: [...ticket.history],
      comments: [...ticket.comments],
    })),
    summary: { ...demoTicketSummary },
    nextId: 2042,
  };
}

const ticketStore = globalStore.__smartTrafficTicketStore;

function findTicket(id: string) {
  const ticket = ticketStore.tickets.find((item) => item.id === id);
  if (!ticket) throw new Error('Este chamado não está mais disponível.');
  return ticket;
}

function cloneTicket(ticket: Ticket): Ticket {
  return { ...ticket, history: [...ticket.history], comments: [...ticket.comments] };
}

function currentTime() {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

const demoTicketDataSource: TicketDataSource = {
  async getTickets(filters) {
    await waitForDemoResponse();
    return ticketStore.tickets
      .filter((ticket) => ticket.status !== 'cancelled')
      .filter((ticket) => !filters?.status || ticket.status === filters.status)
      .filter((ticket) => !filters?.priority || ticket.priority === filters.priority)
      .map(cloneTicket);
  },

  async getTicketSummary() {
    await waitForDemoResponse();
    return { ...ticketStore.summary };
  },

  async getTicket(id) {
    await waitForDemoResponse();
    const ticket = ticketStore.tickets.find((item) => item.id === id);
    return ticket ? cloneTicket(ticket) : null;
  },

  async createTicket(payload) {
    await waitForDemoResponse();
    const id = String(ticketStore.nextId++);
    const ticket: Ticket = {
      ...payload,
      id,
      status: 'open',
      openedAt: 'Agora',
      openedBy: 'Mariana Costa',
      assignee: null,
      history: [
        {
          id: `history-${id}-1`,
          title: 'Aberto',
          detail: 'Agora',
          occurredAt: 'Agora',
          actor: 'Mariana Costa',
          status: 'current',
        },
        {
          id: `history-${id}-2`,
          title: 'Em análise',
          detail: 'Aguardando atribuição',
          occurredAt: '',
          status: 'pending',
        },
        {
          id: `history-${id}-3`,
          title: 'Técnico a caminho',
          detail: 'Aguardando análise',
          occurredAt: '',
          status: 'pending',
        },
        {
          id: `history-${id}-4`,
          title: 'Resolvido',
          detail: 'Aguardando conclusão',
          occurredAt: '',
          status: 'pending',
        },
      ],
      comments: [],
    };
    ticketStore.tickets = [ticket, ...ticketStore.tickets];
    ticketStore.summary.open += 1;
    return cloneTicket(ticket);
  },

  async addComment(id, message) {
    await waitForDemoResponse();
    const ticket = findTicket(id);
    const comment: TicketComment = {
      id: `comment-${id}-${Date.now()}`,
      author: 'Mariana Costa',
      message,
      time: currentTime(),
    };
    ticket.comments = [...ticket.comments, comment];
    return cloneTicket(ticket);
  },

  async updateStatus(id, status) {
    await waitForDemoResponse();
    const ticket = findTicket(id);
    if (ticket.status === status) return cloneTicket(ticket);

    if (ticket.status === 'open') ticketStore.summary.open = Math.max(0, ticketStore.summary.open - 1);
    if (ticket.status === 'inProgress') ticketStore.summary.inProgress = Math.max(0, ticketStore.summary.inProgress - 1);
    if (ticket.status === 'done') ticketStore.summary.done = Math.max(0, ticketStore.summary.done - 1);
    if (status === 'open') ticketStore.summary.open += 1;
    if (status === 'inProgress') ticketStore.summary.inProgress += 1;
    if (status === 'done') ticketStore.summary.done += 1;

    ticket.status = status;
    const title = status === 'done' ? 'Resolvido' : 'Chamado cancelado';
    const time = currentTime();
    const entry: TicketHistoryEntry = {
      id: `history-${id}-${Date.now()}`,
      title,
      detail: time,
      occurredAt: time,
      actor: 'Mariana Costa',
      status: 'complete',
    };
    ticket.history = ticket.history.map((item) => {
      if (item.status === 'current') {
        return { ...item, title: item.title.replace(' · Atual', ''), status: 'complete' };
      }
      if (status === 'done' && item.status === 'pending' && item.title !== 'Resolvido') {
        return { ...item, detail: 'Etapa não registrada', status: 'skipped' };
      }
      if (status === 'done' && item.title === 'Resolvido') {
        return { ...item, detail: time, occurredAt: time, actor: 'Mariana Costa', status: 'complete' };
      }
      return item;
    });
    if (status === 'cancelled') ticket.history.push(entry);
    return cloneTicket(ticket);
  },
};

export const ticketDataSource: TicketDataSource = demoTicketDataSource;
