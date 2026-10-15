import { z } from 'zod';

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
			.max(128, { message: 'La contraseña no debe exceder 128 caracteres' }),
		confirmPassword: z
			.string()
			.min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
			.max(128, { message: 'La contraseña no debe exceder 128 caracteres' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['confirmPassword'],
	});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;
