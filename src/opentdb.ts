import upperFirst from 'lodash.upperfirst'
import fetch from 'node-fetch'

// #region Response
/* eslint-disable @typescript-eslint/naming-convention -- raw API response */
const enum ResponseCode {
  Success,
  NoResults,
  InvalidParameter,
  TokenNotFound,
  TokenEmpty
}

interface QuestionResponseBase {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  correct_answer: string
}

interface Response {
  response_code: ResponseCode
}

interface FetchQuestionResponse extends Response {
  results: (QuestionResponseBase & (
    | {type: 'multiple', incorrect_answers: string[]}
    | ({type: 'boolean'} & (
      | {correct_answer: 'True', incorrect_answers: ['False']}
      | {correct_answer: 'False', incorrect_answers: ['True']}
    ))
  ))[]
}

interface TokenResponse extends Response {
  token: string
}

interface FetchTokenResponse extends TokenResponse {
  response_message: string
}

interface ResetTokenResponse extends TokenResponse {
  token: string
}
/* eslint-enable @typescript-eslint/naming-convention -- see above */
// #endregion

class OpenTDBError extends Error {
  static INVALID_TOKEN = 'Invalid token'
  static INVALID_PARAMETER = 'Invalid parameter'
  name = 'OpenTDBError'

  constructor(message: string, public path: string) {
    super(message)
  }
}

const api = async <T extends Response = Response>(
  path: string
): Promise<
Omit<T, 'response_code'> & {code: typeof ResponseCode[Exclude<keyof typeof ResponseCode, 'InvalidParameter'>]}
> => {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- destructuring
  const {response_code: code, ...rest} = await (await fetch(`https://opentdb.com/${path}`)).json() as T
  if (code === ResponseCode.InvalidParameter) throw new OpenTDBError(OpenTDBError.INVALID_PARAMETER, path)
  return {code, ...rest}
}

const fetchToken = async (): Promise<string> => (await api<FetchTokenResponse>('api_token.php?command=request')).token

const resetToken = async (token: string): Promise<string> => {
  const path = `api_token.php?command=reset&token=${token}`
  const {code, token: newToken} = await api<ResetTokenResponse>(path)
  if (code === ResponseCode.TokenNotFound) throw new OpenTDBError(OpenTDBError.INVALID_TOKEN, path)
  return newToken
}

// d0a44779a366a59c29e8e102e5c882ec392bc7518fb22686c114869655fb81a5

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

let token: string | undefined

/** Fetches a question from the Open Trivia Database. */
export const fetchQuestion = async (): Promise<Question | null> => {
  // TODO [typescript@>=4]: update to token ??= await fetchToken()
  // eslint-disable-next-line require-atomic-updates -- token not reassigned based on outdated value
  const path = `api.php?amount=1&encode=url3986&token=${token ?? (token = await fetchToken())}`
  const {code, results: [question]} = await api<FetchQuestionResponse>(path)

  switch (code) {
    case ResponseCode.TokenNotFound: throw new OpenTDBError(OpenTDBError.INVALID_TOKEN, path)
    case ResponseCode.NoResults: return null
    case ResponseCode.TokenEmpty:
      // eslint-disable-next-line require-atomic-updates -- unavoidable
      token = await resetToken(token)
      return fetchQuestion()
    case ResponseCode.Success: {
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
  }
}
