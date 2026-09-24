import { z } from "zod";

export const SourceSchema = z.object({
  clauseId: z.string().nullish(),
  page: z.number().nullish(),
  textQuote: z.string().nullish(),
}).catch({});

export const ClauseSchema = z.object({
  id: z.string().catch(""),
  title: z.string().catch(""),
  category: z.enum([
    "termination",
    "payment",
    "confidentiality",
    "intellectual_property",
    "restriction",
    "dispute",
    "scope",
    "duration",
    "other",
  ]).catch("other"),
  originalText: z.string().catch(""),
  plainLanguage: z.string().catch(""),
  affectedParties: z.array(z.string()).catch([]),
  obligations: z.array(z.string()).catch([]),
  conditions: z.array(z.string()).catch([]),
  attentionLevel: z.enum(["information", "review", "important"]).catch("information"),
  attentionReason: z.string().nullish(),
  source: SourceSchema,
});

export const ObligationSchema = z.object({
  id: z.string().catch(""),
  description: z.string().catch(""),
  responsibleParty: z.string().catch(""),
  obligationType: z.enum([
    "payment",
    "notice",
    "confidentiality",
    "delivery",
    "approval",
    "restriction",
    "other",
  ]).catch("other"),
  deadline: z.string().nullish(),
  continuing: z.boolean().nullish(),
  source: SourceSchema,
});

export const DeadlineSchema = z.object({
  id: z.string().catch(""),
  description: z.string().catch(""),
  relativeTiming: z.string().nullish(),
  date: z.string().nullish(),
  responsibleParty: z.string().nullish(),
  source: SourceSchema,
});

export const AttentionPointSchema = z.object({
  id: z.string().catch(""),
  title: z.string().catch(""),
  explanation: z.string().catch(""),
  level: z.enum(["review", "important"]).catch("review"),
  source: SourceSchema,
});

export const DocumentAnalysisSchema = z.object({
  documentType: z.string().catch("Document"),
  title: z.string().nullish(),
  summary: z.string().catch(""),
  parties: z.array(
    z.object({
      name: z.string().catch(""),
      role: z.string().catch(""),
    })
  ).catch([]),
  clauses: z.array(ClauseSchema).catch([]),
  obligations: z.array(ObligationSchema).catch([]),
  deadlines: z.array(DeadlineSchema).catch([]),
  attentionPoints: z.array(AttentionPointSchema).catch([]),
});

export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

export const ScenarioAnalysisSchema = z.object({
  scenario: z.string().catch(""),
  interpretation: z.string().catch(""),
  triggeringConditions: z.array(
    z.object({
      description: z.string().catch(""),
      source: SourceSchema,
    })
  ).catch([]),
  relevantClauses: z.array(
    z.object({
      clauseId: z.string().nullish(),
      title: z.string().catch(""),
      relevance: z.string().catch(""),
      source: SourceSchema,
    })
  ).catch([]),
  obligations: z.array(
    z.object({
      description: z.string().catch(""),
      responsibleParty: z.string().nullish(),
      timing: z.string().nullish(),
      source: SourceSchema,
    })
  ).catch([]),
  consequences: z.array(
    z.object({
      description: z.string().catch(""),
      certainty: z.enum(["stated", "not_specified"]).catch("stated"),
      source: SourceSchema,
    })
  ).catch([]),
  missingInformation: z.array(z.string()).catch([]),
  professionalQuestions: z.array(z.string()).catch([]),
});

export type ScenarioAnalysis = z.infer<typeof ScenarioAnalysisSchema>;

export const ComparisonChangeSchema = z.object({
  changeType: z.enum(["modified", "added", "removed"]).catch("modified"),
  category: z.string().catch("other"),
  title: z.string().catch(""),
  summary: z.string().catch(""),
  significance: z.enum(["attention", "review", "informational"]).catch("informational"),
  documentA: z.object({
    text: z.string().catch(""),
    source: SourceSchema
  }).nullish(),
  documentB: z.object({
    text: z.string().catch(""),
    source: SourceSchema
  }).nullish(),
  obligationChanges: z.array(z.object({
    description: z.string().catch(""),
    documentA: z.string().nullish(),
    documentB: z.string().nullish()
  })).catch([]),
  deadlineChanges: z.array(z.object({
    documentA: z.string().nullish(),
    documentB: z.string().nullish()
  })).catch([])
});

export const ComparisonAnalysisSchema = z.object({
  documentA: z.object({
    filename: z.string().catch("Document A"),
    title: z.string().nullish()
  }).catch({ filename: "Document A" }),
  documentB: z.object({
    filename: z.string().catch("Document B"),
    title: z.string().nullish()
  }).catch({ filename: "Document B" }),
  summary: z.string().catch(""),
  changes: z.array(ComparisonChangeSchema).catch([]),
  unchangedAreas: z.array(z.string()).catch([]),
  missingInformation: z.array(z.string()).catch([]),
  professionalQuestions: z.array(z.string()).catch([]),
  isIdentical: z.boolean().catch(false)
});

export type ComparisonChange = z.infer<typeof ComparisonChangeSchema>;
export type ComparisonAnalysis = z.infer<typeof ComparisonAnalysisSchema>;

export const ProfessionalQuestionSchema = z.object({
  question: z.string().catch(""),
  whyItMatters: z.string().catch(""),
  relatedClauseId: z.string().nullish(),
  source: SourceSchema.nullish(),
  category: z.string().catch("General")
});

export const ProfessionalQuestionSetSchema = z.object({
  questions: z.array(ProfessionalQuestionSchema).catch([]),
  missingInformation: z.array(z.string()).catch([]),
  disclaimer: z.string().catch("ClauseGuard provides document-based legal information and assistance. It does not replace a qualified legal professional.")
});

export type ProfessionalQuestion = z.infer<typeof ProfessionalQuestionSchema>;
export type ProfessionalQuestionSet = z.infer<typeof ProfessionalQuestionSetSchema>;

export const DocumentQAResponseSchema = z.object({
  question: z.string().catch(""),
  answer: z.string().catch(""),
  answerStatus: z.enum(["answered", "not_found", "uncertain"]).catch("uncertain"),
  sources: z.array(SourceSchema).catch([]),
  relatedClauseIds: z.array(z.string()).catch([]),
  relatedObligationIds: z.array(z.string()).catch([]),
  followUpQuestions: z.array(z.string()).catch([])
});

export type DocumentQAResponse = z.infer<typeof DocumentQAResponseSchema>;
