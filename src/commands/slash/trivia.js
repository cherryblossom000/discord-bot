import { SlashCommandBuilder, bold } from '@discordjs/builders';
import { Collection, MessageActionRow, MessageButton, MessageEmbed, Util } from 'discord.js';
import { dev, emojis } from '../../constants.js';
import { addTriviaQuestion, aggregateTriviaUsers, collection, fetchValue, triviaUsersCount, triviaUsersCountQuery } from '../../database.js';
import { Difficulty, fetchQuestion } from '../../opentdb.js';
import { checkPermissions, handleError, fetchGuild, replyAndFetch, replyDeletable, shuffle } from '../../utils.js';
const TRUE = 'true';
const FALSE = 'false';
const booleanButtons = [
    new MessageButton({
        style: 'SUCCESS',
        customId: TRUE,
        label: 'True',
        emoji: emojis.tick
    }),
    new MessageButton({
        style: 'DANGER',
        customId: FALSE,
        label: 'False',
        emoji: emojis.cross
    })
];
const BACK = 'back';
const FORWARD = 'forward';
const backButton = new MessageButton({
    style: 'SECONDARY',
    label: 'Back',
    emoji: emojis.left,
    customId: BACK
});
const forwardButton = new MessageButton({
    style: 'SECONDARY',
    label: 'Forward',
    emoji: emojis.right,
    customId: FORWARD
});
const format = (answer) => typeof answer === 'boolean' ? (answer ? 'True' : 'False') : answer;
const play = async (interaction, database) => {
    const { client, user } = interaction;
    if (!(await checkPermissions(interaction, ['EMBED_LINKS', 'ADD_REACTIONS'])))
        return;
    const question = await fetchQuestion();
    if (!question) {
        await interaction.reply('For some reason, no trivia questions could be fetched. Please report this to my owner. Noot noot.');
        return;
    }
    const execute = async (buttons, { getSelectedAnswer = (x) => x, questionPrefix = '' } = {}) => {
        const message = await replyAndFetch(interaction, {
            embeds: [
                {
                    title: questionPrefix + Util.escapeMarkdown(question.question),
                    description: 'You have 15 seconds to answer.',
                    fields: [
                        {
                            name: 'Category',
                            value: Util.escapeMarkdown(question.category),
                            inline: true
                        },
                        {
                            name: 'Difficulty',
                            value: Difficulty[question.difficulty],
                            inline: true
                        }
                    ]
                }
            ],
            components: [new MessageActionRow({ components: [...buttons] })]
        });
        const correctAnswer = format(question.correctAnswer);
        if (dev)
            await interaction.followUp(correctAnswer);
        const collector = message.createMessageComponentCollector({ time: 15000 });
        collector
            .on('collect', async (buttonInteraction) => {
            try {
                if (buttonInteraction.user.id !== user.id) {
                    await buttonInteraction.reply({
                        content: `This is ${user}’s question! Noot noot.`,
                        ephemeral: true
                    });
                    return;
                }
                collector.stop();
                const selectedAnswer = getSelectedAnswer(buttonInteraction.customId);
                const correct = selectedAnswer === question.correctAnswer;
                await buttonInteraction.reply(correct
                    ? `${emojis.tick} Congratulations, ${bold(correctAnswer)} was the correct answer!`
                    : `${emojis.cross} ${bold(format(selectedAnswer))} was incorrect. The correct answer was ${bold(correctAnswer)}.`);
                await addTriviaQuestion(database, user.id, question, correct);
            }
            catch (error) {
                handleError(client, error, 'trivia play: collect collector event', {
                    to: interaction
                });
            }
        })
            .on('end', async (_, reason) => {
            try {
                if (reason === 'time') {
                    await interaction.followUp(`${emojis.clock} Time’s up! The correct answer was ${bold(correctAnswer)}.`);
                    await addTriviaQuestion(database, user.id, question, undefined);
                }
            }
            catch (error) {
                handleError(client, error, 'trivia play: end collector event', {
                    to: interaction
                });
            }
        });
    };
    if (question.type === 1) {
        await execute(booleanButtons, {
            getSelectedAnswer: customId => customId === TRUE,
            questionPrefix: 'True or false: '
        });
    }
    else {
        const answers = shuffle([
            ...question.incorrectAnswers,
            question.correctAnswer
        ]);
        await execute(answers.map(answer => new MessageButton({
            style: 'SECONDARY',
            customId: answer,
            label: Util.escapeMarkdown(answer)
        })));
    }
};
const formatPercentage = (numerator, denominator, percentage = numerator / denominator) => `${numerator}/${denominator} (${(percentage * 100).toFixed(2)}%)`;
const stats = async (interaction, user, database) => {
    if (!(await checkPermissions(interaction, 'EMBED_LINKS')))
        return;
    const embed = new MessageEmbed()
        .setTitle(user.tag)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
    })
        .setTimestamp();
    const questions = (await fetchValue(database, 'users', user.id, 'questionsAnswered')) ?? [];
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
        const categoriesMatching = ([, , percentage]) => [...categories.filter(([, , p]) => p === percentage).keys()].join(', ');
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
    await interaction.reply({ embeds: [embed] });
};
const leaderboard = async (interaction, database) => {
    if (!interaction.inGuild()) {
        await replyDeletable(interaction, 'sorry, I can’t execute that command inside DMs. Noot noot.');
        return;
    }
    if (!(await checkPermissions(interaction, [
        'EMBED_LINKS',
        'READ_MESSAGE_HISTORY',
        'ADD_REACTIONS'
    ])))
        return;
    const guild = await fetchGuild(interaction);
    const usersCol = collection(database, 'users');
    const query = await triviaUsersCountQuery(guild);
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
    const generateEmbed = async (start) => {
        const users = await getUsers(start);
        return new MessageEmbed()
            .setTitle(`Showing users ${start + 1}-${start + users.length} out of ${totalUsers}`)
            .addFields(await Promise.all(users.map(async ({ _id: id, correct, total, percentage }, i) => ({
            name: `${i + start + 1}. ${(await guild.members.fetch(id)).user.tag}`,
            value: formatPercentage(correct, total, percentage)
        }))));
    };
    const canFitOnOnePage = totalUsers <= 10;
    const embedMessage = await replyAndFetch(interaction, {
        embeds: [await generateEmbed(0)],
        components: canFitOnOnePage
            ? []
            : [new MessageActionRow({ components: [forwardButton] })]
    });
    if (canFitOnOnePage)
        return;
    const collector = embedMessage.createMessageComponentCollector();
    let currentIndex = 0;
    collector.on('collect', async (buttonInteraction) => {
        try {
            if (buttonInteraction.user.id !== interaction.user.id) {
                await buttonInteraction.reply({
                    content: `Only ${interaction.user} can do this! Noot noot.`,
                    ephemeral: true
                });
                return;
            }
            buttonInteraction.customId === BACK
                ? (currentIndex -= 10)
                : (currentIndex += 10);
            await buttonInteraction.update({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                    new MessageActionRow({
                        components: [
                            ...(currentIndex ? [backButton] : []),
                            ...(currentIndex + 10 < totalUsers ? [forwardButton] : [])
                        ]
                    })
                ]
            });
        }
        catch (error) {
            handleError(interaction.client, error, 'trivia leaderboard: collect collector event', { to: interaction });
        }
    });
};
const PLAY = 'play';
const STATS = 'stats';
const USER = 'user';
const LEADERBOARD = 'leaderboard';
const command = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Trivia from https://opentdb.com!')
        .addSubcommand(subcommand => subcommand.setName(PLAY).setDescription('Ask a trivia question.'))
        .addSubcommand(subcommand => subcommand
        .setName(STATS)
        .setDescription('Gets the trivia statistics for a user.')
        .addUserOption(option => option
        .setName(USER)
        .setDescription('The user to get the stats for, defaulting to yourself.')))
        .addSubcommand(subcommand => subcommand
        .setName(LEADERBOARD)
        .setDescription('Gets the trivia leaderboard for this server.')),
    async execute(interaction, database) {
        switch (interaction.options.getSubcommand(true)) {
            case PLAY:
                await play(interaction, database);
                break;
            case STATS:
                await stats(interaction, interaction.options.getUser(USER) ?? interaction.user, database);
                break;
            case LEADERBOARD:
                await leaderboard(interaction, database);
        }
    }
};
export default command;
//# sourceMappingURL=trivia.js.map