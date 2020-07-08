import upperFirst from 'lodash.upperfirst'
import fetch from 'node-fetch'

// #region Response
/* eslint-disable @typescript-eslint/naming-convention -- raw API response */
const enum ResponseCode {
  SUCCESS,
  NO_RESULTS,
  INVALID_PARAMETER,
  TOKEN_NOT_FOUND,
  TOKEN_EMPTY
}

interface QuestionResponseBase {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  correct_answer: string
}

interface Response {
  response_code: ResponseCode
  results: (QuestionResponseBase & (
    | {type: 'multiple', incorrect_answers: string[]}
    | ({type: 'boolean'} & (
      | {correct_answer: 'True', incorrect_answers: ['False']}
      | {correct_answer: 'False', incorrect_answers: ['True']}
    ))
  ))[]
}
/* eslint-enable @typescript-eslint/naming-convention -- see above */
// #endregion

export const enum Type {
  MultipleChoice,
  TrueFalse
}

export enum Difficulty {
  Easy,
  Medium,
  Hard
}

interface QuestionBase {
  difficulty: Difficulty
  category: string
  question: string
}

type Question = QuestionBase & (
  | {type: Type.MultipleChoice, correctAnswer: string, incorrectAnswers: string[]}
  | {type: Type.TrueFalse, correctAnswer: boolean}
)

/** Fetches a question from the Open Trivia Database. */
export const fetchQuestion = async (): Promise<Question | null> => {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- renaming
  const {response_code: code, results: [question]} = await (await fetch(
    'https://opentdb.com/api.php?amount=1&encode=url3986'
  )).json() as Response

  if (code === ResponseCode.NO_RESULTS) return null
  if (code !== ResponseCode.SUCCESS) throw new Error(`Unsuccessful Open Trivia DB response code: ${code}`)

  const type = question.type === 'multiple' ? Type.MultipleChoice : Type.TrueFalse

  return {
    type,
    difficulty: Difficulty[upperFirst(question.difficulty) as keyof typeof Difficulty],
    category: decodeURIComponent(question.category),
    question: decodeURIComponent(question.question),
    correctAnswer: type === Type.MultipleChoice ? decodeURIComponent(question.correct_answer) : question.correct_answer === 'True',
    ...type === Type.MultipleChoice
      ? {incorrectAnswers: (question.incorrect_answers as string[]).map(decodeURIComponent)}
      : {}
  } as Question
}
