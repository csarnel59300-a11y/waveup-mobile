import React, { useState } from "react";
import { StyleSheet, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";
import { generateBio, generateComment, generateDMReply } from "@/src/utils/backendService";
import { generateVideoCaption, generateVideoScript } from "@/utils/geminiService";

type Tool = "bio" | "comment" | "dm" | "caption" | "script" | null;

export default function ToolsScreen() {
  const { theme } = useTheme();
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Veuillez remplir le champ");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      let response = "";
      if (activeTool === "bio") {
        response = await generateBio(input, "TikTok");
      } else if (activeTool === "comment") {
        response = await generateComment(input, "engaging");
      } else if (activeTool === "dm") {
        response = await generateDMReply(input);
      } else if (activeTool === "caption") {
        response = await generateVideoCaption(input, "engageant");
      } else if (activeTool === "script") {
        response = await generateVideoScript(input, "60s");
      }
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      // Note: In a real app, use Clipboard API
      setResult(result + " ✓ Copié");
      setTimeout(() => setResult(result), 1000);
    }
  };

  const reset = () => {
    setActiveTool(null);
    setInput("");
    setResult("");
    setError("");
  };

  if (activeTool) {
    return (
      <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.headerGradient]}>
          <View style={styles.header}>
            <Pressable onPress={reset} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={Colors.light.primary} />
            </Pressable>
            <ThemedText style={[styles.title, { color: "#FFFFFF" }]}>
              {activeTool === "bio"
                ? "Générer une bio"
                : activeTool === "comment"
                  ? "Générer un commentaire"
                  : activeTool === "dm"
                    ? "Générer une réponse"
                    : activeTool === "caption"
                      ? "Générer une légende"
                      : "Générer un script"}
            </ThemedText>
          </View>
        </View>

        <Spacer height={Spacing.lg} />

        <View style={[styles.inputCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.label}>
            {activeTool === "bio"
              ? "Nom d'utilisateur TikTok"
              : activeTool === "comment"
                ? "Contenu de la vidéo"
                : activeTool === "dm"
                  ? "Message reçu"
                  : activeTool === "caption"
                    ? "Sujet de la vidéo"
                    : "Sujet du script"}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.textSecondary,
              },
            ]}
            placeholder="Entrez le texte..."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={input}
            onChangeText={setInput}
          />
        </View>

        <Spacer height={Spacing.md} />

        <Pressable
          onPress={handleGenerate}
          disabled={loading}
          style={[
            styles.generateButton,
            { backgroundColor: Colors.light.primary, opacity: loading ? 0.6 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="zap" size={18} color="white" />
              <ThemedText style={styles.generateButtonText}>Générer</ThemedText>
            </>
          )}
        </Pressable>

        {error ? (
          <View style={[styles.card, { backgroundColor: Colors.light.error + "20" }]}>
            <ThemedText style={{ color: Colors.light.error }}>{error}</ThemedText>
          </View>
        ) : null}

        {result ? (
          <>
            <Spacer height={Spacing.md} />
            <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.resultHeader}>
                <ThemedText style={styles.resultLabel}>Résultat</ThemedText>
                <Pressable onPress={handleCopy}>
                  <Feather name="copy" size={18} color={Colors.light.primary} />
                </Pressable>
              </View>
              <Spacer height={Spacing.sm} />
              <ThemedText style={styles.resultText}>{result}</ThemedText>
            </View>
          </>
        ) : null}

        <Spacer height={Spacing.xl} />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Outils IA</ThemedText>
      </View>

      <Spacer height={Spacing.lg} />

      <Pressable
        onPress={() => setActiveTool("bio")}
        style={[styles.toolButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.toolIcon}>
          <Feather name="user" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.toolContent}>
          <ThemedText style={styles.toolTitle}>Bio TikTok</ThemedText>
          <ThemedText style={styles.toolDescription}>Générez une bio attrayante</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Spacer height={Spacing.md} />

      <Pressable
        onPress={() => setActiveTool("comment")}
        style={[styles.toolButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.toolIcon}>
          <Feather name="message-circle" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.toolContent}>
          <ThemedText style={styles.toolTitle}>Commentaire</ThemedText>
          <ThemedText style={styles.toolDescription}>Générez un commentaire engageant</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Spacer height={Spacing.md} />

      <Pressable
        onPress={() => setActiveTool("dm")}
        style={[styles.toolButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.toolIcon}>
          <Feather name="send" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.toolContent}>
          <ThemedText style={styles.toolTitle}>Réponse DM</ThemedText>
          <ThemedText style={styles.toolDescription}>Générez une réponse intelligente</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Spacer height={Spacing.md} />

      <Pressable
        onPress={() => setActiveTool("caption")}
        style={[styles.toolButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.toolIcon}>
          <Feather name="type" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.toolContent}>
          <ThemedText style={styles.toolTitle}>Légende Vidéo</ThemedText>
          <ThemedText style={styles.toolDescription}>Générez une légende accrocheuse</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Spacer height={Spacing.md} />

      <Pressable
        onPress={() => setActiveTool("script")}
        style={[styles.toolButton, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={styles.toolIcon}>
          <Feather name="film" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.toolContent}>
          <ThemedText style={styles.toolTitle}>Script Vidéo</ThemedText>
          <ThemedText style={styles.toolDescription}>Générez un script prêt à tourner</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <Spacer height={Spacing.xl} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  headerGradient: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#00D4FF10",
    borderBottomWidth: 1,
    borderBottomColor: "#00D4FF20",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    flex: 1,
    marginLeft: Spacing.md,
  },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
    backgroundColor: Colors.light.backgroundDefault,
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.primary + "20",
    marginRight: Spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 13,
    opacity: 0.6,
  },
  inputCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    textAlignVertical: "top",
    borderColor: Colors.light.primary + "40",
  },
  generateButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary + "30",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
