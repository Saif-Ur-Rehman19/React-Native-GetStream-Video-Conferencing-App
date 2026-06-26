import { useAuth } from '@clerk/expo'
import { Redirect, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AuthRoutesLayout() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return null
    }

    if (isSignedIn) {
        return <Redirect href={'/'} />
    }


    return (
        <SafeAreaView style={{flex: 1}}>
            <Stack>
                <Stack.Screen name='sign-in' options={{
                    title: "Sign In to get started",
                    headerShown: false
                }} />
                <Stack.Screen name='sign-up' options={{
                    title: "Create a new account",
                    headerBackTitle: "Sign In",
                    headerShown: false
                }} />
            </Stack>
        </SafeAreaView>
    )

}