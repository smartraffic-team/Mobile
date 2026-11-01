export type LoginCredentials = {
  name: string;
  password: string;
  registrationNumber: string;
};

export type LoginFieldName = keyof LoginCredentials;

export type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;
