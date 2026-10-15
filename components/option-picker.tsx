import { Check } from "lucide-react-native";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Text } from "@/components/ui/text";
import { DecorativeIcon } from "@/features/shared/components/decorative-icon";

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
  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop accessibilityLabel="Cerrar selector" />
      <ActionsheetContent className="max-h-[70%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Text accessibilityRole="header" className="w-full px-3 py-2 font-heading text-xl text-foreground">
          {title}
        </Text>
        <ActionsheetScrollView showsVerticalScrollIndicator={false}>
          {options.map((option) => {
            const selected = option.value === selectedValue;
            return (
              <ActionsheetItem
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`min-h-12 justify-between px-4 ${selected ? "bg-secondary" : ""}`}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <ActionsheetItemText
                  className={`flex-1 text-base font-sans-semibold ${
                    selected ? "text-secondary-foreground" : "text-foreground"
                  }`}
                >
                  {option.label}
                </ActionsheetItemText>
                {selected ? (
                  <DecorativeIcon as={Check} className="text-primary" size="lg" />
                ) : null}
              </ActionsheetItem>
            );
          })}
        </ActionsheetScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
}
