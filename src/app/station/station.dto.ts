import { z } from "zod";

export const stationCreateDTO = z.object({
  name: z.string().min(3).max(160),
  address: z.string().nonempty(),
  description: z.string().nonempty().nonoptional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  chargerType: z.enum(["AC", "DC"]),
  pricePerKwh: z.coerce.number().nonnegative(),
  totalSlots: z.coerce.number().int().positive(),
  openingTime: z.string().nonempty(),
  closingTime: z.string().nonempty(),
  powerKW: z.coerce.number().min(1, "Power must be at least 1 KW"),
});