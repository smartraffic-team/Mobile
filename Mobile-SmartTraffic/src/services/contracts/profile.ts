export type ProfileUser = {
  id: string;
  name: string;
  role: string;
  roleLabel: string;
  employeeId: string;
  email: string;
  phone: string;
  maskedTaxId: string;
  shift: string;
  sector: string;
  municipality: string;
  region: string;
  avatarUri?: string;
  lastAccessAt: string;
};

export type ProfileActivity = {
  openTickets: number;
  camerasMonitoredToday: number;
  periodLabel: string;
};

export type ProfilePreferences = {
  offlineCameraAlerts: boolean;
  ticketUpdates: boolean;
  theme: 'dark';
  language: 'pt-BR';
};

export type ProfileSnapshot = {
  user: ProfileUser;
  activity: ProfileActivity;
  preferences: ProfilePreferences;
};

export type UpdateProfilePreferences = Partial<ProfilePreferences>;

export interface ProfileDataSource {
  getProfile(): Promise<ProfileSnapshot>;
  updatePreferences(preferences: UpdateProfilePreferences): Promise<ProfileSnapshot>;
}
