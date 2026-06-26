import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { inverseFormatSlug } from '@/lib/slug';
import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';
import Toast from 'react-native-root-toast';

const Join = () => {
  const [roomId, setRoomId] = useState("");
  const client = useStreamVideoClient();
  const router = useRouter();
  const handleJoinRoom = async () => {
    if (!roomId) return;
    const slug = inverseFormatSlug(roomId);
    const call = client?.call("default", slug);
    call?.get().then((callResponse) => {
      router.push(`/(home)/${slug}`)
    }).catch((reason) => {
      Toast.show("The room you are trying to join doesn't exist,", {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: true
      })
    })

  }
  return (
    <View style={{flex: 1}}>
      <Text style={{padding: 20, fontWeight: 'bold'}}>Enter the Room Name</Text>
      <TextInput placeholder='e.g Black Purple Tiger'
      value={roomId}
      onChangeText={setRoomId}
      style={{
        padding: 20,
        width: '100%',
        backgroundColor: 'white'
      }}/>
      <TouchableOpacity
      onPress={handleJoinRoom}
      style={{
        padding: 20,
        backgroundColor: '#5F5DEC',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      >
        <Text>Join Room</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Join