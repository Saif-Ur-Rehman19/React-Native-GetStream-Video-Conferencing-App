import { useAuth, useUser } from '@clerk/expo'
import { Redirect, Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import {
    LogLevel,
    StreamCall,
    StreamVideo,
    StreamVideoClient,
    User,
} from "@stream-io/video-react-native-sdk";

const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
if (!apiKey) {
    throw new Error("Missing API key")
}
export default function CallLayout() {
    const { isSignedIn, isLoaded } = useAuth()
    const { user: clerkUser } = useUser();

    if (!isLoaded) {
        return null
    }

    if (!isSignedIn || !clerkUser || !apiKey) {
        return <Redirect href="/(auth)/sign-in" />
    }

    const user: User = {
        id: clerkUser.id,
        name: clerkUser.fullName!,
        image: clerkUser.imageUrl
    }

    const tokenProvider = async () => {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/generateUserToken`, {
            method: "POST",
            headers: {
                "ContentType": "application/json"
            },
            body: JSON.stringify({
                userId: clerkUser.id,
                name: clerkUser.fullName,
                image: clerkUser.imageUrl,
                email: clerkUser.primaryEmailAddress?.toString()
            })
        });
        const data = await response.json();
        return data.token;
    }

    const client = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user,
        tokenProvider,
        options: {
            logger: (logLevel: LogLevel, message: string, ...args: unknown[]) => { }
        }
    })

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StreamVideo client={client}>
                <Tabs screenOptions={{
                    header: () => null,
                    tabBarActiveTintColor: "#5F5DEC",
                    tabBarLabelStyle: {
                        zIndex: 100,
                        paddingBottom: 5
                    }
                }}>
                    <Tabs.Screen name='index' options={{
                        title: "All Calls",
                        tabBarIcon: ({ color }) => (
                            <Ionicons name={'call-outline'} size={24} color={color} />
                        )
                    }} />
                    <Tabs.Screen name='[id]' options={{
                        title: "Start a new Call",
                        popToTopOnBlur: true,
                        header: () => null,
                        tabBarStyle: { display: 'none' },
                        tabBarIcon: () => (
                            <View style={{
                                width: 90,
                                height: 56,
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'white',
                                borderColor: 'lightgray',
                                borderWidth: 1,
                                marginTop: -20,
                                borderRightWidth: 0,
                                borderLeftWidth: 0
                            }}>
                                <FontAwesome name="plus-circle" color="black" size={30} />
                            </View>
                        )
                    }} />
                    <Tabs.Screen name='join' options={{
                        title: "Join Call",
                        headerTitle: "Enter the room ID",
                        tabBarIcon: ({ color }) => (
                            <Ionicons name={'enter-outline'} size={24} color={color} />
                        )
                    }} />
                </Tabs>
                {/* <Tabs screenOptions={{
            header: () => null
        }}>
            <Tabs.Screen
                name="index"
            />
            <Tabs.Screen
                name="join"
            />
        </Tabs> */}
            </StreamVideo>
        </SafeAreaView>
    )
}