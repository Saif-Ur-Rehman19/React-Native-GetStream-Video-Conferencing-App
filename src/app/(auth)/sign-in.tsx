import * as React from 'react'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { useSignIn, useSSO } from '@clerk/expo'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { type Href, Link, useRouter } from 'expo-router'
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OAuthStrategy } from '@clerk/types'

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  useWarmUpBrowser()

  const { signIn, errors, fetchStatus } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [submittingStrategy, setSubmittingStrategy] = React.useState<OAuthStrategy | null>(null)

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    })
    if (error) {
      console.error(JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url as Href)
          }
        },
      })
    } else if (signIn.status === 'needs_second_factor') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      )

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode()
      }
    } else {
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code })

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url as Href)
          }
        },
      })
    } else {
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  const onOAuthPress = async (oauthStrategy: OAuthStrategy) => {
    setSubmittingStrategy(oauthStrategy)
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: oauthStrategy,
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'videocallapp',
          path: '/',
        }),
      })

      if (createdSessionId) {
        setActive!({
          session: createdSessionId,
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask)
              return
            }

            const url = decorateUrl('/')
            if (url.startsWith('http')) {
              window.location.href = url
            } else {
              router.push(url as Href)
            }
          },
        })
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setSubmittingStrategy(null)
    }
  }

  if (signIn.status === 'needs_client_trust') {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={[styles.title, { fontSize: 24, fontWeight: 'bold' }]}>
            Verify your account
          </ThemedText>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter your verification code"
            placeholderTextColor="#666666"
            onChangeText={(code) => setCode(code)}
            keyboardType="numeric"
          />
          {errors.fields.code && (
            <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              fetchStatus === 'fetching' && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleVerify}
            disabled={fetchStatus === 'fetching'}
          >
            <ThemedText style={styles.buttonText}>Verify</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => signIn.mfa.sendEmailCode()}
          >
            <ThemedText style={styles.secondaryButtonText}>I need a new code</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => signIn.reset()}
          >
            <ThemedText style={styles.secondaryButtonText}>Start over</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    )
  }

  const googleStrategy = 'oauth_google' as OAuthStrategy
  const isGoogleLoading = submittingStrategy === googleStrategy
  const isAnyOAuthLoading = submittingStrategy !== null

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Sign in
      </ThemedText>

      <ThemedText style={styles.label}>Email address</ThemedText>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#666666"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        keyboardType="email-address"
      />
      {errors.fields.identifier && (
        <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
      )}

      <ThemedText style={styles.label}>Password</ThemedText>
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      {errors.fields.password && (
        <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === 'fetching'}
      >
        <ThemedText style={styles.buttonText}>Continue</ThemedText>
      </Pressable>

      <Text style={styles.orText}>OR</Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isAnyOAuthLoading && !isGoogleLoading && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => onOAuthPress(googleStrategy)}
        disabled={isAnyOAuthLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isGoogleLoading ? 'Opening…' : 'Sign in with Google'}
        </ThemedText>
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.linkContainer}>
        <ThemedText>Don't have an account? </ThemedText>
        <Link href="/sign-up">
          <ThemedText type="link">Sign up</ThemedText>
        </Link>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
  },
  divider: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  error: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
  },
})
