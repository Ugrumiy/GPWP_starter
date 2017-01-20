/**
 * Created by:  malyusha 09.06.16
 * Email:       lovecoding@yandex.ru
 * Developer:   Igor Malyuk
 */
'use strict';

const path = require('path');
const slash = require('slash');
const filesystem = require('fs');
const preg_quote = require('./preg-quote');

var _getAllFilesFromFolder = function(dir) {

  var results = [];

  filesystem.readdirSync(dir).forEach(function(file) {

    var fileNameSplit = file.split('.');
    file = slash(path.join(dir, file));
    var stat = filesystem.statSync(file);

    if(stat && stat.isDirectory()) {
      results = results.concat(_getAllFilesFromFolder(file))
    } else if (fileNameSplit[fileNameSplit.length - 1] == 'js'){
      results.push(file);
    }

  });

  return results;
};

let notEmpty = elem => !!elem;

let getEntries = (projectPath, folder, extensions) => {
  extensions = extensions || ['jsx', 'js'];
  folder = folder || 'pages';

  let result = {};
  let pathToFiles = slash(path.join(projectPath, folder));
  let files = _getAllFilesFromFolder(pathToFiles);

  for(let i = 0, length = files.length; i < length; i++) {
    let regexp = new RegExp(`\.(${extensions.join('|')})`);

    let fileName = files[i].split('/').pop();
    let entryName = fileName.replace(regexp, '');
    let quotedPaths = new RegExp(preg_quote(pathToFiles));
    let rawFilePaths = files[i].replace(quotedPaths, '').split('/').filter(notEmpty);
    let startFolder = folder;
    let changedPath = pathToFiles;
    //If it's nested structure level
    if(rawFilePaths.length > 1) {
      rawFilePaths.pop(); //remove file name from path
      entryName = rawFilePaths.join('.'); //e.g. directory_sub_module
      startFolder = rawFilePaths.join('/');
      changedPath = path.join(changedPath, rawFilePaths.join('/'));
    }

    //if it's jsx file - replace it to js
    result[entryName] = path.join(changedPath, fileName);
  }

  return result;

};

module.exports = getEntries;