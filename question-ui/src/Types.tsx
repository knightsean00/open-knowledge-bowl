import { z } from "zod/v4";

// export enum SupplementType {
//   PICTURE = "PICTURE",
//   SOUND = "SOUND",
//   EMBED = "EMBED",
// }

export const corsProxy = "https://cors-anywhere-rvzr.onrender.com";
export const deezerTrackApiPrefix = "https://api.deezer.com/track"

export const SupplementTypeSchema = z.enum(["PICTURE", "SOUND", "EMBED", "DEEZER"]);
export type SupplementType = z.infer<typeof SupplementTypeSchema>;

// export type QuestionSupplement = {
//   data: string;
//   type: SupplementType;
// };

export const QuestionSupplementSchema = z.object({
  data: z.string(),
  type: SupplementTypeSchema,
});
export type QuestionSupplement = z.infer<typeof QuestionSupplementSchema>;

// export type Question = {
//   question: string;
//   answer: string;
//   supplement?: QuestionSupplement;
// };

export const QuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  supplement: z.optional(QuestionSupplementSchema),
});
export type Question = z.infer<typeof QuestionSchema>;

// export type QuestionArray = Array<Question>;

export const QuestionArraySchema = z.array(QuestionSchema);
export type QuestionArray = z.infer<typeof QuestionArraySchema>;

export const QuestionBankSchema = z.record(z.string(), QuestionArraySchema);

export type QuestionBank = z.infer<typeof QuestionBankSchema>;

// export type QuestionBank = {
//   [key: string]: QuestionArray;
// };
