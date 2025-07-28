# Meta Data Scripts

This repo uses several Nodejs scripts to maintain the meta data file
[meta.yaml](meta.yaml).

## Prerequisites

To run the script [Nodejs](https://nodejs.org/en/download) needs to be
installed. To be able to use the [pnpm](https://pnpm.io) package manager run
`corepack enable pnpm` once.

To setup your environment run the following commands on the command line once:

```sh
git clone git@github.com:dracor-org/neolatdracor.git
cd neolatdracor
pnpm install
```

## Scripts

### `pnpm run yaml`

This command compiles the meta.yaml file from the original Google spreadsheet.

### `pnpm run overview`

This command updates the overview table in the README.
