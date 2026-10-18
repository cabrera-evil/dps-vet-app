import {
	CUSTOMER_ALLOWED_PERMISSIONS,
	CUSTOMER_REQUIRED_PERMISSIONS,
	Permission,
} from '@/constants/permission';

export function hasPermission(
	userPermissions: Permission[] | undefined,
	required: Permission[],
	mode: 'any' | 'all' = 'any'
): boolean {
	// allow all if no permissions are required
	if (!required.length) return true;
	if (!userPermissions?.length) return false;
	const granted = new Set(userPermissions);
	return mode === 'all'
		? required.every((permission) => granted.has(permission))
		: required.some((permission) => granted.has(permission));
}

/** Customer-app gate: holds the required permissions and nothing beyond the customer set (fail closed). */
export const isCustomerAccount = (
	permissions: Permission[] | undefined
): boolean =>
	hasPermission(permissions, CUSTOMER_REQUIRED_PERMISSIONS, 'all') &&
	!!permissions &&
	permissions.every((p) => CUSTOMER_ALLOWED_PERMISSIONS.includes(p));
