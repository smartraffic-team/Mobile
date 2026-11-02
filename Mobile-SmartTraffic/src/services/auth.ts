import { demoLoginAccounts } from '@/mocks/auth';
import type { AuthDataSource } from '@/services/contracts/auth';

const waitForDemoResponse = () => new Promise((resolve) => setTimeout(resolve, 350));

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const demoAuthDataSource: AuthDataSource = {
  async authenticate(credentials) {
    await waitForDemoResponse();
    const account = demoLoginAccounts.find(
      (candidate) => normalizeName(candidate.name) === normalizeName(credentials.name),
    );

    if (
      !account
      || credentials.password !== account.password
      || credentials.registrationNumber !== account.registrationNumber
    ) {
      throw new Error('Nome, senha ou matrícula inválidos.');
    }

    return { userName: account.userName };
  },
};

export const authDataSource: AuthDataSource = demoAuthDataSource;
