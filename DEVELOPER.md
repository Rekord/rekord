# Building and Testing Neurosync

This document describes how to set up your development environment to build and test Neurosync. It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Build commands](#build-commands)
* [Running Tests Locally](#running-tests-locally)
* [Project Information](#project-information)

See the [contribution guidelines](https://github.com/ClickerMonkey/neurosync/blob/master/CONTRIBUTING.md)
if you'd like to contribute to Neurosync.

## Prerequisite Software

Before you can build and test Neurosync, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=4.2.1 <6`) which is used to run tests and generate distributable files. We also use Node's Package Manager, `npm`
  (version `>=3.3.8 <4.0`), which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.

## Getting the Sources

Fork and clone the Neurosync repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [main Neurosync
   repository](https://github.com/ClickerMonkey/neurosync).
3. Clone your fork of the Neurosync repository and define an `upstream` remote pointing back to
   the Neurosync repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone git@github.com:<github username>/neurosync.git

# Go to the Neurosync directory:
cd neurosync

# Add the main Neurosync repository as an upstream remote to your repository:
git remote add upstream https://github.com/ClickerMonkey/neurosync.git
```

## Installing NPM Modules

Next, install the JavaScript modules needed to build and test Neurosync:

```shell
# Install Neurosync project dependencies (package.json)
npm install
```

## Build commands

To build Neurosync and prepare tests, run:

```shell
gulp build
```

Notes:
* Results are put in the `build` folder.

To clean out the `build` folder, run:

```shell
gulp clean
```

## Running Tests Locally

Test are written using QUnit. You can run just the unit tests as follows:

```shell
gulp test
```

## Project Information

### Folder structure

* `src/*`: contains all Neurosync source files.
* `build/*`: build files are placed here.
* `examples/*`: example applications exist here.
* `test/*`: unit tests exist here.
