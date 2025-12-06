import { useRouter } from "expo-router";
// import { generateAPIUrl } from "@/utils"; // <-- COMENTA O BORRA ESTO, ES LO QUE CAUSA EL ERROR
import { useChat } from "@ai-sdk/react";
import { useUser } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, View, YStack } from "tamagui";

export default function AIChatScreen() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  // 1. DEFINIR LA URL MANUALMENTE PARA EVITAR EL CRASH
  // Si tienes tu web en Vercel, pon esa URL aquí (ej: "https://mi-diario.vercel.app")
  // Si no, dejamos una genérica para que la app no explote.
  const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_ORIGIN || "https://tu-proyecto.vercel.app";

  const { messages, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as typeof globalThis.fetch,
      // 2. USAR LA URL MANUAL EN VEZ DE LA FUNCIÓN ROTA
      api: `${SERVER_URL}/api/chat`,
      body: async () => ({
        userId: user?.id || "",
      }),
    }),
    
    onError: (error) => console.error("Error en chat:", error),
  });

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <Text color="$red10">Error de conexión con la IA</Text>
          {/* Mostramos el error de forma amigable en vez de cerrar la app */}
          <Text fontSize={12} color="#666666">{error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.content}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.length === 0 ? (
              <YStack gap="$4" style={{ alignItems: "center" }} mt="$12">
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <MaterialIcons name="smart-toy" size={40} color="#666" />
                  </View>
                </View>
                <Text
                  fontSize="$6"
                  fontWeight="600"
                  color="$color11"
                  style={{ textAlign: "center" }}
                >
                  Empezar a conversar
                </Text>
              </YStack>
            ) : (
              messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageContainer,
                    m.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage,
                  ]}
                >
                  {m.role === "assistant" && (
                    <View style={styles.messageAvatar}>
                      <MaterialIcons
                        name="smart-toy"
                        size={20}
                        color="#666"
                      />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      m.role === "user"
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    {m.parts.map((part, i) => {
                      if (part.type === 'text') {
                         return (
                            <Markdown
                              key={`${m.id}-${i}`}
                              style={{
                                body: {
                                  color: m.role === "user" ? "white" : "#1f2937",
                                  fontSize: 16,
                                  lineHeight: 22,
                                },
                                paragraph: {
                                  marginTop: 0,
                                  marginBottom: 0,
                                  color: m.role === "user" ? "white" : "#1f2937",
                                },
                              }}
                            >
                              {part.text}
                            </Markdown>
                         )
                      }
                      return null;
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#999"
                value={input}
                onChange={(e) => setInput(e.nativeEvent.text)}
                onSubmitEditing={handleSend}
                autoFocus={false}
              />
              <Button
                size="$3"
                bg={input.trim() ? "#904BFF" : "#cccccc"}
                color="white"
                onPress={handleSend}
                disabled={!input.trim()}
                circular
                style={styles.sendButton}
              >
                ↑
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexGrow: 1,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
    gap: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#904BFF",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#ffffff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    maxHeight: 100,
    paddingVertical: 8,
    lineHeight: 22,
  },
  sendButton: {
    width: 36,
    height: 36,
    minHeight: 36,
    padding: 0,
    fontSize: 20,
  },
});