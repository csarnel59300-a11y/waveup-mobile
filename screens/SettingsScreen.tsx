import React, { useState } from "react";
import { StyleSheet, View, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import Spacer from "@/components/Spacer";

interface SettingToggleProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingToggle({
  icon,
  label,
  description,
  value,
  onValueChange,
}: SettingToggleProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.settingItem, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.settingLeft}>
        <View
          style={[styles.settingIcon, { backgroundColor: Colors.light.primary + "20" }]}
        >
          <Feather name={icon} size={18} color={Colors.light.primary} />
        </View>
        <View style={styles.settingInfo}>
          <ThemedText style={styles.settingLabel}>{label}</ThemedText>
          {description ? (
            <ThemedText
              style={[styles.settingDescription, { color: theme.textSecondary }]}
            >
              {description}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.backgroundTertiary,
          true: Colors.light.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

interface SettingOptionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  options: string[];
  onSelect: (option: string) => void;
}

function SettingOption({ icon, label, value, options, onSelect }: SettingOptionProps) {
  const { theme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setShowOptions(!showOptions)}
        style={({ pressed }) => [
          styles.settingItem,
          { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: Colors.light.primary + "20" },
            ]}
          >
            <Feather name={icon} size={18} color={Colors.light.primary} />
          </View>
          <ThemedText style={styles.settingLabel}>{label}</ThemedText>
        </View>
        <View style={styles.settingRight}>
          <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
            {value}
          </ThemedText>
          <Feather
            name={showOptions ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.textSecondary}
          />
        </View>
      </Pressable>

      {showOptions ? (
        <View
          style={[styles.optionsContainer, { backgroundColor: theme.backgroundDefault }]}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onSelect(option);
                setShowOptions(false);
              }}
              style={({ pressed }) => [
                styles.optionItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  option === value ? { color: Colors.light.primary, fontWeight: "600" } : null,
                ]}
              >
                {option}
              </ThemedText>
              {option === value ? (
                <Feather name="check" size={18} color={Colors.light.primary} />
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function SettingsScreen() {
  const { theme } = useTheme();

  const [notifications, setNotifications] = useState({
    trends: true,
    ideas: true,
    reminders: false,
    tips: true,
  });

  const [language, setLanguage] = useState("Français");
  const [appearance, setAppearance] = useState("Automatique");

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        <ThemedText type="h4">Notifications</ThemedText>
        <Spacer height={Spacing.lg} />

        <SettingToggle
          icon="trending-up"
          label="Tendances"
          description="Nouveaux hashtags tendances"
          value={notifications.trends}
          onValueChange={(value) =>
            setNotifications({ ...notifications, trends: value })
          }
        />
        <Spacer height={Spacing.sm} />

        <SettingToggle
          icon="zap"
          label="Idées de contenu"
          description="Nouvelles suggestions personnalisées"
          value={notifications.ideas}
          onValueChange={(value) =>
            setNotifications({ ...notifications, ideas: value })
          }
        />
        <Spacer height={Spacing.sm} />

        <SettingToggle
          icon="bell"
          label="Rappels de publication"
          description="Rappels pour poster vos vidéos"
          value={notifications.reminders}
          onValueChange={(value) =>
            setNotifications({ ...notifications, reminders: value })
          }
        />
        <Spacer height={Spacing.sm} />

        <SettingToggle
          icon="info"
          label="Conseils et astuces"
          description="Astuces pour améliorer votre compte"
          value={notifications.tips}
          onValueChange={(value) =>
            setNotifications({ ...notifications, tips: value })
          }
        />
      </Animated.View>

      <Spacer height={Spacing["2xl"]} />

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <ThemedText type="h4">Préférences</ThemedText>
        <Spacer height={Spacing.lg} />

        <SettingOption
          icon="globe"
          label="Langue"
          value={language}
          options={["Français", "English", "Español", "Deutsch"]}
          onSelect={setLanguage}
        />
        <Spacer height={Spacing.sm} />

        <SettingOption
          icon="moon"
          label="Apparence"
          value={appearance}
          options={["Automatique", "Clair", "Sombre"]}
          onSelect={setAppearance}
        />
      </Animated.View>

      <Spacer height={Spacing["4xl"]} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  settingValue: {
    fontSize: 14,
  },
  optionsContainer: {
    marginTop: Spacing.xs,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  optionText: {
    fontSize: 15,
  },
});
