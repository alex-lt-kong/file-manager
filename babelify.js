const fs = require('fs');
const browserify = require('browserify');

const srcList = [
  'manager.js',
  './viewer/video.js', './viewer/text.js'
];

if (process.argv.length !== 3 || (process.argv[2] !== '--prod' && process.argv[2] !== '--dev')) {
  console.warn('Shoud specify --prod or --dev');
  exit(1);
}

const babelifyOptions = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  sourceMaps: true,
  global: true,
  ignore: [/\/node_modules\/(?!react-syntax-highlighter\/)/]
};
/**
 * Without 2-4 lines, babelify wont work with react-syntax-highlighter,
 * complaining ParseError: 'import' and 'export' may appear only with 'sourceType: module'
 * Reference: https://stackoverflow.com/a/56608843
*/

// sample is from tinyify: https://github.com/browserify/tinyify
for (let i = 0; i < srcList.length; ++i) {
  if (process.argv[2] === '--prod') {
    browserify(`./src/${srcList[i]}`)
        .transform('babelify', babelifyOptions)
        .transform('unassertify', {global: true})
        .transform('@goto-bus-stop/envify', {global: true})
        .transform('uglifyify', {global: true})
        // .plugin('common-shakeify')--cant enable this, causes error
        .plugin('browser-pack-flat/plugin')
        .bundle()
        .pipe(require('minify-stream')({sourceMap: false}))
        .pipe(fs.createWriteStream(`./static/js/${srcList[i]}`));
  } else {
    browserify(`./src/${srcList[i]}`)
        .transform('babelify', babelifyOptions)
        .bundle()
        .pipe(fs.createWriteStream(`./static/js/${srcList[i]}`));
  }
}
