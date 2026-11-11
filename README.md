# OpenPEDD

**The open framework for Product Engineering Driven Development.** The spec is the single source of
truth, and everything derived from it (code, mockups, tests, API Reference, Help Center, tasks)
knows whether it is still up to date.

> **0.1.0 · beta.** The framework is specified; there is no code to install yet. Versions follow
> [SemVer](https://semver.org): while the major is 0, any minor may change the format. See the [changelog](CHANGELOG.md).

## OpenPEDD is built with OpenPEDD

Its own spec lives in [`spec/`](spec/README.md), in the format the framework defines. That is where
to start reading, and where to propose a change: a change to OpenPEDD is a delta in `spec/changes/`,
reviewed at its gates, before any code.

| Where | What |
|---|---|
| [`spec/capabilities.md`](spec/capabilities.md) | **What the framework can do**: capabilities, procedures and tools |
| [`spec/`](spec/README.md) | The spec: problem, domain, rules, architecture, one module per stage, decisions |
| `scripts/` | The checks that run on the spec today, and the seed of the `pedd` CLI |
| `workspace.yaml` | OpenPEDD's own workspace, in `mono` mode |

## Checks

```bash
npm run check
```

## License

The framework code: Apache-2.0. The spec and the format: CC BY 4.0
([`DEC-02`](spec/decisions/DEC-02-licenses.md)). The repo stays private until the trademark is filed
([`DEC-11`](spec/decisions/DEC-11-visibility.md)).
