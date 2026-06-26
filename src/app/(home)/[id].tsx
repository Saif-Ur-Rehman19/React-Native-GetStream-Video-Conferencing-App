import { View, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Call, CallingState, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk'
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Room from '@/components/Room';
import { generateSlug } from "random-word-slugs";
import Toast from 'react-native-root-toast';
import { copySlug } from '@/lib/slug';

const CallScreen = () => {
  const [call, setCall] = useState<Call | null>(null);
  const client = useStreamVideoClient();
  const [slug, setSlug] = useState<string | null>(null);
  const { id } = useLocalSearchParams();

  useFocusEffect(useCallback(() => {
    if (!client) return;
    let cancelled = false;
    let newSlug: string;
    let _call: Call;

    if (id !== '(home)' && id) {
      newSlug = id.toString();
      _call = client.call("default", newSlug);
      _call.join({ create: false }).then(() => {
        if (!cancelled) setCall(_call);
      });
    } else {
      newSlug = generateSlug(3, {
        categories: {
          adjective: ["color", "personality"],
          noun: ["animals", "food"]
        }
      });
      _call = client.call("default", newSlug);
      _call.join({ create: true }).then(() => {
        if (cancelled) return;
        Toast.show("Call created successfully \n Tap here to copy the call ID to share", {
          duration: Toast.durations.LONG,
          position: Toast.positions.CENTER,
          shadow: true,
          onPress: async () => {
            copySlug(newSlug)
          }
        })
        setCall(_call);
      });
    }
    setSlug(newSlug);

    return () => {
      cancelled = true;
      if (_call && _call.state.callingState !== CallingState.LEFT) {
        _call.leave();
      }
      setCall(null);
      setSlug(null);
    };
  }, [id, client]));

  if (!call || !slug) {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <ActivityIndicator size={'large'}/>
      </View>
    )
  }
  return (
    <StreamCall call={call}>
      <Room slug={slug} />
    </StreamCall>
  )
}

export default CallScreen