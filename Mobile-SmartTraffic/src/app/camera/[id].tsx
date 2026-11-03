import { Stack } from 'expo-router';

import { CameraLiveScreen } from '@/components/map/camera-live-screen';
import { AppColors, Radius } from '@/constants/theme';

export default function CameraRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.75, 1],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetCornerRadius: Radius.xl,
          contentStyle: { backgroundColor: AppColors.background },
        }}
      />
      <CameraLiveScreen />
    </>
  );
}
