# danger-plugin-todo

[![Build Status](https://travis-ci.org/tychota/danger-plugin-flow.svg?branch=master)](https://travis-ci.org/tychota/danger-plugin-flow)
[![npm version](https://badge.fury.io/js/danger-plugin-flow.svg)](https://badge.fury.io/js/danger-plugin-flow)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Address your technical dept at some point

## Credits

This package is more or less a fork from `danger-plugin-fixme` from @zetaron, licensed under MIT.

## Usage

Install:

```sh
yarn add @bam.tech/danger-plugin-todo --dev
```

At a glance:

```js
// dangerfile.js
import { schedule } from "danger";
import todo from "@bam.tech/danger-plugin-todo";

schedule(todo());
```

## Changelog

See the GitHub [release history](https://github.com/tychota/taiichi/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
