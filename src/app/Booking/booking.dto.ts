import { z } from "zod";

export const bookingCreateDTO = z.object({
    station: z.string()
    .min(1, "Station Id is required")
    .refine(
        (id) => /^[0-9a-fA-F]{24}$/.test(id),
        "Invalid Station Id"
    ),
    slot: z.string()
    .min(1, "Slot Id is required")
    .refine(
        (id) => /^[0-9a-fA-F]{24}$/.test(id),
    ),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    energyKwh: z.number()
    .finite()
    .min(0.1, "Energy must be atleast 0.1 Kwh"),
})
.refine(
    (data) => data.startTime < data.endTime,
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
)
.refine(
    (data) => data.startTime > new Date(),
    {
        message: "Booking start time must be in the future",
        path: ["startTime"],
    }
);
