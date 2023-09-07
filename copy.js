const copyfiles = require('copyfiles');

// Specify the source directory and destination directory
const srcDir = 'src';
const destDir = 'dist';

// Use a wildcard pattern to match HTML and CSS files recursively
const pattern = srcDir + '/**/*.{html,css,db}';

// Copy the matched files to the destination directory
copyfiles([pattern, destDir], { up: 1 }, (err) => {
  if (err) {
    console.error('Error copying files:', err);
  } else {
    console.log('Files copied successfully!');
  }
});
