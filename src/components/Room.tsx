import { CallContent, CallingState, useCall } from '@stream-io/video-react-native-sdk'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import RoomId from './RoomId'

const CallRoom = ({ slug }: { slug: string }) => {
    const router = useRouter();
    const call = useCall();
    return (
        <View style={{ flex: 1 }}>
            <View style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 100
            }}>
                <RoomId slug={slug} />
            </View>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <CallContent onHangupCallHandler={async () => {
                    if (call && call.state.callingState !== CallingState.LEFT) {
                        await call.leave();
                    }
                    router.back();
                }} />
            </GestureHandlerRootView>
        </View>
    )
}

export default CallRoom