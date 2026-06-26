// import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
// import { useColorScheme } from 'react-native';

// import { AnimatedSplashOverlay } from '@/components/animated-icon';
// import AppTabs from '@/components/app-tabs';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   return (
//     <Slot />
//     // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//     //   <AnimatedSplashOverlay />
//     //   <AppTabs />
//     // </ThemeProvider>
//   );
// }
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from "react-native-root-siblings"
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootSiblingParent>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Slot />
        </GestureHandlerRootView>

      </RootSiblingParent>

    </ClerkProvider>
  )
}
