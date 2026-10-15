import { CLINIC_TIME_ZONE } from '@/constants/defaults';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatIsoDateInput(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 8);
	const year = digits.slice(0, 4);
	const month = digits.slice(4, 6);
	const day = digits.slice(6, 8);

	return [year, month, day].filter(Boolean).join('-');
}

export function formatDate(value: string) {
	return format(parseISO(value), 'dd MMM yyyy', { locale: es });
}

// America/El_Salvador is UTC-6 all year (no DST), so a fixed offset is exact for building instants.
const CLINIC_UTC_OFFSET = '-06:00';

/** A local Date whose calendar/clock fields are the clinic's wall time, whatever the runtime time zone. */
function toClinicWallDate(value: string | Date) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: CLINIC_TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(new Date(value));
	const part = (type: string) =>
		Number(parts.find((item) => item.type === type)?.value);
	return new Date(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'));
}

/** Same output as `formatDate`, but the calendar day is the clinic's, whatever the runtime time zone. */
export function formatClinicDate(value: string) {
	return format(toClinicWallDate(value), 'dd MMM yyyy', { locale: es });
}

/** Long label such as "jueves 16 de octubre", in the clinic's time zone. */
export function formatClinicLongDate(value: string) {
	return format(toClinicWallDate(value), "EEEE d 'de' MMMM", { locale: es });
}

/** Time such as "10:30 a. m.", in the clinic's time zone. */
export function formatClinicTime(value: string) {
	return format(toClinicWallDate(value), 'h:mm a', { locale: es });
}

/** Clinic-local "now" as `{ date: 'YYYY-MM-DD', time: 'HH:mm' }`. */
export function clinicNow(now: Date = new Date()) {
	const wall = format(toClinicWallDate(now), 'yyyy-MM-dd HH:mm');
	return { date: wall.slice(0, 10), time: wall.slice(11) };
}

/** UTC ISO instant for a clinic-local date (YYYY-MM-DD) and time (HH:mm); null if not a real date. */
export function clinicStartIso(date: string, time: string): string | null {
	const instant = new Date(`${date}T${time}:00${CLINIC_UTC_OFFSET}`);
	if (Number.isNaN(instant.getTime())) return null;
	// Rejects overflow such as 2026-02-31, which Hermes may roll over instead of rejecting.
	return clinicNow(instant).date === date ? instant.toISOString() : null;
}

export function formatTime(value: string) {
	return format(parseISO(value), 'h:mm a', { locale: es });
}

export function formatMonthYear(value: string) {
	return format(parseISO(value), 'MMMM yyyy', { locale: es });
}
