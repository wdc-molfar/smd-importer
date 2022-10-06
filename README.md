# smd-importer
Source Management Dashboard import utilities 

## Prerequesite

Node.js 14.13.1

## Install

1. Clone this repo
```sh
git clone https://github.com/wdc-molfar/smd-importer.git
```

2. Install dependencies
```sh
npm install
```

## Prepare import

Prepare import data in ```xlsx``` format such as template.txt.

**Field description:**
- ```info.name``` - Source name.
- ```info.description``` - Source description.
- ```info.labels``` - Comma separated list of hierarhical labels.
- ```scanany.script``` - Name of Scanany script.
- ```scanany params``` - Source specific parameters for Scanany script.

**Data validation rules**:
- Source name should be unique.
- Hierarhical labels hould be coresponded to [@molfar smd dashboard](https://nevada-jace-dev.herokuapp.com/design/@molfar-smd-schema).
- Name of Scanany script hould be coresponded to [@molfar smd dashboard](https://nevada-jace-dev.herokuapp.com/design/@molfar-smd-schema).
- Source specific parameters for Scanany script should be validated with Scanany specific JSON-Schema. See [@molfar smd dashboard](https://nevada-jace-dev.herokuapp.com/design/@molfar-smd-schema).

## Configuration
See import.config.yml


## Usage

```sh
npm run import <relative path to xlsx file>
```

## Synopsis

1. Importer loads source branch from [@molfar smd dashboard](https://nevada-jace-dev.herokuapp.com/design/@molfar-smd-schema).
2. Importer loads and parse data from xlsx file.
3. Importer validates data and resolves it, if it possible.
4. Importer generate xlsx file with results of validation.
5. Importer use ```extend``` merge strategy for merges source data and target @molfar smd branch.
6. Importer creates specific branch on @molfar smd dashboard and commits imported data.

You can verify imports on [@molfar smd dashboard](https://nevada-jace-dev.herokuapp.com/design/@molfar-smd-schema). 

