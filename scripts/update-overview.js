import { existsSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';
import GithubSlugger from 'github-slugger'

const slugger = new GithubSlugger()

const readmeFile = 'README.md';
const readme = readFileSync(readmeFile, 'utf8');

const yaml = readFileSync('meta.yaml', 'utf8')
const records = parse(yaml);

// console.log(records);

const rows = [];
const projects = {};

const head =
  '| Author | Title | Printed | Written | Project | Current formats | TEI |\n' +
  '| ------ | ----- | ------- | ------- | ------- | --------------- | --- |'
rows.push(head);

records.forEach(entry => {
  const teiFile = `tei/${entry.name}.xml`;
  let teiLink = entry.name || '';
  if (existsSync(teiFile)) {
    teiLink = `[${entry.name}.xml](${teiFile})`
  }

  const authors = [];
  entry.authors.forEach((a) => {
    let name = a.name || `${a.surname}, ${a.forename}`;
    if (a.qid) {
      name += ` [${a.qid}](https://www.wikidata.org/wiki/${a.qid})`;
    }
    authors.push(name);
  });
  const authorCell = authors.join('; ');

  let projectCell = entry.project || '';
  if (projects[entry.project]) {
    // console.log('SEEN', entry.project)
    projectCell = `[${entry.project}](#${projects[entry.project]})`
  } else {
    const m = readme.match(new RegExp(`## *${entry.project}\n`, 'm'))
    if (m) {
      // console.log(m[0]);
      const slug = slugger.slug(entry.project)
      projects[entry.project] = slug;
      projectCell = `[${entry.project}](#${slug})`
    }
  }

  let statusCell = entry.status || '';
  const docxFile = `docx/${entry.name}.docx`;
  if (existsSync(docxFile)) {
    const link = `[docx](${docxFile})`
    if (statusCell.match(/\.docx/)) {
      statusCell = statusCell.replace('.docx', link);
    } else {
      statusCell += `, ${link}`
    }
  }

  const row = `| ${authorCell} | ${entry.title} | ${entry.yearPrinted || ''} | ${entry.yearWritten || ''} | ${projectCell} | ${statusCell} | ${teiLink} |`;
  rows.push(row);
});

const table = rows.join('\n');
const markdown = readme.replace(
  /<!-- table:start -->[\s\S]+<!-- table:end -->/m,
  `<!-- table:start -->\n\n${table}\n\n<!-- table:end -->`
);
writeFileSync(readmeFile, markdown);
