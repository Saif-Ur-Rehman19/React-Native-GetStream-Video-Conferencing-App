import { formatSlug } from '@/lib/slug'
import { Show, useClerk, useUser } from '@clerk/expo'
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { Call, useStreamVideoClient } from '@stream-io/video-react-native-sdk'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { FlatList, Image, Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import Dialog from 'react-native-dialog'

export default function Page() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [dialogOpen, setDialogOpen] = useState(false);
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isRefresing, setIsRefreshing] = useState(false);
  const [isMyCalls, setIsMyCalls] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCalls()
  }, [isMyCalls]);

  const fetchCalls = async () => {
    if (!client || !user) return;
    const { calls } = await client.queryCalls({
      filter_conditions: isMyCalls ? {
        // filter calls where user is the creator or a member of the call
        $or: [
          { created_by_user_id: user.id },
          { members: { $in: [user.id] } }
        ]
      } : {},
      sort: [{ field: "created_at", direction: -1 }],
      watch: true
    });
    const sortedCalls = calls.sort((a, b) => {
      return b.state.participantCount - a.state.participantCount
    });
    setCalls(sortedCalls);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCalls();
    setIsRefreshing(false);
  }

  const handleJoinRoom = (id: string) => {
    router.push(`/(home)/${id}`)
  }



  return (
    <View style={styles.container}>
      <TouchableOpacity>

      </TouchableOpacity>
      {/* <Show when="signed-out">
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </Show> */}
      <Show when="signed-in">
        <Pressable style={styles.button} onPress={() => setDialogOpen(true)}>
          <MaterialCommunityIcons name='logout' size={24} color={'#5F5DEC'} />
        </Pressable>
      </Show>
      <Dialog.Container visible={dialogOpen}>
        <Dialog.Title>Sign Out</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to sign out?
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => setDialogOpen(false)} />
        <Dialog.Button label="Sign Out" onPress={() => {
          signOut();
          setDialogOpen(false);
        }} />
      </Dialog.Container>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        //padding: 10,
        gap: 10
      }}>
        <Text style={{
          color: isMyCalls ? 'black' : "#5F5DEC", minWidth: 53
        }}
          onPress={() => setIsMyCalls(false)}
        >All Calls</Text>
        <Switch
          trackColor={{ false: "#5F5DEC", true: "#5F5DEC" }}
          thumbColor={'white'}
          ios_backgroundColor={'#5F5DEC'}
          onValueChange={() => setIsMyCalls(!isMyCalls)}
          value={isMyCalls}
        />
        <Text onPress={() => setIsMyCalls(true)} style={{ color: !isMyCalls ? 'black' : "#5F5DEC", minWidth: 55 }}>My Calls</Text>
      </View>
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        refreshing={isRefresing}
        onRefresh={handleRefresh}
        contentContainerStyle={{
          paddingBottom: 100
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleJoinRoom(item.id)}
            disabled={item.state.participantCount == 0}
            style={{
              padding: 20,
              backgroundColor: item.state.participantCount === 0 ? "#f1f1f1" : "#fff",
              opacity: item.state.participantCount === 0 ? 0.5 : 1,
              borderBottomWidth: 1,
              borderBottomColor: item.state.participantCount === 0 ? "#fff" : "#f1f1f1",
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10
            }}
          >
            {
              item.state.participantCount === 0 ? (
                <Feather name='phone-off' size={24} color={'gray'} />
              )
                : (
                  <Feather name='phone-call' size={24} color={'gray'} />
                )
            }
            <Image source={{ uri: item.state.createdBy?.image }} style={{
              width: 50,
              height: 50,
              borderRadius: 25
            }} />
            <View style={{
              flex: 1,
              justifyContent: 'space-between'
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {item.state.createdBy?.name || item.state.createdBy?.custom.email.split("@")[0]}
                </Text>
                <Text style={{ fontSize: 12 }}>{item.state.createdBy?.custom.email}</Text>
              </View>
              <View style={{
                alignItems: 'flex-end',
                gap: 50
              }}>
                <Text style={{
                  fontSize: 10,
                  textAlign: 'right',
                  width: 100
                }}>{formatSlug(item.id)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {
                    item.state.participantCount === 0 ? (
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#5F5DEC' }}>Call Ended</Text>
                    ) : (
                      <View style={{
                        borderRadius: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f1f1f1',
                        padding: 10
                      }}>
                        <Entypo name='users' size={14} color={'#5F5DEC'} style={{ marginRight: 5 }} />
                        <Text style={{ fontWeight: 'bold', color: '#5F5DEC' }}>{item.state.participantCount}</Text>
                      </View>
                    )
                  }

                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 6,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 100
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
})