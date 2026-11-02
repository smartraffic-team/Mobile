export type LoginCredentials = {
  name: string;
  password: string;
  registrationNumber: string;
};

export type LoginFieldName = keyof LoginCredentials;

export type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;

export type LoginResult = {
  userName: string;
};

export interface AuthDataSource {
  authenticate(credentials: LoginCredentials): Promise<LoginResult>;
}
