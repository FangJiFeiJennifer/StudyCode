# You need install less
$ npm install less --global

# Compiler the styles.less file to styles.css file
$ lessc Less/styles.less > Less/styles.css

# Compiler the styles.less file to styles.mini.css a minified CSS file
$ npm install less-plugin-clean-css --global
$ lessc --clean-css Less/styles.less > Less/styles.mini.css


