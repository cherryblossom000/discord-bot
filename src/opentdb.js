import fetch from 'node-fetch';
import { upperFirst } from './lodash.js';
class OpenTDBError extends Error {
    constructor(message, path) {
        super(message);
        Object.defineProperty(this, "path", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: path
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'OpenTDBError'
        });
    }
}
Object.defineProperty(OpenTDBError, "INVALID_PARAMETER", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'Invalid parameter'
});
const api = async (path) => {
    const { response_code: code, ...rest } = (await (await fetch(`https://opentdb.com/${path}`)).json());
    if (code === 2)
        throw new OpenTDBError(OpenTDBError.INVALID_PARAMETER, path);
    return { code, ...rest };
};
const fetchToken = async () => (await api('api_token.php?command=request')).token;
const resetToken = async (token) => {
    const path = `api_token.php?command=reset&token=${token}`;
    const { code, token: newToken } = await api(path);
    if (code === 3)
        return fetchToken();
    return newToken;
};
export var Difficulty;
(function (Difficulty) {
    Difficulty[Difficulty["Easy"] = 0] = "Easy";
    Difficulty[Difficulty["Medium"] = 1] = "Medium";
    Difficulty[Difficulty["Hard"] = 2] = "Hard";
})(Difficulty || (Difficulty = {}));
let token;
export const fetchQuestion = async () => {
    const path = `api.php?amount=1&encode=url3986&token=${(token ??=
        await fetchToken())}`;
    const { code, results: [question] } = await api(path);
    switch (code) {
        case 1:
            return null;
        case 3:
        case 4:
            token = await (code === 3
                ? fetchToken()
                : resetToken(token));
            return fetchQuestion();
        case 0: {
            const type = question.type === 'multiple' ? 0 : 1;
            return {
                type,
                difficulty: Difficulty[upperFirst(question.difficulty)],
                category: decodeURIComponent(question.category),
                question: decodeURIComponent(question.question),
                correctAnswer: type === 0
                    ? decodeURIComponent(question.correct_answer)
                    : question.correct_answer === 'True',
                ...(type === 0
                    ? {
                        incorrectAnswers: question.incorrect_answers.map(decodeURIComponent)
                    }
                    : {})
            };
        }
    }
};
//# sourceMappingURL=opentdb.js.map