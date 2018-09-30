aws-profile-cli
==========

Switch between AWS profiles. Companion CLI to [aws-profile-utils](https://www.npmjs.com/package/aws-profile-utils)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/awsprofile.svg)](https://npmjs.org/package/awsprofile)
[![Downloads/week](https://img.shields.io/npm/dw/awsprofile.svg)](https://npmjs.org/package/awsprofile)
[![License](https://img.shields.io/npm/l/awsprofile.svg)](https://github.com/DavidWells/awsprofile/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g aws-profile-cli
$ awss COMMAND
running command...
$ awss (-v|--version|version)
aws-profile-cli/0.0.0 darwin-x64 node-v10.4.1
$ awss --help [COMMAND]
USAGE
  $ awss COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`awss help [COMMAND]`](#awss-help-command)
* [`awss switch`](#awss-switch)
* [`awss whoami`](#awss-whoami)

## `awss help [COMMAND]`

display help for awss

```
USAGE
  $ awss help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.2/src/commands/help.ts)_

## `awss switch`

Switch AWS profiles

```
USAGE
  $ awss switch
```

_See code: [src/commands/switch.js](https://github.com/DavidWells/aws-profile-utils/blob/v0.0.0/src/commands/switch.js)_

## `awss whoami`

See your current profile name

```
USAGE
  $ awss whoami
```

_See code: [src/commands/whoami.js](https://github.com/DavidWells/aws-profile-utils/blob/v0.0.0/src/commands/whoami.js)_
<!-- commandsstop -->
