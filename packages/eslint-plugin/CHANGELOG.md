# Changelog

# [3.0.0](https://github.com/cherryblossom000/comrade-pingu/compare/@comrade-pingu/eslint-plugin@2.0.0...@comrade-pingu/eslint-plugin@3.0.0) (2022-02-20)


### Features

* **bot:** add ‘Pin Message’ command ([1dc88f7](https://github.com/cherryblossom000/comrade-pingu/commit/1dc88f7f6aeba11f32b36fa708ee922a052a3c0d))
* **bot:** add colour command ([aaf6c5d](https://github.com/cherryblossom000/comrade-pingu/commit/aaf6c5d0c2fce33d5cc7e0fce8c3de59ccb79cfe))


* feat(eslint-plugin)!: support context menu commands ([d2976ed](https://github.com/cherryblossom000/comrade-pingu/commit/d2976ed98d29710f258c72b7c2ed6a78bbc809ad))


### Bug Fixes

* **bot/eval:** fix bot error when output exceeds 2000 chars ([fb44e62](https://github.com/cherryblossom000/comrade-pingu/commit/fb44e628c81797228e5cfd47681345c3b2643d85))
* **bot/meme:** fix command ([4e7de1e](https://github.com/cherryblossom000/comrade-pingu/commit/4e7de1e155f60f0aa4a56596e707f49fab1efaf5))
* **bot/rejoin:** fix admin check ([d3d515d](https://github.com/cherryblossom000/comrade-pingu/commit/d3d515df75d5617f8899bf5bd731d9348076e395))
* **bot/rejoin:** fix bot being unable to add roles when member rejoins server ([ba1974a](https://github.com/cherryblossom000/comrade-pingu/commit/ba1974a7b295d012eef7bb52b3073c7b2e8ee9ed))
* **bot/rotate:** delete entry from rotateAttachments after rotating ([579932f](https://github.com/cherryblossom000/comrade-pingu/commit/579932f0db0888bceb10993610d417759d84c9c0))
* **bot/trivia:** remove unnecessary mentions ([4698ebd](https://github.com/cherryblossom000/comrade-pingu/commit/4698ebd1bfcdae523ed65f7e90eb3bd81c4cb8ed))


### BREAKING CHANGES

* Remove `correct-context-menu-command-type` and update
recommended config.

# [2.0.0](https://github.com/cherryblossom000/comrade-pingu/compare/@comrade-pingu/eslint-plugin@1.1.1...@comrade-pingu/eslint-plugin@2.0.0) (2021-09-20)


* feat(eslint-plugin)!: update for refactor ([325710a](https://github.com/cherryblossom000/comrade-pingu/commit/325710ae58dcac678dd4194ef8b3245037d82291))
* feat(bot)!: use slash commands and context menus ([acba424](https://github.com/cherryblossom000/comrade-pingu/commit/acba42432620d59e4a2aab24853b71564b7332bd))
* feat(eslint-plugin)!: add `default-export-name` rule ([fdc107d](https://github.com/cherryblossom000/comrade-pingu/commit/fdc107d1838b685d2742efe2715db9e5052dbd05))
* fix(bot)!: remove pin command ([f9cfaae](https://github.com/cherryblossom000/comrade-pingu/commit/f9cfaae2f0931f9a92f8b9e36d73b8915f5d53e4))


### Bug Fixes

* **bot:** fix error handler for main function ([525cef4](https://github.com/cherryblossom000/comrade-pingu/commit/525cef4bd5b7c553f06565377336df1a5af09a1c))
* **bot:** fix typo in `info` command ([04042d7](https://github.com/cherryblossom000/comrade-pingu/commit/04042d7cf8ded53c087a0c65e90953d493132ccf))
* **bot:** trigger on 'soviets' ([72e357e](https://github.com/cherryblossom000/comrade-pingu/commit/72e357e8bef686a30b44ebb3829baa2cf761abfe))
* **bot/calculate:** fix error if input is empty ([4b70389](https://github.com/cherryblossom000/comrade-pingu/commit/4b7038955d5d894d177265952dff6231895dba7c))
* **bot/profile:** use correct grammar for competing status ([e13c0fe](https://github.com/cherryblossom000/comrade-pingu/commit/e13c0fe2fe74c58f277f4f3ba1c51e5a2bce30ef))
* **commitlint-plugin:** properly detect breaking changes in the footer ([d38421d](https://github.com/cherryblossom000/comrade-pingu/commit/d38421dc4a855caf918f3319f0950a6ddd13b0ce))


### Features

* **url-shim:** add `URL` type to global scope ([8ce2e80](https://github.com/cherryblossom000/comrade-pingu/commit/8ce2e800b9d62e4ecf9a1ba1d205b1ecd7efa46e))
* force initial release for url-shim ([5c441a1](https://github.com/cherryblossom000/comrade-pingu/commit/5c441a1fdc019577eb40a3c80f4776c18851bfea))
* url package ([522e3cc](https://github.com/cherryblossom000/comrade-pingu/commit/522e3cca7f899c44913cfd73b540f4636984e6a6))
* **bot:** add rotate command ([597acbf](https://github.com/cherryblossom000/comrade-pingu/commit/597acbf1a2fcca7a93b01e8694a79e0ffc7895b3))
* **bot/capitalist-scum:** trigger on `bourgeois` ([f145266](https://github.com/cherryblossom000/comrade-pingu/commit/f145266f66a15116492d491ad9b2427414b5d5d0))
* **bot/emoji:** add support for emojis outside of the server ([e23e085](https://github.com/cherryblossom000/comrade-pingu/commit/e23e0853e87c5400c9b5cb8f7f77407dcbed7a8e))
* **bot/profile:** improve quality of avatar URL ([f36fd8d](https://github.com/cherryblossom000/comrade-pingu/commit/f36fd8d4c7877b5c02d8094bf102cc551f9d8d91))
* add icon and server commands ([214c0e7](https://github.com/cherryblossom000/comrade-pingu/commit/214c0e768bafa739ca1d18a9573b8e7bd86864ee))


### Reverts

* revert 'chore(package.json): remove unnecessary `run`' ([74a5f63](https://github.com/cherryblossom000/comrade-pingu/commit/74a5f633ac1785152306063b350dd053d0e71567))


### BREAKING CHANGES

* `correct-command-type` has been removed.
* The old way of using commands is no longer supported, so the `prefix` command has
been removed. The `hktb` and `iwmelc` commands have also been merged into a single `meme` command.
* The `command-export-name` and `event-export-name` rules have been removed.
* The `pin` command has been removed.

## [1.1.1](https://github.com/cherryblossom000/comrade-pingu/compare/@comrade-pingu/eslint-plugin@1.1.0...@comrade-pingu/eslint-plugin@1.1.1) (2021-01-17)


### Bug Fixes

* **eslint-plugin:** fix TS error ([bf2db85](https://github.com/cherryblossom000/comrade-pingu/commit/bf2db85e9d0fdc1c5e72b076cc31075344b5b56a))

# [1.1.0](https://github.com/cherryblossom000/comrade-pingu/compare/@comrade-pingu/eslint-plugin@1.0.1...@comrade-pingu/eslint-plugin@1.1.0) (2020-10-24)


### Features

* **eslint-plugin:** add `correct-regex-command-type` rule ([d91afb9](https://github.com/cherryblossom000/comrade-pingu/commit/d91afb9de58066f19da6f6bc38e40028ad0949c2))
* **eslint-plugin/*-export-name:** report no default export ([0c4a54f](https://github.com/cherryblossom000/comrade-pingu/commit/0c4a54f512ccf257e2dc6defc5ab8f12e79a5db7))

## [1.0.1](https://github.com/cherryblossom000/comrade-pingu/compare/@comrade-pingu/eslint-plugin@1.0.0...@comrade-pingu/eslint-plugin@1.0.1) (2020-08-07)


### Bug Fixes

* **command-export-name:** fix error message ([3f31288](https://github.com/cherryblossom000/comrade-pingu/commit/3f312882f7547547fe0674a144193fdd0810fdc9))

# 1.0.0 (2020-08-04)


### Features

* initial commit ([f74f7a6](https://github.com/cherryblossom000/comrade-pingu/commit/f74f7a6884473a66116374502e5b52195d74451a))
