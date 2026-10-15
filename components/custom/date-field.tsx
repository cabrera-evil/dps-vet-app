import { useCalendarContext } from "@gluestack-ui/core/calendar/creator";
import { addDays, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

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
import { Button, ButtonText } from "@/components/ui/button";
import {
  Calendar,
  CalendarBody,
  CalendarGrid,
  CalendarHeader,
  CalendarHeaderNextButton,
  CalendarHeaderPrevButton,
  CalendarWeekDay,
  CalendarWeekDaysHeader,
} from "@/components/ui/calendar";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { DecorativeIcon } from "@/features/shared/components/decorative-icon";
import { fromIsoDate, toIsoDate } from "@/utils/date";

type DateFieldProps = {
  /** `YYYY-MM-DD`, or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
  placeholder: string;
  invalid?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

// Years offered when only one side of the range is bounded (pets can be 15+ years old).
const DEFAULT_YEAR_SPAN = 60;

// Spanish weekday initials, Monday first (the vendor calendar header is English-only).
const WEEKDAYS = Array.from({ length: 7 }, (_, index) =>
  format(addDays(startOfWeek(new Date(2024, 0, 7), { weekStartsOn: 1 }), index), "EEEEE", { locale: es }).toUpperCase(),
);

type PickerHeaderProps = {
  yearView: boolean;
  onToggleYearView: () => void;
};

// Month arrows + a Spanish title that toggles the year list, driven by the calendar context.
function PickerHeader({ yearView, onToggleYearView }: PickerHeaderProps) {
  const { currentMonth } = useCalendarContext();
  const title = format(currentMonth, "MMMM yyyy", { locale: es });
  return (
    <CalendarHeader>
      <CalendarHeaderPrevButton accessibilityLabel="Mes anterior" accessibilityRole="button" className="h-12 w-12">
        <DecorativeIcon as={ChevronLeft} className="text-foreground" size="lg" />
      </CalendarHeaderPrevButton>
      <Pressable
        accessibilityHint="Cambia el año"
        accessibilityLabel={`${title}, elegir año`}
        accessibilityRole="button"
        accessibilityState={{ expanded: yearView }}
        className="min-h-12 flex-row items-center gap-1 rounded-md px-3 active:bg-muted"
        onPress={onToggleYearView}
      >
        <Text className="text-base font-sans-semibold capitalize text-foreground">{title}</Text>
        <DecorativeIcon as={ChevronDown} className="text-muted-foreground" size="md" />
      </Pressable>
      <CalendarHeaderNextButton accessibilityLabel="Mes siguiente" accessibilityRole="button" className="h-12 w-12">
        <DecorativeIcon as={ChevronRight} className="text-foreground" size="lg" />
      </CalendarHeaderNextButton>
    </CalendarHeader>
  );
}

type YearListProps = {
  minYear: number;
  maxYear: number;
  onDone: () => void;
};

// Most recent year first; picking one jumps the calendar there and returns to the day grid.
function YearList({ minYear, maxYear, onDone }: YearListProps) {
  const { currentMonth, setYear } = useCalendarContext();
  const current = currentMonth.getFullYear();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index);
  return (
    <ActionsheetScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
      {years.map((year) => {
        const selected = year === current;
        return (
          <ActionsheetItem
            key={year}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`min-h-12 justify-between px-4 ${selected ? "bg-secondary" : ""}`}
            onPress={() => {
              setYear(year);
              onDone();
            }}
          >
            <ActionsheetItemText
              className={`flex-1 text-base font-sans-semibold ${selected ? "text-secondary-foreground" : "text-foreground"}`}
            >
              {year}
            </ActionsheetItemText>
            {selected ? <DecorativeIcon as={Check} className="text-primary" size="lg" /> : null}
          </ActionsheetItem>
        );
      })}
    </ActionsheetScrollView>
  );
}

/** Date-only picker (gluestack calendar in an actionsheet); value is a `YYYY-MM-DD` string built from local calendar fields. */
export function DateField({
  value,
  onChange,
  accessibilityLabel,
  placeholder,
  invalid,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [yearView, setYearView] = useState(false);
  const [draft, setDraft] = useState<Date | undefined>();

  const selected = fromIsoDate(value);
  // Day-granular bounds so time-of-day (e.g. `new Date()`) never disables the boundary day.
  const minDate = minimumDate ? startOfDay(minimumDate) : undefined;
  const maxDate = maximumDate ? startOfDay(maximumDate) : undefined;
  const thisYear = new Date().getFullYear();
  const maxYear = maxDate?.getFullYear() ?? (minDate ? minDate.getFullYear() + DEFAULT_YEAR_SPAN : thisYear + 10);
  const minYear = minDate?.getFullYear() ?? maxYear - DEFAULT_YEAR_SPAN;

  // Open on the selected month, else the month closest to today inside the allowed range.
  let anchor = selected ?? new Date();
  if (!selected && maxDate && anchor > maxDate) anchor = maxDate;
  if (!selected && minDate && anchor < minDate) anchor = minDate;

  const openPicker = () => {
    setDraft(selected);
    setYearView(false);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const confirm = () => {
    if (draft) onChange(toIsoDate(draft));
    close();
  };

  return (
    <>
      <Pressable
        accessibilityHint="Abre el calendario"
        accessibilityLabel={`${accessibilityLabel}: ${selected ? format(selected, "dd/MM/yyyy") : placeholder}`}
        accessibilityRole="button"
        className={`min-h-12 flex-row items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 active:bg-muted ${
          invalid ? "border-destructive" : "border-input"
        }`}
        onPress={openPicker}
      >
        <Text className={`flex-1 ${selected ? "text-foreground" : "text-muted-foreground"}`}>
          {selected ? format(selected, "dd/MM/yyyy") : placeholder}
        </Text>
        <DecorativeIcon as={ChevronDown} className="text-muted-foreground" size="lg" />
      </Pressable>

      <Actionsheet isOpen={open} onClose={close}>
        <ActionsheetBackdrop accessibilityLabel="Cerrar calendario" />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <Text accessibilityRole="header" className="w-full px-3 py-2 font-heading text-xl text-foreground">
            {accessibilityLabel}
          </Text>
          <View className="w-full">
            <Calendar
              className="border-0"
              firstDayOfWeek={1}
              initialMonth={startOfMonth(anchor)}
              maxDate={maxDate}
              maxYear={maxYear}
              minDate={minDate}
              minYear={minYear}
              onValueChange={setDraft}
              value={draft}
            >
              <PickerHeader onToggleYearView={() => setYearView((v) => !v)} yearView={yearView} />
              {yearView ? (
                <YearList maxYear={maxYear} minYear={minYear} onDone={() => setYearView(false)} />
              ) : (
                <>
                  <CalendarWeekDaysHeader>
                    {WEEKDAYS.map((day, index) => (
                      <CalendarWeekDay key={index}>{day}</CalendarWeekDay>
                    ))}
                  </CalendarWeekDaysHeader>
                  <CalendarBody>
                    <CalendarGrid />
                  </CalendarBody>
                </>
              )}
            </Calendar>
          </View>
          <View className="w-full flex-row gap-3 px-3 pb-2 pt-3">
            <Button className="min-h-12 flex-1" onPress={close} variant="outline">
              <ButtonText>Cancelar</ButtonText>
            </Button>
            <Button className="min-h-12 flex-1" isDisabled={!draft} onPress={confirm}>
              <ButtonText>Aceptar</ButtonText>
            </Button>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
