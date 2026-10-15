export enum Permission {
	CONTACTS_READ = 'contacts:read',
	CONTACTS_UPDATE = 'contacts:update',
	CONTACTS_DELETE = 'contacts:delete',
	USERS_READ = 'users:read',
	USERS_UPDATE = 'users:update',
	PETS_READ = 'pets:read',
	PETS_WRITE = 'pets:write',
	PETS_MANAGE_ALL = 'pets:manage-all',
	SERVICES_WRITE = 'services:write',
	APPOINTMENTS_READ = 'appointments:read',
	APPOINTMENTS_WRITE = 'appointments:write',
	APPOINTMENTS_MANAGE_ALL = 'appointments:manage-all',
	MEDICAL_RECORDS_READ = 'medical-records:read',
	MEDICAL_RECORDS_WRITE = 'medical-records:write',
	MEDICAL_RECORDS_MANAGE_ALL = 'medical-records:manage-all',
	MEDICATIONS_WRITE = 'medications:write',
	ORDERS_READ = 'orders:read',
	ORDERS_WRITE = 'orders:write',
	ORDERS_MANAGE_ALL = 'orders:manage-all',
	REPORTS_READ = 'reports:read',
}

// Source of truth: dps-vet-web scripts/seed/catalog/role.catalog.ts (CLIENTE role).
// Any permission added to CLIENTE there MUST be added to CUSTOMER_ALLOWED_PERMISSIONS here,
// otherwise customers holding it are rejected (fail closed).

/** Permissions a user must hold to use the customer app (checked by permission, never by role). */
export const CUSTOMER_REQUIRED_PERMISSIONS: Permission[] = [
	Permission.PETS_READ,
	Permission.APPOINTMENTS_READ,
];

/** Superset a customer may hold; any permission outside it marks a staff account. */
export const CUSTOMER_ALLOWED_PERMISSIONS: Permission[] = [
	Permission.PETS_READ,
	Permission.PETS_WRITE,
	Permission.APPOINTMENTS_READ,
	Permission.APPOINTMENTS_WRITE,
	Permission.MEDICAL_RECORDS_READ,
	Permission.ORDERS_READ,
	Permission.ORDERS_WRITE,
];
