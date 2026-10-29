import z from "zod";

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W]).{8,25}$/;

export const RegisterDTO = z
  .object({
    name: z
      .string()
      .min(2, "Name must have atleast 2 characters")
      .max(50, "Name cannot have meore than 50 characters"),
    email: z
      .email()
      .nonempty("Email is required")
      .nonoptional("Email property missing"),
    // username: z
    //   .string()
    //   .min(5, "username must be of atleast 5 character long")
    //   .max(50, "Username must not be longer than 50 character")
    //   .nonoptional("Username property missing"),

    //validate
    password: z
      .string()
      .regex(passwordRegex, "Password must satisfy strong password rules")
      .nonempty("Password is required")
      .nonoptional(),
    confirmPassword: z
      .string()
      .nonempty("Confirm password is required")
      .nonoptional(),

    phone: z.string().nullable().optional(),
    role: z
      .string()
      .regex(/^(customer|owner)$/, "Role can be either 'Owner' or 'Customer'")
      .nonempty()
      .nonoptional(),
    address: z.string().nonempty().nonoptional(),
  })
  .refine((val) => val.password == val.confirmPassword, {
    message: "Password and confirm password must match",
    path: ["confirmPassword"],
  });

export const LoginDTO = z.object({
  // username: z
  //   .string()
  //   .min(5, "username must be atleast 5 character long")
  //   .max(50, "Username must not be longer than 50 character")
  //   .nonoptional("Username property missing"),
  email: z
    .email()
    .nonempty("Email is required")
    .nonoptional("Email property missing"),
  password: z.string().nonempty("Password is required").nonoptional(),
});

export const OTPValidationDTO = z.object({
  email: z
    .email()
    .nonempty("Email is required")
    .nonoptional("Email property missing"),
  otp: z.string().length(4).nonempty().nonoptional(),
});
