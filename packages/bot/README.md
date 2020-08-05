# Comrade Pingu

[![Build Status](https://api.travis-ci.com/cherryblossom000/comrade-pingu.svg?token=HuQX1k5oVBvh691pweEv&branch=master)](https://travis-ci.com/cherryblossom000/comrade-pingu)

*You may be looking for the [other website](http://comradepingu.glitch.me).*

A fun Discord bot created on the 3<sup>rd</sup> of March 2019 with [discord.js](https://discord.js.org). Kill all the capitalist scum!

## [Status](https://stats.uptimerobot.com/49G6NHJB7W/782979270)

| Current | 24 Hours | 7 Days | 30 Days | Response |
| - | - | - | - | - |
| ![Uptime Robot status](https://badgen.net/uptime-robot/status/m782979270-c92208f628b86c2ace8b8017) | ![Uptime Robot ratio (7 days)](https://badgen.net/uptime-robot/day/m782979270-c92208f628b86c2ace8b8017) | ![Uptime Robot ratio (7 days)](https://badgen.net/uptime-robot/week/m782979270-c92208f628b86c2ace8b8017) | ![Uptime Robot ratio (30 days)](https://badgen.net/uptime-robot/month/m782979270-c92208f628b86c2ace8b8017) | ![Uptime Robot Response time](https://badgen.net/uptime-robot/response/m782979270-c92208f628b86c2ace8b8017) |

## Inviting

To invite Comrade Pingu to your sever, you must have the Manage Server permission and then use [this link](https://discordapp.com/oauth2/authorize?client_id=554539674899841055&scope=bot&permissions=3271744).

## Prefix

Comrade Pingu’s default prefix is `.`.

## Documentation

| Command | Aliases | Description | Usage | Cooldown (s) |
| - | - | - | - | - |
| `dog` | `d`, `randomdog` | Gets a random image of a dog from random.dog. | `.dog` | 3 |
| `help` | `commands`, `h` | Lists all my commands or gets info about a specific command. | `.help [command]`<br>`command` (optional)<br>The command that you want to get info about. If omitted, all the commands will be listed. | 5 |
| `htkb` | `howtokissboy` | Gets the image that shows how to kiss a boy.<br>![how to kiss boy](./assets/img/htkb.png) | `.htkb` | 3 |
| `info` | `in` | Gets info about me. | `.info` | 3 |
| `invite` | `add`, `inv`, `link` | Gets my invite link. | `.invite` | 3 |
| `iwmelc` | `iwillmurdereverylastcapitalist` | Gets the meme that shows that ‘noot noot’ in Pingu means ‘i will murder every last capitalist’ in English.<br>![i will murder every last capitalist](./assets/img/iwmelc.jpg) | `.iwmelc` | 3 |
| `nowplaying` | `np` | Gets the song currently playing. | `.nowplaying` | 3 |
| `pause` | `pa` | Pauses the song currently playing. | `.pause` | 3 |
| `pin` | - | Pins a message. | `.pin [message]`<br>`message` (optional)<br>The ID of the message to pin. Defaults to the last message (excluding the one to execute this command) you sent in this server. | 3 |
| `ping` | `p` | Gets my current latency. | `.ping` | 5 |
| `play` | `pl` | Plays a song from YouTube. | `.play [song]\|search [query]`<br><code>[song]</code><br><code>song</code> (optional)<br>The video that you want to play. If it’s:<ul><li>a YouTube link or ID: plays the YouTube video</li><li>anything else: searches YouTube and plays the first result</li><li>omitted: resumes the music (if it’s paused) (the same as <code>resume</code>)</li></ul><code>search [query]</code><br><code>query</code><br>The query to search on YouTube for. | 3 |
| `prefix` | `pre` | Gets or sets the prefix. | `.prefix [new prefix]`<br>`new prefix` (optional)<br>The text that you want to set the prefix to. If omitted, displays the current prefix.<br>The default prefix is `.`. | 3 |
| `profile` | `pr`, `pro`, `u`, `user` | Gets information on a user. | `.profile [user]`<br>`user` (optional)<br>The user to display information about. If omitted, defaults to you.<br>You can mention the user or use their tag (for example `Username#1234`). | 3 |
| `queue` | `q` | Views the music queue. | `.queue` | 3 |
| `rejoin` | `re`, `rj` | Manages settings for what to do when a member rejoins this server. | `.rejoin [e(nable) [r(oles)\|n(ickname)\|a(ll)]]\|[d(isable)]`<br>This command has 3 subcommands.<br>`rejoin`<br>See this server’s rejoining configuration.<br><br>`rejoin e(nable) [r(oles)|n(ickname)|a(ll)]`<br>Enables adding a member’s past roles, nickname, or both of these. Defaults to `all`.<br><br>`rejoin d(isable)`<br>Stops doing anything when a member rejoins this server. | 10 |
| `resume` | `r`, `unpause` | Resumes the song currently playing. | `.resume` | 3 |
| `skip` | `sk` | Skips the current song. | `.skip` | 3 |
| `stats` | `statistics` | Gets my stats. | `.stats` | 3 |
| `stop` | `s` | Stops playing music. | `.stop` | 3 |
| `trivia` | `t` | Asks a trivia question. | `.trivia 9[s(tat(s))] [user]\|l(eaderboard))`<br>Using this command without any arguments will ask a trivia question.<br>`s(tat(s)) [user]`<br>Gets the trivia statistics for a user. If no user is specified, it will get the stats for yourself.<br><br>`l(eaderboard)`<br>Gets the leaderboard for this server. | 5 |
| `uptime` | `up` | Gets my uptime. | `.uptime` | 3 |
| `volume` | `v` | Changes or gets the volume of the music playing. | `.volume [volume]`<br><code>volume</code> (optional)<br>The new volume as a percentage to set it to. If omitted, the current volume will be shown. Can be one of the following:<ul><li><code>&lt;number&gt;[%]</code> Sets the current volume.</li><li><code>&lt;+\|-&gt;&lt;number&gt;[%]</code> Increments/decrements the volume.</li><li><code>reset</code> (or anything starting with <code>r</code>) Resets the volume to 100%.</li></ul> | 3 |
| `website` | `site`, `w`, `web` | Sends my website. | `.website` | 3 |

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

[MIT](LICENSE) © 2020 cherryblossom000

## [Changelog](CHANGELOG.md)
