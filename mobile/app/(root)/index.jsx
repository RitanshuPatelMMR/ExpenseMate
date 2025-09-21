import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";

export default function Paper() {
  const { user } = useUser();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SignedIn>
        <Text>
          Welcome {user?.emailAddresses?.[0]?.emailAddress || 'User'}
        </Text>
        <SignOutButton />
      </SignedIn>

      <SignedOut>
        <Link href="(auth)/sign-in">
          <Text>Sign In</Text>
        </Link>
        <Link href="(auth)/sign-up">
          <Text>Sign Up</Text>
        </Link>
      </SignedOut>
    </View>
  );
}