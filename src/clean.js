const fs = require('fs');

module.exports = function (argv) {
    var files = [].concat(argv.i, argv.o);

    files.forEach(function (file) {
        fs.writeFileSync(file, '');
    });
};
