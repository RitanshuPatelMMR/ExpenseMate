// mobile/app/(auth)/sign-up.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styles } from "../../assets/style/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
  if (!isLoaded || loading) return;
  setLoading(true);
  try {
    await signUp.create({ emailAddress, password,skipEmailVerification: true });
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    setPendingVerification(true);
  } catch (err) {
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError("That email address is already in use. Please try another.");
      } else {
        setError("An error occurred. Please try again.");
      }
      console.log(err);
    }
    finally {
    setLoading(false);
  }
  };

  // Handle submission of verification form
  const [verifyLoading, setVerifyLoading] = useState(false);
  const onVerifyPress = async () => {
    if (!isLoaded || verifyLoading) return;
    setVerifyLoading(true);
    setError("");
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Log the full signUpAttempt object for debugging
      console.dir(signUpAttempt, { depth: null });

      // Check if already verified using signUpAttempt response
      if (signUpAttempt.verifications?.emailAddress?.status === "verified" || signUpAttempt.status === "complete") {
        if (signUpAttempt.createdSessionId) {
          await setActive({ session: signUpAttempt.createdSessionId });
          setPendingVerification(false);
          await new Promise(resolve => setTimeout(resolve, 200));
          router.replace("/");
          return;
        }
      }

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        if (signUpAttempt.createdSessionId) {
          await setActive({ session: signUpAttempt.createdSessionId });
          setPendingVerification(false);
          await new Promise(resolve => setTimeout(resolve, 200));
          router.replace("/");
        }
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.dir(signUpAttempt, { depth: null });
      }
    } catch (err) {
      setError("");
      if (err?.status === 429) {
        setError("Too many attempts. Please wait a moment before trying again.");
        console.warn("Rate limit hit:", err);
      } else if (err?.errors?.length > 0) {
        setError(err.errors[0].message || "An error occurred during verification.");
        console.dir(err.errors, { depth: null });
      } else if (err instanceof Error) {
        setError(err.message);
        console.error(err.message, err.stack);
      } else {
        setError("An unknown error occurred.");
        console.dir(err, { depth: null });
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#9A8478"
          onChangeText={(code) => setCode(code)}
        />

        <TouchableOpacity
          onPress={onVerifyPress}
          style={[styles.button, verifyLoading && { opacity: 0.6 }]}
          disabled={verifyLoading}
        >
          <Text style={styles.buttonText}>
            {verifyLoading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/images/revenue-i2.png")} style={styles.illustration} />

        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholderTextColor="#9A8478"
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#9A8478"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}