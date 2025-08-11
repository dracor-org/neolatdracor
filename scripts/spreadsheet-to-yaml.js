import { existsSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'yaml'

import names from '../names.json' with { type: "json" };

const csvUrl = 'https://docs.google.com/spreadsheets/d/1vfiCh3OvE1qx2YDiWuxeTrUpix25XyFvagms36MHADw/export?format=csv&gid=0'
const csvFile = 'meta.csv';

function print(text) {
  text = text.replace(/\s+$/, '');
  if (
    text === '' || text === '/'
    || text.match(/IF APPLICABLE/)
  ) {
    return null;
  }
  return text;
}

async function download() {
  try {
    const response = await fetch(csvUrl, { method: 'GET' });
    if (response.status !== 200) {
      console.log(response.status);
      return;
    }
    const data = await response.text();
    writeFileSync(csvFile, data)
  } catch (error) {
    console.log(error);
  }
}

if (!existsSync(csvFile)) {
  console.log('Downloading Google spreadsheet...');
  await download();
}

const input = readFileSync(csvFile, 'utf8');
const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
}).filter(r => r['Include into overview'] === 'yes');

const ids = [];
const data = [];

records.forEach(r => {
  const id = r['DraCor ID'];
  if (id !== '' && ids.indexOf(id) >= 0) {
    console.warn(`Duplicate id: ${id}`);
  } else if (id !== '') {
    ids.push(id)
  }

  const includeDocx = r['Include Word file into repo'] === 'yes';
  let _docxName;
  if (r['Include Word file into repo'] === 'yes') {
    _docxName = r['URL of digital source'].replace(
      'https://github.com/HuygensING/translatin/blob/main/datasource/transcriptions/docx/',
      ''
    );
  }

  const status = print(r.Status);

  const sources = [];

  const manuscript = {
    title: print(r['Source manuscript']) || undefined,
    date: print(r['Manuscript date']) || undefined,
    copyright: print(r['Copyright of manuscript']) || undefined,
    url: print(r['URL of manuscript']) || undefined,
    type: 'manuscript',
  }
  if (manuscript.title || manuscript.url) {
    sources.push(manuscript);
  }

  const sourceTextEdition = {
    title: print(r['Source text edition']),
    editor: print(r['Editor of source text edition']) || undefined,
    year: print(r['Publication date of source text edition']) || undefined,
    copyright: print(r['Copyright of source text edition']) || undefined,
    url: print(r['URL of source text edition']) || undefined,
    type: 'print',
  };
  if (sourceTextEdition.title || sourceTextEdition.url) {
    sources.push(sourceTextEdition);
  }

  const criticalEdition = {
    title: print(r['Source critical edition']),
    editor: print(r['Editor of source critical edition']) || undefined,
    year: print(r['Publication date of source critical edition']) || undefined,
    copyright: print(r['Copyright of source critical edition']) || undefined,
    url: print(r['URL of critical edition']) || undefined,
    type: 'critical edition',
  };
  if (criticalEdition.title || criticalEdition.url) {
    sources.push(criticalEdition);
  }

  const digitalSource = {
    title: print(r['Digital source']) || undefined,
    editor: print(r['Editor of digital source']) || undefined,
    copyright: print(r['Copyright of digital source']) || undefined,
    url: print(r['URL of digital source']) || undefined,
  };
  if (includeDocx || digitalSource.url?.endsWith('.docx')) {
    digitalSource.type = 'DOCX';
  } else if (
    status === 'text' || ['neolat000001', 'neolat000005'].includes(id)
  ) {
    digitalSource.type = 'TXT';
  } else if (status === '.pdf') {
    digitalSource.type = 'PDF';
  }
  if (digitalSource.title || digitalSource.url) {
    sources.push(digitalSource);
  }
  // add this as an example for Theatrum Neolatinum PDF URLs
  if (id === 'neolat000037' && !digitalSource.url) {
    digitalSource.url = 'https://www.theatrum-neolatinum.cz/pdf/pallas/Amicitia/Amicitia_text.pdf'
  }

  const source = sources.reduce((acc, source) => {
    if (acc) {
      source.source = acc;
    }
    return source;
  }, null);


  const authors = [];

  if (r['Author surname'] === 'Joannes Leberius; Georgius Floriantschitsch') {
    authors.push(
      { forename: 'Joannes', surname: 'Leberius' },
      { forename: 'Georgius', surname: 'Floriantschitsch' },
    )
  } else {
    const author = {};
    if (r['Author surname'] === 'Anonymus') {
      author.name = 'Anonymus'
    } else {
      author.forename = r['Author forename'].trim();
      author.surname = r['Author surname'].trim();
      author.qid = r['Author Wikidata ID'].match(/^Q/)
        ? r['Author Wikidata ID'].trim()
        : null;
      if (r['Author GND'].match(/^Q/)) author.gnd = r['Author GND'].trim();
    }
    authors.push(author);
  }

  const transcription = {
    by: print(r['Transcribed by']),
    supervisor: print(r['Transcribed under the supervision of']),
    software: print(r['Transcription software']) || undefined,
  };

  const funding = {
    organization: print(r['Funding organisation or institution']),
    line: print(r['Funding line']),
  };

  const entry = {
    id,
    name: names[id],
    title: r['Work main title'].trim(),
    subtitle: print(r['Work subtitle']) || undefined,
    qid: r['Work Wikidata ID'].match(/^Q/)
      ? r['Work Wikidata ID'].trim()
      : null,
    authors,
    yearPrinted: print(r.Printed),
    yearWritten: print(r.Written),
    premiered: print(r.Premiered),
    form: print(r['Prose/verse']) || undefined,
    genre: print(r.Genre),
    genreQid: print(r['Genre Wikidata ID']),
    region: print(r.Region),
    regionQid: r['Region Wikidata ID'].match(/^Q/)
      ? r['Region Wikidata ID'].trim()
      : null,
    project: print(r['Associated project in NeoLatDraCor']),
    status,
    availability: {
      status: print(r['Availability status']),
      notes: print(r['Notes on availability status']) || undefined,
    },
    licenceNotes: print(r['Licence-related notes']),
    transcription,
    acknowledgements: print(r['Acknowledgements']) || undefined,
    institution: print(r['Institution']) || undefined,

    source,
  };

  if (funding.line || funding.organization) entry.funding = funding;

  entry.complete = !!r['Metadata finally checked'].match(/yes/);
  entry._includeDocx = includeDocx;

  data.push(entry);

});

// writeFileSync('meta.json', JSON.stringify(data, null, 2));
writeFileSync(
  'meta.yaml',
  '# yaml-language-server: $schema=./meta.schema.json\n\n'
  + stringify(data, null, 2)
);

// console.log({ ids });
