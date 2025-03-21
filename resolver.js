const { resolve } = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAliases({
  'src': resolve(__dirname, './src')
});