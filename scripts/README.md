# Meta Data Scripts

This directory contains Nodejs scripts to handle the meta data from
[meta.yaml](meta.yaml).

## Prerequisites

To run the scripts [Nodejs](https://nodejs.org/en/download) and the
[pnpm](https://pnpm.io) package manager need to be installed. You can install
pnpm with `brew install pnpm` on macOS, `winget install -e --id pnpm.pnpm` on
Windows, or `npm install -g pnpm` on any system with Nodejs.

To setup your environment run the following commands on the command line once:

```sh
git clone git@github.com:dracor-org/neolatdracor.git
cd neolatdracor
pnpm install
```

## Scripts

### `pnpm run overview`

This command updates the overview table in the README.

### `pnpm run check-filenames`

This command checks that every file in the `tei/` and `docx/` directories is
named after the `name` of an entry in [meta.yaml](../meta.yaml). It requires
[yq](https://github.com/mikefarah/yq) to be installed. The same check runs as a
GitHub workflow when `meta.yaml` or files in `tei/` or `docx/` change. Files
listed in [check-filenames.ignore](check-filenames.ignore) are skipped.
