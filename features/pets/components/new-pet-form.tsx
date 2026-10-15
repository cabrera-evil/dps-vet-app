import { z } from "zod";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, View } from "react-native";

import { OptionPicker } from "@/components/option-picker";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { formatIsoDateInput } from "@/utils/date";
import {
  getBreedsForSpecies,
  petCatalog,
  petSexOptions,
} from "@/features/pets/pet-catalog.mock";
import { AppointmentSelectField } from "@/features/appointments/components/appointment-select-field";
import { usePetPreview } from "@/features/pets/pet-preview-context";
import { FormScreen } from "@/features/shared/components/form-screen";

const newPetSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresa el nombre de tu mascota").max(120, "Máximo 120 caracteres"),
    species: z.string().min(1, "Selecciona la especie"),
    breed: z.string(),
    sex: z.enum(["MALE", "FEMALE", ""]).optional(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato AAAA-MM-DD")
      .refine((value) => new Date(`${value}T00:00:00`).getTime() <= Date.now(), "La fecha no puede ser futura"),
    sterilized: z.boolean(),
    color: z.string().max(60, "Máximo 60 caracteres"),
    microchip: z.string().max(40, "Máximo 40 caracteres"),
    markings: z.string().max(300, "Máximo 300 caracteres"),
    notes: z.string().max(2000, "Máximo 2000 caracteres"),
  })
  .superRefine((values, context) => {
    if (getBreedsForSpecies(values.species).length > 0 && !values.breed) {
      context.addIssue({ code: "custom", path: ["breed"], message: "Selecciona la raza" });
    }
  });

type NewPetValues = z.infer<typeof newPetSchema>;
type FieldName = keyof NewPetValues;
type FormErrors = Partial<Record<FieldName, string>>;
type PickerName = "species" | "breed" | "sex" | null;

const initialValues: NewPetValues = {
  name: "",
  species: "",
  breed: "",
  sex: "",
  birthDate: "",
  sterilized: false,
  color: "",
  microchip: "",
  markings: "",
  notes: "",
};

const sexLabels: Record<NonNullable<NewPetValues["sex"]>, string> = {
  "": "Sin especificar",
  MALE: "Macho",
  FEMALE: "Hembra",
};

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-2 text-sm font-sans-semibold text-foreground">{children}</Text>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text accessibilityRole="alert" className="mt-2 text-sm text-destructive">{message}</Text> : null;
}

