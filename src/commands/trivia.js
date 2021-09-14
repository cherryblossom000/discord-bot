import { Collection, MessageEmbed, escapeMarkdown } from 'discord.js';
import { emojis } from '../constants.js';
import { addTriviaQuestion, aggregateTriviaUsers, collection, fetchValue, triviaUsersCount, triviaUsersCountQuery } from '../database.js';
import { shuffle } from '../lodash.js';
import { Difficulty, fetchQuestion } from '../opentdb.js';
import { checkPermissions, ignoreError, resolveUser } from '../utils.js';
const formatPercentage = (numerator, denominator, percentage = numerator / denominator) => `${numerator}/${denominator} (${(percentage * 100).toFixed(2)}%)`;
const statsCommand = async (message, input, database) => {
    if (message.guild && !(await checkPermissions(message, 'EMBED_LINKS')))
        return;
    const user = await resolveUser(message, input);
    if (!user)
        return;
    const embed = new MessageEmbed()
        .setTitle(user.tag)
        .setThumbnail(user.displayAvatarURL())
        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
        .setTimestamp();
    const questions = (await fetchValue(database, 'users', user, 'questionsAnswered')) ?? [];
    if (questions.length) {
        const reduceQuestions = (key) => questions.reduce((result, { [key]: value, correct }) => {
            const [existingCorrect, total] = result.get(value) ?? [0, 0];
            return result.set(value, [
                existingCorrect + (correct === true ? 1 : 0),
                total + 1
            ]);
        }, new Collection());
        const categories = reduceQuestions('category')
            .mapValues(([correct, total]) => [correct, total, correct / total])
            .sorted(([, , a], [, , b]) => a - b);
        const bestCategory = categories.last();
        const worstCategory = categories.first();
        const categoriesMatching = ([, , percentage]) => categories
            .filter(([, , p]) => p === percentage)
            .keyArray()
            .join(', ');
        embed.addFields({
            name: 'Correct answers (total)',
            value: formatPercentage(questions.filter(({ correct }) => correct).length, questions.length),
            inline: true
        }, ...reduceQuestions('difficulty')
            .sorted((_, __, a, b) => a - b)
            .map(([correct, total], difficulty) => ({
            name: `Correct answers (${Difficulty[difficulty].toLowerCase()})`,
            value: formatPercentage(correct, total),
            inline: true
        })), {
            name: 'Best category',
            value: `${categoriesMatching(bestCategory)}: ${formatPercentage(...bestCategory)}`,
            inline: true
        }, {
            name: 'Worst category',
            value: `${categoriesMatching(worstCategory)}: ${formatPercentage(...worstCategory)}`,
            inline: true
        });
    }
    else
        embed.setDescription(`${user.tag} has not attempted any trivia questions!`);
    await message.channel.send(embed);
};
const leaderboardCommand = async (message, database) => {
    if (!message.guild) {
        await message.sendDeletableMessage({
            reply: true,
            content: 'sorry, I can’t execute that command inside DMs. Noot noot.'
        });
        return;
    }
    if (!(await checkPermissions(message, [
        'EMBED_LINKS',
        'READ_MESSAGE_HISTORY',
        'ADD_REACTIONS'
    ])))
        return;
    const usersCol = collection(database, 'users');
    const query = await triviaUsersCountQuery(message.guild);
    const totalUsers = await triviaUsersCount(usersCol, query);
    const usersCache = new Map();
    const getUsers = async (skip) => {
        const existing = usersCache.get(skip);
        if (existing)
            return existing;
        const users = await aggregateTriviaUsers(usersCol, query, skip);
        usersCache.set(skip, users);
        return users;
    };
    const generateEmbed = async (skip) => {
        const users = await getUsers(skip);
        return new MessageEmbed()
            .setTitle(`Showing users ${skip + 1}-${skip + users.length} out of ${totalUsers}`)
            .addFields(await Promise.all(users.map(async ({ _id: id, correct, total, percentage }, i) => ({
            name: `${i + skip + 1}. ${(await message.guild.members.fetch(id)).user.tag}`,
            value: formatPercentage(correct, total, percentage)
        }))));
    };
    const embedMessage = await message.channel.send(await generateEmbed(0));
    if (totalUsers <= 10)
        return;
    await embedMessage.react(emojis.right);
    let currentIndex = 0;
    const collector = embedMessage.createReactionCollector(({ emoji: { name } }, { id }) => (name === emojis.left || name === emojis.right) &&
        id === message.author.id, { idle: 60000 });
    collector.on('collect', async ({ emoji: { name } }) => {
        let shouldReact = true;
        await embedMessage.reactions.removeAll().catch(error => {
            ignoreError('MISSING_PERMISSIONS')(error);
            shouldReact = false;
        });
        currentIndex += name === emojis.left ? -10 : 10;
        await embedMessage.edit(await generateEmbed(currentIndex));
        if (shouldReact) {
            if (currentIndex)
                await embedMessage.react(emojis.left);
            if (currentIndex + 10 < totalUsers)
                await embedMessage.react(emojis.right);
        }
    });
};
const format = (answer) => typeof answer === 'boolean' ? (answer ? 'True' : 'False') : answer;
const command = {
    name: 'trivia',
    aliases: ['t'],
    description: 'Asks a trivia question.',
    cooldown: 5,
    syntax: '([s(tat(s))] [user]|l(eaderboard))',
    usage: `Using this command without any arguments will ask a trivia question.
\`s(tat(s)) [user]\`
Gets the trivia statistics for a user. If no user is specified, it will get the stats for yourself.

\`l(eaderboard)\`
Gets the leaderboard for this server.`,
    async execute(message, { input }, database) {
        const match = /^s(?:tats?)?\s*/iu.exec(input);
        if (match) {
            await statsCommand(message, input.slice(match[0].length), database);
            return;
        }
        if (/^l(?:eaderboard)?/iu.test(input)) {
            await leaderboardCommand(message, database);
            return;
        }
        const { author, channel } = message;
        if (message.guild &&
            !(await checkPermissions(message, ['EMBED_LINKS', 'ADD_REACTIONS'])))
            return;
        const question = await fetchQuestion();
        if (!question) {
            await channel.send('For some reason, no trivia questions could be fetched. Noot noot.');
            return;
        }
        const execute = async (fields, reactEmojis, getSelectedAnswer, questionPrefix = '') => {
            const msg = await channel.send(author, {
                embed: {
                    title: questionPrefix + escapeMarkdown(question.question),
                    description: 'You have 15 seconds to answer.',
                    fields: [
                        ...fields,
                        {
                            name: 'Category',
                            value: escapeMarkdown(question.category),
                            inline: true
                        },
                        {
                            name: 'Difficulty',
                            value: Difficulty[question.difficulty],
                            inline: true
                        }
                    ]
                }
            });
            for (const emoji of reactEmojis)
                await msg.react(emoji);
            const correctAnswer = format(question.correctAnswer);
            const collected = (await msg.awaitReactions(({ emoji }, { id }) => reactEmojis.includes(emoji.name) && id === author.id, { max: 1, time: 15000 })).first();
            let correct;
            if (collected) {
                const selectedAnswer = getSelectedAnswer(collected.emoji.name);
                correct = selectedAnswer === question.correctAnswer;
                await channel.send(`${author} ${correct
                    ? `${emojis.tick} Congratulations, **${correctAnswer}** was the correct answer!`
                    : `${emojis.cross} **${format(selectedAnswer)}** was incorrect. The correct answer was **${correctAnswer}**.`}`);
            }
            else {
                await channel.send(`${author} ${emojis.clock} Time’s up! The correct answer was **${correctAnswer}**.`);
            }
            await addTriviaQuestion(database, author, question, correct);
        };
        if (question.type === 1) {
            await execute([
                { name: emojis.tick, value: 'True' },
                { name: emojis.cross, value: 'False' }
            ], [emojis.tick, emojis.cross], emoji => emoji === emojis.tick, 'True or false: ');
        }
        else {
            const answers = shuffle([
                ...question.incorrectAnswers,
                question.correctAnswer
            ]);
            await execute(answers.map((a, i) => ({
                name: String.fromCharCode(i + 65),
                value: escapeMarkdown(a)
            })), emojis.letters, emoji => answers[emojis.letters.indexOf(emoji)]);
        }
    }
};
export default command;
//# sourceMappingURL=trivia.js.map