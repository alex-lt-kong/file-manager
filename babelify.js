const fs = require('fs');
const browserify = require('browserify');

const srcList = [
  'common.js', 'ctx-menu.js', 'manager-modalextractsubtitles.js',
  'modal-mkdir.js', 'modal-move.js', 'modal-remove.js',
  'manager-modaltranscode.js', 'manager-modalvideoinfo.js',
  'offcanvas-server-info.js', 'manager.js', 'playback.js'
];

if (process.argv.length !== 3 || (process.argv[2] !== '--prod' && process.argv[2] !== '--dev')) {
  console.warn('Shoud specify --prod or --dev');
  exit(1);
}

// sample is from tinyify: https://github.com/browserify/tinyify
for (let i = 0; i < srcList.length; ++i) {
  if (process.argv[2] === '--prod') {
    browserify(`./src/${srcList[i]}`)
        .transform('babelify', {presets: ['@babel/preset-env', '@babel/preset-react']})
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
        .transform('babelify', {presets: ['@babel/preset-env', '@babel/preset-react']})
        .bundle()
        .pipe(fs.createWriteStream(`./static/js/${srcList[i]}`));
  }
}