export function NewPetForm() {
  const { addPet } = usePetPreview();
  const [values, setValues] = useState<NewPetValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activePicker, setActivePicker] = useState<PickerName>(null);

  const breeds = useMemo(() => getBreedsForSpecies(values.species), [values.species]);

  const updateValue = <Key extends FieldName>(field: Key, value: NewPetValues[Key]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const chooseSpecies = (species: string) => {
    setValues((current) => ({ ...current, species, breed: "" }));
    setErrors((current) => ({ ...current, species: undefined, breed: undefined }));
  };

  const handlePickerSelect = (value: string) => {
    if (activePicker === "species") {
      chooseSpecies(value);
      return;
    }
    if (activePicker === "breed") {
      updateValue("breed", value);
      return;
    }
    if (activePicker === "sex") updateValue("sex", value as NewPetValues["sex"]);
  };

  const handleSubmit = () => {
    const parsed = newPetSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") nextErrors[field as FieldName] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    addPet({
      ...parsed.data,
      breed: parsed.data.breed || undefined,
      sex: parsed.data.sex || undefined,
      color: parsed.data.color || undefined,
      microchip: parsed.data.microchip || undefined,
      markings: parsed.data.markings || undefined,
      notes: parsed.data.notes || undefined,
    });
    Alert.alert("Mascota registrada", `${parsed.data.name} ya aparece en tu lista de vista previa.`, [
      { text: "Ver mascotas", onPress: () => router.back() },
    ]);
  };

  const pickerOptions =
    activePicker === "species"
      ? petCatalog.map((entry) => ({ label: entry.species, value: entry.species }))
      : activePicker === "breed"
        ? breeds.map((breed) => ({ label: breed, value: breed }))
        : petSexOptions;

  return (
    <FormScreen
      backLabel="Volver a mascotas"
      subtitle="Registra a tu compañero para agendar citas."
      title="Nueva mascota"
    >
        <View className="rounded-xl border border-border bg-secondary p-4">
          <Text className="font-sans-semibold text-secondary-foreground">Datos de tu mascota</Text>
          <Text className="mt-1 text-sm leading-5 text-secondary-foreground">Los campos con * son obligatorios.</Text>
        </View>

        <View className="mt-6">
          <FieldLabel>Nombre *</FieldLabel>
          <Input className={`min-h-12 ${errors.name ? "border-destructive" : ""}`}>
            <InputField accessibilityLabel="Nombre" autoCapitalize="words" placeholder="Ej. Luna" value={values.name} onChangeText={(value) => updateValue("name", value)} />
          </Input>
          <FieldError message={errors.name} />
        </View>

        <AppointmentSelectField
          error={errors.species}
          label="Especie *"
          onPress={() => setActivePicker("species")}
          placeholder="Selecciona la especie"
          value={values.species}
        />

        {breeds.length > 0 ? (
          <AppointmentSelectField
            disabled={!values.species}
            error={errors.breed}
            label="Raza *"
            onPress={() => setActivePicker("breed")}
            placeholder="Selecciona la raza"
            value={values.breed}
          />
        ) : null}

        <View className="mt-5">
          <FieldLabel>Fecha de nacimiento *</FieldLabel>
          <Input className={`min-h-12 ${errors.birthDate ? "border-destructive" : ""}`}>
            <InputField
              accessibilityLabel="Fecha de nacimiento"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              placeholder="AAAA-MM-DD"
              value={values.birthDate}
              onChangeText={(value) =>
                updateValue("birthDate", formatIsoDateInput(value))
              }
            />
          </Input>
          <Text className="mt-2 text-sm text-muted-foreground">Ejemplo: 2023-05-14</Text>
          <FieldError message={errors.birthDate} />
        </View>

        <AppointmentSelectField
          label="Sexo (opcional)"
          onPress={() => setActivePicker("sex")}
          placeholder="Sin especificar"
          value={values.sex ? sexLabels[values.sex] : ""}
        />

        <View className="mt-5 flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
          <View className="mr-4 flex-1">
            <Text className="font-sans-semibold text-foreground">Esterilizado / castrado</Text>
            <Text className="mt-1 text-sm text-muted-foreground">Puedes cambiarlo después.</Text>
          </View>
          <Switch accessibilityLabel="Esterilizado / castrado" value={values.sterilized} onValueChange={(value) => updateValue("sterilized", value)} />
        </View>

        <View className="mt-5">
          <FieldLabel>Color (opcional)</FieldLabel>
          <Input className={`min-h-12 ${errors.color ? "border-destructive" : ""}`}>
            <InputField accessibilityLabel="Color" maxLength={60} placeholder="Ej. Dorado" value={values.color} onChangeText={(value) => updateValue("color", value)} />
          </Input>
          <FieldError message={errors.color} />
        </View>

        <View className="mt-5">
          <FieldLabel>Microchip / identificación (opcional)</FieldLabel>
          <Input className={`min-h-12 ${errors.microchip ? "border-destructive" : ""}`}>
            <InputField accessibilityLabel="Microchip" maxLength={40} placeholder="Código de identificación" value={values.microchip} onChangeText={(value) => updateValue("microchip", value)} />
          </Input>
          <FieldError message={errors.microchip} />
        </View>

        <View className="mt-5">
          <FieldLabel>Señas particulares (opcional)</FieldLabel>
          <Textarea className={errors.markings ? "border-destructive" : ""}>
            <TextareaInput accessibilityLabel="Señas particulares" maxLength={300} placeholder="Ej. Mancha blanca en el pecho" value={values.markings} onChangeText={(value) => updateValue("markings", value)} />
          </Textarea>
          <FieldError message={errors.markings} />
        </View>

        <View className="mt-5">
          <FieldLabel>Notas (opcional)</FieldLabel>
          <Textarea className={errors.notes ? "border-destructive" : ""}>
            <TextareaInput accessibilityLabel="Notas" maxLength={2000} placeholder="Información que quieras recordar" value={values.notes} onChangeText={(value) => updateValue("notes", value)} />
          </Textarea>
          <FieldError message={errors.notes} />
        </View>

        <Button className="mt-8 min-h-12 rounded-lg" onPress={handleSubmit}>
          <ButtonText className="font-sans-semibold">Registrar mascota</ButtonText>
        </Button>
      <OptionPicker
        onClose={() => setActivePicker(null)}
        onSelect={handlePickerSelect}
        options={pickerOptions}
        selectedValue={activePicker ? values[activePicker] : undefined}
        title={activePicker === "species" ? "Elige la especie" : activePicker === "breed" ? "Elige la raza" : "Elige el sexo"}
        visible={activePicker !== null}
      />
    </FormScreen>
  );
}
