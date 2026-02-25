oclifLearn
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclifLearn.svg)](https://npmjs.org/package/oclifLearn)
[![Downloads/week](https://img.shields.io/npm/dw/oclifLearn.svg)](https://npmjs.org/package/oclifLearn)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g oclifLearn
$ oclifLearn COMMAND
running command...
$ oclifLearn (--version)
oclifLearn/0.0.0 win32-x64 node-v24.11.0
$ oclifLearn --help [COMMAND]
USAGE
  $ oclifLearn COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oclifLearn hello PERSON`](#ocliflearn-hello-person)
* [`oclifLearn hello world`](#ocliflearn-hello-world)
* [`oclifLearn help [COMMAND]`](#ocliflearn-help-command)
* [`oclifLearn plugins`](#ocliflearn-plugins)
* [`oclifLearn plugins add PLUGIN`](#ocliflearn-plugins-add-plugin)
* [`oclifLearn plugins:inspect PLUGIN...`](#ocliflearn-pluginsinspect-plugin)
* [`oclifLearn plugins install PLUGIN`](#ocliflearn-plugins-install-plugin)
* [`oclifLearn plugins link PATH`](#ocliflearn-plugins-link-path)
* [`oclifLearn plugins remove [PLUGIN]`](#ocliflearn-plugins-remove-plugin)
* [`oclifLearn plugins reset`](#ocliflearn-plugins-reset)
* [`oclifLearn plugins uninstall [PLUGIN]`](#ocliflearn-plugins-uninstall-plugin)
* [`oclifLearn plugins unlink [PLUGIN]`](#ocliflearn-plugins-unlink-plugin)
* [`oclifLearn plugins update`](#ocliflearn-plugins-update)

## `oclifLearn hello PERSON`

Say hello

```
USAGE
  $ oclifLearn hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oclifLearn hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/test/oclifLearn/blob/v0.0.0/src/commands/hello/index.ts)_

## `oclifLearn hello world`

Say hello world

```
USAGE
  $ oclifLearn hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oclifLearn hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/test/oclifLearn/blob/v0.0.0/src/commands/hello/world.ts)_

## `oclifLearn help [COMMAND]`

Display help for oclifLearn.

```
USAGE
  $ oclifLearn help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for oclifLearn.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.37/src/commands/help.ts)_

## `oclifLearn plugins`

List installed plugins.

```
USAGE
  $ oclifLearn plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ oclifLearn plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/index.ts)_

## `oclifLearn plugins add PLUGIN`

Installs a plugin into oclifLearn.

```
USAGE
  $ oclifLearn plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into oclifLearn.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the OCLIFLEARN_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the OCLIFLEARN_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ oclifLearn plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ oclifLearn plugins add myplugin

  Install a plugin from a github url.

    $ oclifLearn plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ oclifLearn plugins add someuser/someplugin
```

## `oclifLearn plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ oclifLearn plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ oclifLearn plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/inspect.ts)_

## `oclifLearn plugins install PLUGIN`

Installs a plugin into oclifLearn.

```
USAGE
  $ oclifLearn plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into oclifLearn.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the OCLIFLEARN_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the OCLIFLEARN_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ oclifLearn plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ oclifLearn plugins install myplugin

  Install a plugin from a github url.

    $ oclifLearn plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ oclifLearn plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/install.ts)_

## `oclifLearn plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ oclifLearn plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ oclifLearn plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/link.ts)_

## `oclifLearn plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ oclifLearn plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oclifLearn plugins unlink
  $ oclifLearn plugins remove

EXAMPLES
  $ oclifLearn plugins remove myplugin
```

## `oclifLearn plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ oclifLearn plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/reset.ts)_

## `oclifLearn plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ oclifLearn plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oclifLearn plugins unlink
  $ oclifLearn plugins remove

EXAMPLES
  $ oclifLearn plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/uninstall.ts)_

## `oclifLearn plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ oclifLearn plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oclifLearn plugins unlink
  $ oclifLearn plugins remove

EXAMPLES
  $ oclifLearn plugins unlink myplugin
```

## `oclifLearn plugins update`

Update installed plugins.

```
USAGE
  $ oclifLearn plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/update.ts)_
<!-- commandsstop -->
