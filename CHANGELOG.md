# Changelog

# [2.4.0](https://github.com/cherryblossom000/comrade-pingu/compare/v2.3.1...v2.4.0) (2020-07-28)


### Bug Fixes

* **help:** fix some invalid characters ([f848bf9](https://github.com/cherryblossom000/comrade-pingu/commit/f848bf996029199f58b0018286a7b7346e61f7f9))
* make reactions work in DMs ([59169e5](https://github.com/cherryblossom000/comrade-pingu/commit/59169e5ced54041047b5272b12a83b31baf9a471))
* **pin:** make pin command available to people with manage messages ([a31a6f0](https://github.com/cherryblossom000/comrade-pingu/commit/a31a6f049c2336be0d9b5ca64ef406a7af509845))


### Features

* add `rejoin` command ([46ed369](https://github.com/cherryblossom000/comrade-pingu/commit/46ed369b71ab08ad20d4494545f2bf90b03111ed))

## [2.3.1](https://github.com/cherryblossom000/comrade-pingu/compare/v2.3.0...v2.3.1) (2020-07-21)


### Bug Fixes

* **capitalist-scum:** trigger on melon but not on other words containing elon ([469673d](https://github.com/cherryblossom000/comrade-pingu/commit/469673d3685d5350c6569a36ab9deb3f58c11723))

# [2.3.0](https://github.com/cherryblossom000/comrade-pingu/compare/v2.2.4...v2.3.0) (2020-07-18)


### Features

* **noot-noot:** trigger on more than 2 os (e.g. `nooot noot`) ([449c3c0](https://github.com/cherryblossom000/comrade-pingu/commit/449c3c0eb6d1df766f5977fd196d4152197e684d))

## [2.2.4](https://github.com/cherryblossom000/comrade-pingu/compare/v2.2.3...v2.2.4) (2020-07-11)


### Bug Fixes

* **trivia:** fix command not working after 6 hours ([abfd62c](https://github.com/cherryblossom000/comrade-pingu/commit/abfd62c4239b021f85f424d31ed4e7b09357eaf4))

## [2.2.3](https://github.com/cherryblossom000/comrade-pingu/compare/v2.2.2...v2.2.3) (2020-07-10)


### Bug Fixes

* **trivia:** escape markdown ([a883eb9](https://github.com/cherryblossom000/comrade-pingu/commit/a883eb95ee7c04cedcdb3400aff4b652bd905630))
* **trivia:** use refresh tokens to reduce duplicate questions ([272e221](https://github.com/cherryblossom000/comrade-pingu/commit/272e221b4a314bb1ba9b7398ec0f3839dd829f11))

## [2.2.2](https://github.com/cherryblossom000/comrade-pingu/compare/v2.2.1...v2.2.2) (2020-07-09)


### Bug Fixes

* **trivia stats:** order difficulty ([2565d61](https://github.com/cherryblossom000/comrade-pingu/commit/2565d61c8fa1a6dc1b060deb7349a7408e4291db))

## [2.2.1](https://github.com/cherryblossom000/comrade-pingu/compare/v2.2.0...v2.2.1) (2020-07-09)


### Bug Fixes

* **trivia:** add 5 second cooldown ([b253fa9](https://github.com/cherryblossom000/comrade-pingu/commit/b253fa9a63b83cb27e38276e352b54a2eb9135e4))

# [2.2.0](https://github.com/cherryblossom000/comrade-pingu/compare/v2.1.0...v2.2.0) (2020-07-08)


### Features

* **profile, trivia:** add ability to look up user based on id ([6cab331](https://github.com/cherryblossom000/comrade-pingu/commit/6cab3316d357bf4962cfcc86c610d94d3fb073b8))
* add trivia command ([5522683](https://github.com/cherryblossom000/comrade-pingu/commit/552268346808c67d3faa875e8dde9456f4b7e014))


### Reverts

* **.replit:** don't install with pnpm as it does nothing ([4d5cfb8](https://github.com/cherryblossom000/comrade-pingu/commit/4d5cfb8a1dd04909e49667c027caa31e9a18e66e))

# [2.1.0](https://github.com/cherryblossom000/comrade-pingu/compare/v2.0.0...v2.1.0) (2020-07-03)


### Bug Fixes

* **help:** make sure that error sending DM is because of error 50007 ([460b47a](https://github.com/cherryblossom000/comrade-pingu/commit/460b47ab8e2b83d38ef330f0379aed7d6f42bf53))
* fix cooldowns ([39a348b](https://github.com/cherryblossom000/comrade-pingu/commit/39a348b794e3fe63ad5ca49032530505efd807f8))


### Features

* add deletable messages ([ed7090e](https://github.com/cherryblossom000/comrade-pingu/commit/ed7090ee34d7e10218e98109751f1dba3150bc1a))
* add htkb command ([8a64b95](https://github.com/cherryblossom000/comrade-pingu/commit/8a64b954eee00827e88782738f7aee4caf242a96))

# [2.0.0](https://github.com/cherryblossom000/comrade-pingu/compare/v1.3.0...v2.0.0) (2020-06-12)


### Features

* add pin command ([48e7b27](https://github.com/cherryblossom000/comrade-pingu/commit/48e7b275f77c6dbe98e9e4d93d89ea3d64c1c9ea))
* add profile command ([b56bf96](https://github.com/cherryblossom000/comrade-pingu/commit/b56bf968ec2b061ba073a03569c9fdd1e9da27e4))


### improvement

* use 'u' for the profile command and change `uptime`'s alias to 'up' ([9e2e7a3](https://github.com/cherryblossom000/comrade-pingu/commit/9e2e7a3e9acf3edf63ad7e10b6792b5d52566f08))


### BREAKING CHANGES

* u' can no longer be used for the `uptime` command; it is now an alias for
`profile`.

# [1.3.0](https://github.com/cherryblossom000/comrade-pingu/compare/v1.2.1...v1.3.0) (2020-03-28)


### Bug Fixes

* fix a bunch of permissions issues ([8951096](https://github.com/cherryblossom000/comrade-pingu/commit/8951096f3745eef0aa36431420368175c3273ba4))


### Features

* add music support ([247d3b3](https://github.com/cherryblossom000/comrade-pingu/commit/247d3b34874fd5ca95c0f9ddacf4a71ede6e1755))

## [1.2.1](https://github.com/cherryblossom000/comrade-pingu/compare/v1.2.0...v1.2.1) (2020-03-23)


### Bug Fixes

* **help:** fix help for a single command including undefined in the usage ([c3ca7e2](https://github.com/cherryblossom000/comrade-pingu/commit/c3ca7e262e535105e208771f9c93cbb8db02aa27))
* **iwmelc:** fix command not working ([5391e3f](https://github.com/cherryblossom000/comrade-pingu/commit/5391e3f164c36133c0b3a66191772256d9c54ad4))

# [1.2.0](https://github.com/cherryblossom000/comrade-pingu/compare/v1.1.1...v1.2.0) (2020-03-22)


### Bug Fixes

* **invite:** fix command not working ([f51e2f2](https://github.com/cherryblossom000/comrade-pingu/commit/f51e2f29c8372e17431609641e6bf0a79ccf36a8))


### Features

* add prefix command ([7e628db](https://github.com/cherryblossom000/comrade-pingu/commit/7e628db9e013efab79db92d0239cf60896d2964a))


### Performance Improvements

* stop loading dotenv on prod ([226b216](https://github.com/cherryblossom000/comrade-pingu/commit/226b2160275678ef3975dcd144c9574b50a93bef))

## [1.1.1](https://github.com/cherryblossom000/comrade-pingu/compare/v1.1.0...v1.1.1) (2020-03-17)


### Bug Fixes

* **angry noot noot:** fix it not triggering sometimes ([2c2cace](https://github.com/cherryblossom000/comrade-pingu/commit/2c2cace75ebc31a8b9e9fcb11d9e60585495a520))

# [1.1.0](https://github.com/cherryblossom000/comrade-pingu/compare/v1.0.3...v1.1.0) (2020-03-12)


### Features

* add website command ([ce88e15](https://github.com/cherryblossom000/comrade-pingu/commit/ce88e1586703d8fd0db74dff5feba7a9b574fb51))

## [1.0.3](https://github.com/cherryblossom000/comrade-pingu/compare/v1.0.2...v1.0.3) (2020-03-04)


### Bug Fixes

* **iwmelc:** fix command failing ([f2afc36](https://github.com/cherryblossom000/comrade-pingu/commit/f2afc36beb5b722ff98a165b8d26619a81fbbc56))
* **mention:** fix incorrect regex ([6adf043](https://github.com/cherryblossom000/comrade-pingu/commit/6adf043a12ef6a65778b05b9c4218e78c1b60c50))

## [1.0.2](https://github.com/cherryblossom000/comrade-pingu/compare/v1.0.1...v1.0.2) (2020-03-03)


### Performance Improvements

* upgrade discord.js to 12.0.1 ([db8e913](https://github.com/cherryblossom000/comrade-pingu/commit/db8e913e2db8d4702b30005604675ed0336490cc))

## [1.0.1](https://github.com/cherryblossom000/comrade-pingu/compare/v1.0.0...v1.0.1) (2020-03-02)


### Bug Fixes

* **iwmelc:** fix image not showing ([58dc4df](https://github.com/cherryblossom000/comrade-pingu/commit/58dc4df101e240e8917a754bdbc08c2b9f7ec8aa))


# 1.0.0 (2019-03-16)


## Features

* **commands:** add `help`, `info`, `invite`, `iwmelc`, `ping`, `stats`, and `uptime`
* **triggers:** add capitalist scum and noot noot ([794018b](https://github.com/cherryblossom000/comrade-pingu/commit/794018b5a9c755a89cbfd60dd95a8289d295bb50))
