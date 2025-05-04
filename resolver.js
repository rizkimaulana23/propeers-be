const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAliases({
  'src': path.join(__dirname, 'src'),
  '@': path.join(__dirname, 'src')
});