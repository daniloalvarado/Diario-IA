import { SignOutButton } from "@/components/SignOutButton";
import { AppColors } from "@/constants/theme";
import { useStreaks } from "@/hooks/use-streaks";
import { getUserDisplayName, getUserInitials } from "@/lib/utils/user";
import { Protect, useUser } from "@clerk/clerk-expo";
import { Image, Linking, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trophy, Flame } from '@tamagui/lucide-icons';
import {
  Button,
  Card,
  H1,
  H2,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const insets = useSafeAreaInsets();
  const { currentStreak, longestStreak } = useStreaks();

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </View>
    );
  }

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          paddingTop: insets.top + 20,
        }}
      >
        <YStack px="$4" gap="$4" pb={insets.bottom + 100}>
          {/* Profile Header Card */}
          <Card
            elevate
            size="$4"
            bordered
            bg="$background"
            borderColor="$borderColor"
            padding="$6"
          >
            <YStack gap="$4" style={{ alignItems: "center" }}>
              {/* Profile Picture */}
              <View
                style={{
                  borderRadius: 60,
                  overflow: "hidden",
                  width: 120,
                  height: 120,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#e5e7eb",
                }}
              >
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Text fontSize={42} fontWeight="700" color="$color11">
                    {initials}
                  </Text>
                )}
              </View>

              {/* Name & Email */}
              <YStack style={{ alignItems: "center" }} gap="$2">
                <H1
                  fontSize={28}
                  fontWeight="700"
                  style={{ textAlign: "center" }}
                >
                  {displayName}
                </H1>
                {user?.primaryEmailAddress?.emailAddress && (
                  <Text fontSize={14} color="$color10">
                    {user.primaryEmailAddress.emailAddress}
                  </Text>
                )}
              </YStack>

              {/* Plan Badge */}
              <Protect
                plan="pro"
              // fallback={
              //   <View style={styles.planBadge}>
              //     <Text fontSize={13} fontWeight="600" color="$color11">
              //       Plan Gratuito
              //     </Text>
              //   </View>
              // }
              >
                <View style={styles.proPlanBadge}>
                  <Text fontSize={13} fontWeight="700" color="#904BFF">
                    ✨ Pro Plan
                  </Text>
                </View>
              </Protect>
            </YStack>
          </Card>

          {/* Stats Cards */}
          <XStack gap="$4">
            {/* Current Streak Card */}
            <Card
              elevate
              size="$4"
              bordered
              bg="$background"
              borderColor="$borderColor"
              padding="$5"
              flex={1}
            >
              <YStack gap="$3" style={{ alignItems: "center" }}>
                <View style={styles.streakIconContainer}>
                  <Flame size={24} color={AppColors.flameOrange} fill={AppColors.flameOrange} />

                </View>
                <Text fontSize={36} fontWeight="800" color="$color12">
                  {currentStreak}
                </Text>
                <Text fontSize={12} color="$color10" fontWeight="600">
                  Racha de Días
                </Text>
              </YStack>
            </Card>

            {/* Best Streak Card */}
            <Card
              elevate
              size="$4"
              bordered
              bg="$background"
              borderColor="$borderColor"
              padding="$5"
              flex={1}
            >
              <YStack gap="$3" style={{ alignItems: "center" }}>
                <View style={styles.bestStreakIconContainer}>
                  <Trophy size={24} color={AppColors.primary} />
                </View>
                <Text fontSize={36} fontWeight="800" color="$color12">
                  {longestStreak}
                </Text>
                <Text fontSize={12} color="$color10" fontWeight="600">
                  Mejor Racha
                </Text>
              </YStack>
            </Card>
          </XStack>

          {/* Subscription Card */}
          {/* <Card
            elevate
            size="$4"
            bordered
            bg="$background"
            borderColor="$borderColor"
            padding="$5"
          >
            <YStack gap="$4">
              <YStack gap="$2">
                <H2 fontSize={18} fontWeight="700" color="$color12">
                  Subscripción
                </H2>
                <Text fontSize={13} color="$color10" lineHeight={18}>
                  Gestiona tu plan y facturación
                </Text>
              </YStack>
              <Button
                size="$4"
                bg="$purple9"
                color="white"
                pressStyle={{ opacity: 0.8 }}
                fontWeight="600"
                onPress={() => {
                  Linking.openURL("http://localhost:8081/pricing");
                }}
              >
                Ver Planes y Precios
              </Button>
            </YStack>
          </Card> */}

          {/* Account Section */}
          <Card
            elevate
            size="$4"
            bordered
            bg="$background"
            borderColor="$borderColor"
            padding="$5"
          >
            <YStack gap="$4">
              <YStack gap="$2">
                <H2 fontSize={18} fontWeight="700" color="$color12">
                  Cuenta
                </H2>
                <Text fontSize={13} color="$color10" lineHeight={18}>
                  Administrar la configuración de tu cuenta
                </Text>
              </YStack>
              <SignOutButton />
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
  },
  planBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  proPlanBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(144, 75, 255, 0.4)",
    backgroundColor: "rgba(144, 75, 255, 0.15)",
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bestStreakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(144, 75, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
