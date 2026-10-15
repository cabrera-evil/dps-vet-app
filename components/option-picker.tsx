import { Check, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { Text } from "@/components/ui/text";

type PickerOption = {
  label: string;
  value: string;
};

type OptionPickerProps = {
  visible: boolean;
  title: string;
  options: readonly PickerOption[];
  selectedValue?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function OptionPicker({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: OptionPickerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      accessibilityViewIsModal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          accessibilityLabel="Cerrar selector"
          accessibilityRole="button"
          className="flex-1"
          onPress={onClose}
        />
        <View
          className="max-h-[70%] rounded-t-2xl bg-card px-6 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text accessibilityRole="header" className="flex-1 font-heading text-xl text-foreground">
              {title}
            </Text>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center rounded-full active:bg-muted"
              onPress={onClose}
            >
              <DecorativeIcon
                as={X}
                className="text-muted-foreground"
                size="xl"
              />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const selected = option.value === selectedValue;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`mb-2 min-h-12 flex-row items-center justify-between rounded-lg px-4 py-3 active:opacity-70 ${
                    selected ? "bg-secondary" : "bg-background"
                  }`}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <Text
                    className={`flex-1 font-sans-semibold ${
                      selected ? "text-secondary-foreground" : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <DecorativeIcon
                      as={Check}
                      className="text-primary"
                      size="lg"
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
