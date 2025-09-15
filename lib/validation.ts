import { z, ZodError } from "zod"

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

export const skillCredentialSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  verifierDID: z.string().min(1, "Verifier DID is required"),
  evidenceUrl: z.string().url("Invalid evidence URL").optional(),
  description: z.string().optional(),
})

export const experienceCredentialSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  verifierDID: z.string().min(1, "Verifier DID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  evidenceUrl: z.string().url("Invalid evidence URL").optional(),
})

export const credentialIssueSchema = z.object({
  credentialType: z.enum(['SkillCredential', 'ExperienceCredential']),
  subjectDID: z.string().min(1, "Subject DID is required"),
  issuerDID: z.string().min(1, "Issuer DID is required"),
  credentialData: z.union([skillCredentialSchema, experienceCredentialSchema]),
  expirationDate: z.string().optional(),
})

export const credentialVerifySchema = z.object({
  credential: z.object({
    '@context': z.array(z.string()),
    id: z.string(),
    type: z.array(z.string()),
    issuer: z.union([z.string(), z.object({ id: z.string() })]),
    issuanceDate: z.string(),
    expirationDate: z.string().optional(),
    credentialSubject: z.object({
      id: z.string(),
      type: z.array(z.string()),
    }).passthrough(),
    proof: z.object({
      type: z.string(),
      created: z.string(),
      verificationMethod: z.string(),
      proofPurpose: z.string(),
      proofValue: z.string(),
    }),
  }),
})

export type CredentialFormData = z.infer<typeof credentialSchema>
export type SkillCredentialData = z.infer<typeof skillCredentialSchema>
export type ExperienceCredentialData = z.infer<typeof experienceCredentialSchema>
export type CredentialIssueData = z.infer<typeof credentialIssueSchema>
export type CredentialVerifyData = z.infer<typeof credentialVerifySchema>

export const validateCredentialForm = (data: CredentialFormData) => {
  try {
    credentialSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}

export const validateCredentialIssue = (data: CredentialIssueData) => {
  try {
    credentialIssueSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}

export const validateCredentialVerify = (data: CredentialVerifyData) => {
  try {
    credentialVerifySchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: z.ZodIssue) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: "Validation failed" } }
  }
}