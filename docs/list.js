'use strict'

const fs = require('fs');
const path = require('path');

const gitIgnore = fs.readFileSync('.gitignore', 'utf-8');
const readmeRegex = new RegExp(/readme.(md|txt)$/, 'gi');
const imagesRegex = new RegExp(/.jpg|.png$/, 'gi');

const filesAndFoldersToExclude = [
  '.git',
  //'docs',
  '.gitignore',
  '.gitattributes',
  'node_modules',
  // remove everything listed in .gitignore
  ...gitIgnore.split('\n').filter(l => l !== '')
];

function getFilesByRegex(dir, regex) {
  return fs.readdirSync(dir).reduce((list, f) => {
    const filepath = path.join(dir, f);

    // skip stuff we don't want showing up in search
    // and skip folders
    if(filesAndFoldersToExclude.includes(filepath)) {
      return list;
    }

    // recurse through dir
    if(fs.statSync(filepath).isDirectory()) {
      return [...list, ...getFilesByRegex(filepath, regex)];
    }

    // no hit, pass
    if(filepath.search(regex) == -1) {
      return list;
    }

    return [...list, filepath];
  }, []);
}

// readme.md is the one file to determine a thing
const thingsList = getFilesByRegex('.', readmeRegex);

const infoList = thingsList.map(readmeFilepath => {
  const folder = readmeFilepath.replace(readmeRegex, '');
  const tags = folder.split('/').map(str => str.split('_')).flat().filter(str => str !== '');
  const readmeStat = fs.statSync(readmeFilepath);
  if(readmeFilepath == 'readme.md'){return};
	console.log('logged:'+readmeFilepath);
	console.log('logged:'+folder);
	//console.log('logged:'+tags);
	console.log('logged:'+readmeStat);

  return {
    location: folder.replace(/\/$/, ''), //remove the last slash
    datetime: readmeStat.mtime,
    tags: tags,
    readme: readmeFilepath ? getFilesByRegex(folder,readmeRegex) : null,
    renders: folder ? getFilesByRegex(folder,imagesRegex) : null
  }
});

fs.writeFileSync('docs/files.js', `window.__print2a_files = ${JSON.stringify(infoList)}`);