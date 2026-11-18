import { z } from "zod";
// Start charging session DTO
export const startSessionDTO = z.object({
    booking: z.string()
    .min(1, "Bookig Id is required")
    .refine(
        (id) => /^[0-9a-fA-F]{24}$/.test(id),
        "Invalid Booking Id"
    ),
});

// End charging session DTO
export const endSessionDTO = z.object({
    energyConsumed: z.coerce.number()
    .finite("Energy consumed must be a finite number")
    .positive("Energy consumed must be greater than 0"),
});