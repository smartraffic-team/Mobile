import type { LoginCredentials } from '@/services/contracts/auth';

type DemoLoginAccount = LoginCredentials & { userName: string };

export const demoLoginAccounts: DemoLoginAccount[] = [
  'João',
  'Cristhian',
  'Paulo',
  'Marcelo',
  'Delluca',
].map((userName) => ({
  userName,
  name: userName,
  password: '1234',
  registrationNumber: '2026-0001',
}));
