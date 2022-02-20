# Comrade Pingu

![CI](https://github.com/cherryblossom000/comrade-pingu/workflows/CI/badge.svg)

*You may be looking for the [other website](http://comradepingu.glitch.me) (not
created by me).*

<!-- markdownlint-disable MD033 -->
A fun Discord bot created on the 3<sup>rd</sup> of March 2019 with
[discord.js](https://discord.js.org). Kill all the capitalist scum!
<!-- markdownlint-enable MD033 -->
## Inviting

To invite Comrade Pingu to your sever, you must have the Manage Server
permission and then use
[this link](https://discord.com/oauth2/authorize?client_id=554539674899841055&scope=applications.commands+bot&permissions=52224).

## Prefix

Comrade Pingu’s default prefix is `.`.

## Documentation

<!-- markdownlint-disable MD033 -->
<!-- DOCS START -->

| Command | Description | Usage |
| - | - | - |
| `calculate` | Calculates a maths expression. | `/calculate <expression: string>`<br>`expression`: The expression to calculate.<br><br>See [the mathjs docs](https://mathjs.org/docs/expressions/syntax.html) for more information on the syntax of `expression`. |
| `colour` | Change your colour (using a role). | `/colour enable`: Enable allowing users to change their colour.<br><br>`/colour disable`: Disable allowing users to change their colour.<br><br>`/colour set <colour: string>`: Set your colour.<br>`colour`: The colour, e.g. ‘#abcdef’ or ‘red’. Run the command for more info.<br><br>`/colour remove`: Remove your colour. |
| `dog` | Gets a random image of a dog from random.dog. | `/dog` |
| `emoji` | Gets the image for an emoji. | `/emoji <emoji: string>`<br>`emoji`: The emoji to get the image of. |
| `help` | Lists all my commands or gets info about a specific command. | `/help [command: calculate\|colour\|dog\|emoji\|eval\|icon\|info\|invite\|maths\|meme\|ping\|profile\|rejoin\|rotate\|server\|stats\|timezone\|trivia\|uptime\|website]`<br>`command`: The command that you want to get info about. If omitted, all the commands will be listed. |
| `icon` | Gets the server icon. | `/icon` |
| `info` | Gets info about me. | `/info` |
| `invite` | Gets my invite link. | `/invite` |
| `maths` | Convert LaTeX into an image. | `/maths <latex: string>`<br>`latex`: The LaTeX to convert.<br><br>See [the MathJax docs](http://docs.mathjax.org/en/latest/input/tex/macros/index.html) for supported tags. `ams` is the only package loaded. |
| `meme` | Gets a Pingu-related meme. | `/meme <meme: I will murder every last capitalist\|how to kiss boy>`<br>`meme`: The meme to get.<br><br>![I will murder every last capitalist](./assets/img/iwmelc.jpg)<br><img src="./assets/img/htkb.jpg" alt="how to kiss boy" width="320"> |
| `ping` | Gets my current latency. | `/ping` |
| `profile` | Gets information on a user. | `/profile [user: user]`<br>`user`: The user to display information about. Defaults to you. |
| `rejoin` | Manages settings for what to do when a member rejoins this server. | `/rejoin status`: Get this server’s rejoining configuration.<br><br>`/rejoin set <mode: roles\|nickname\|both>`: Configure what I do when a member rejoins the server.<br>`mode`: What to restore when a member rejoins the server.<br><br>`/rejoin disable`: Stops doing anything when a member rejoins this server. |
| `rotate` | Rotates an image. | `/rotate <angle: number> [attachment: integer]`<br>`angle`: The angle in degrees to rotate the image clockwise. Negative values work as well!<br>`attachment`: The index of the attachment/image you want to rotate. Defaults to 1 (the first image).<br><br>Use Rotate Image after right-clicking on a message with the image you want to rotate, and then use this command. Negative angles rotate the image counterclockwise. |
| `server` | Gets information on this server. | `/server` |
| `stats` | Gets my stats. | `/stats` |
| `timezone` | Manages time zone preferences for commands such as `profile` that show times. | `/timezone [timezone: string]`<br>`timezone`: An IANA time zone. Spaces will be automatically converted into underscores.<br><br>See [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for a list of timezones. |
| `trivia` | Trivia from https://opentdb.com! | `/trivia play`: Ask a trivia question.<br><br>`/trivia stats [user: user]`: Gets the trivia statistics for a user.<br>`user`: The user to get the stats for, defaulting to yourself.<br><br>`/trivia leaderboard`: Gets the trivia leaderboard for this server. |
| `uptime` | Gets my uptime. | `/uptime` |
| `website` | Sends my website. | `/website` |

<!-- DOCS END -->
<!-- markdownlint-enable MD033 -->

## Links

### Pingu

- [“*Pingu*” on Wikipedia](https://en.wikipedia.org/wiki/Pingu)
- [Pingu Fandom](https://pingu.fandom.com/wiki/Pingu_Wiki)
- [r/pingu](https://www.reddit.com/r/pingu)
- [“Communist Pingu” on Know Your Meme](https://knowyourmeme.com/memes/communist-pingu)
- [“pingu” on Urban Dictionary](https://www.urbandictionary.com/define.php?term=pingu)
- [“Noot Noot” on Urban Dictionary](https://www.urbandictionary.com/define.php?term=Noot%20Noot)

### Communism

- [“Communism” on Wikipedia](https://en.wikipedia.org/wiki/Communism)
- [r/communism](https://www.reddit.com/r/communism)
- [r/FULLCOMMUNISM](https://www.reddit.com/r/FULLCOMMUNISM)
- [r/communism101](https://www.reddit.com/r/communism101)
- [r/CommunismMemes](https://www.reddit.con/r/CommunismMemes)
- [“Why I’m a communist—and why you should be, too” by Helen Razer on Quartz](https://qz.com/965740/why-im-a-communist-and-why-you-should-be-too)

### Other

- [“Anti-capitalism” on Wikipedia](https://en.wikipedia.org/wiki/Anti-capitalism)
- [“What is the difference between Communism and Socialism?” by David Floyd on Investopedia](https://www.investopedia.com/ask/answers/100214/what-difference-between-communism-and-socialism.asp)

## License

[MIT](LICENSE) © 2019–2021 cherryblossom000

## [Changelog](CHANGELOG.md)
