import { demoProfile } from '@/mocks/profile';
import type {
  ProfileDataSource,
  ProfileSnapshot,
  UpdateProfilePreferences,
} from '@/services/contracts/profile';

type ProfileStore = { snapshot: ProfileSnapshot };
const globalStore = globalThis as typeof globalThis & {
  __smartTrafficProfileStore?: ProfileStore;
};

// Keep demonstrative preference changes consistent across Expo Router bundles.
if (!globalStore.__smartTrafficProfileStore) {
  globalStore.__smartTrafficProfileStore = {
    snapshot: {
      ...demoProfile,
      user: { ...demoProfile.user },
      activity: { ...demoProfile.activity },
      preferences: { ...demoProfile.preferences },
    },
  };
}

const profileStore = globalStore.__smartTrafficProfileStore;
const waitForDemoResponse = () => new Promise((resolve) => setTimeout(resolve, 220));

function cloneSnapshot(): ProfileSnapshot {
  return {
    ...profileStore.snapshot,
    user: { ...profileStore.snapshot.user },
    activity: { ...profileStore.snapshot.activity },
    preferences: { ...profileStore.snapshot.preferences },
  };
}

const demoProfileDataSource: ProfileDataSource = {
  async getProfile() {
    await waitForDemoResponse();
    return cloneSnapshot();
  },

  async updatePreferences(preferences: UpdateProfilePreferences) {
    await waitForDemoResponse();
    profileStore.snapshot.preferences = {
      ...profileStore.snapshot.preferences,
      ...preferences,
    };
    return cloneSnapshot();
  },
};

export const profileDataSource: ProfileDataSource = demoProfileDataSource;
