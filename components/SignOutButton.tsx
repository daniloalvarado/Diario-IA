import { useClerk } from "@clerk/clerk-expo";
import { Alert, Text } from "react-native";
import { Button } from "tamagui";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    // Are you sure you want to sign out?
    Alert.alert(
      "¿Estás seguro de que quieres cerrar sesión?",
      "Esto cerrará la sesión de tu cuenta y tendrás que iniciar sesión nuevamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await signOut();
            // Redirect to the sign-in page happens automatically with the Protected Route
          },
        },
      ]
    );
  };
  return (
    <Button theme="red" borderColor="$borderColor" onPress={handleSignOut}>
      <Text>Salir</Text>
    </Button>
  );
};
