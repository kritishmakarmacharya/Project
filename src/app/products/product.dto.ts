import { z } from "zod";

export const productCreateDTO = z.object({
  name: z.string().min(3).max(160),
  category: z.string().nonempty().nonoptional(),
  description: z.string().nonempty().nonoptional(),
  price: z.coerce.number().nonnegative().nonoptional(),
  discount: z.coerce.number().nullable().default(0),
  brand: z.string().nullable().optional(),
  seller: z.string().nonempty().nonoptional(),
  status: z
    .string()
    .regex(/^(active|inactive)$/)
    .default("inactive"),
});
