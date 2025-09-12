import { z } from "zod"

export const credentialSchema = z.object({
  skillName: z
    .string()
    .min(2, "Skill name must be at least 2 characters")
    .max(50, "Skill name must be less than 50 characters"),
  issuerName: z
    .string()
    .min(2, "Issuer name must be at least 2 characters")
    .max(50, "Issuer name must be less than 50 characters"),
  issueDate: z.string().refine((date) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    return selectedDate <= today
  }, "Issue date cannot be in the future"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
})

export type CredentialFormData = z.infer<typeof credentialSchema>

export const validateCredentialForm = (data: CredentialFormData) => {
  try {
    credentialSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}
