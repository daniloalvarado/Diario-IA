import Logo from "@/components/Logo";
import { useModal } from "@/contexts/ModalContext";
import { useSignUp, isClerkAPIResponseError } from "@clerk/clerk-expo"; // IMPORTANTE: Agregué isClerkAPIResponseError
import { useRouter } from "expo-router";
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  Card,
  H1,
  Input,
  Label,
  Paragraph,
  ScrollView,
  Spacer,
  XStack,
  YStack,
} from "tamagui";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { showModal } = useModal();

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err: any) {
      // --- BLOQUE DE ERROR MEJORADO ---
      console.log(JSON.stringify(err, null, 2));

      let errorMessage = "Ups, ocurrió un error, ¡por favor intenta de nuevo!";

      // Si el error viene de Clerk, sacamos el mensaje detallado
      if (isClerkAPIResponseError(err)) {
        const msg = err.errors[0]?.message || "";

        if (msg.includes("Password")) {
          errorMessage = "La contraseña debe tener al menos 8 caracteres.";
        } else {
          errorMessage = msg;
        }
      }

      // Si es otro tipo de error con mensaje
      else if (err instanceof Error) {
        errorMessage = err.message;
      }

      showModal({
        type: "alert",
        title: "Atención", // Cambiado a "Atención" o "Error"
        description: errorMessage, // Aquí mostramos "Passwords must be 8 characters..."
      });
      // -------------------------------
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.log(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      // También mejoramos el error aquí por si acaso
      console.log(JSON.stringify(err, null, 2));

      let errorMessage = "El código de verificación es incorrecto";

      if (isClerkAPIResponseError(err)) {
        errorMessage = err.errors[0]?.longMessage || err.errors[0]?.message || errorMessage;
      }

      showModal({
        type: "alert",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <ScrollView
          flex={1}
          bg="$background"
          contentContainerStyle={{ flex: 1 }}
        >
          <YStack
            flex={1}
            p="$4"
            gap="$4"
            style={{ justifyContent: "center", minHeight: "100%" }}
          >
            <Logo />

            <YStack gap="$2" style={{ alignItems: "center" }}>
              <H1 color="$color" style={{ textAlign: "center" }}>
                Verifica tu correo
              </H1>
              <Paragraph
                color="$color"
                opacity={0.7}
                style={{ textAlign: "center" }}
              >
                Hemos enviado un código de verificación a {emailAddress}
              </Paragraph>
            </YStack>

            <Card elevate padding="$4" gap="$2" backgroundColor="$background">
              <YStack gap="$2">
                <YStack gap="$2">
                  <Label color="$color">Código de verificación</Label>
                  <Input
                    value={code}
                    placeholder="Ingresa el código"
                    onChangeText={setCode}
                    borderColor="$borderColor"
                    focusStyle={{
                      borderColor: "$purple10",
                    }}
                    keyboardType="numeric"
                    autoComplete="one-time-code"
                  />
                </YStack>

                <Spacer />

                <Button
                  size="$4"
                  bg="#904BFF"
                  color="white"
                  borderColor="#904BFF"
                  onPress={onVerifyPress}
                  disabled={!isLoaded || isLoading}
                  opacity={!isLoaded || isLoading ? 0.5 : 1}
                >
                  {isLoading ? "Verificando..." : "Verificar correo"}
                </Button>
              </YStack>
            </Card>

            <XStack
              gap="$2"
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <Paragraph color="$color" opacity={0.7}>
                ¿No recibiste el código?
              </Paragraph>
              <Button
                variant="outlined"
                size="$3"
                borderColor="#904BFF"
                color="#904BFF"
                onPress={() => setPendingVerification(false)}
              >
                Reenviar
              </Button>
            </XStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView flex={1} bg="$background" contentContainerStyle={{ flex: 1 }}>
        <YStack
          flex={1}
          p="$4"
          gap="$4"
          style={{ justifyContent: "center", minHeight: "100%" }}
        >
          <Logo />

          <YStack gap="$2" style={{ alignItems: "center" }}>
            <H1 color="$color" style={{ textAlign: "center" }}>
              Crear cuenta
            </H1>
            <Paragraph
              color="$color"
              opacity={0.7}
              style={{ textAlign: "center" }}
            >
              Regístrate para comenzar
            </Paragraph>
          </YStack>

          <Card elevate padding="$4" gap="$2" backgroundColor="$background">
            <YStack gap="$2">
              <YStack gap="$2">
                <Label color="$color">Correo electrónico</Label>
                <Input
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailAddress}
                  placeholder="Ingresa tu correo"
                  onChangeText={setEmailAddress}
                  borderColor="$borderColor"
                  focusStyle={{
                    borderColor: "$purple10",
                  }}
                />
              </YStack>

              <YStack gap="$2">
                <Label color="$color">Contraseña</Label>
                <Input
                  secureTextEntry
                  value={password}
                  placeholder="Crea una contraseña"
                  onChangeText={setPassword}
                  borderColor="$borderColor"
                  focusStyle={{
                    borderColor: "$purple10",
                  }}
                />
              </YStack>

              <Spacer />

              <Button
                size="$4"
                bg="#904BFF"
                color="white"
                borderColor="#904BFF"
                onPress={onSignUpPress}
                disabled={!isLoaded || isLoading}
                opacity={!isLoaded || isLoading ? 0.5 : 1}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </YStack>
          </Card>

          <XStack
            gap="$2"
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Paragraph color="$color" opacity={0.7}>
              ¿Ya tienes una cuenta?
            </Paragraph>

            <Button
              variant="outlined"
              size="$3"
              borderColor="#904BFF"
              color="#904BFF"
              onPress={() => router.canGoBack() && router.back()}
            >
              Iniciar sesión
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}