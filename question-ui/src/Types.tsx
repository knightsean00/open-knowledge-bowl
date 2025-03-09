export type Question = {
    Question: string;
    Answer: string;
}

export type QuestionArray = Array<Question>

export type QuestionBank = {
    [key: string]: QuestionArray
}