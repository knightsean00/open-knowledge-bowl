export enum SupplementType {
    PICTURE = "PICTURE",
    SOUND = "SOUND",
    EMBED = "EMBED",
}

export type QuestionSupplement = {
    Data: string;
    Type: SupplementType;
}

export type Question = {
    Question: string;
    Answer: string;
    Supplement?: QuestionSupplement;
}

export type QuestionArray = Array<Question>

export type QuestionBank = {
    [key: string]: QuestionArray
}
