const optimist = require('optimist')
    .usage([
        'Outpost daemon. Outputs findings in json format. Supply it with a searchid/input file from a previous search, some cookies, and it\'ll get rolling.',
        'Important: Set up the uhash cookie first (see cookies.txt.example), by default cookies.txt is used. See the README for more details.',
        'Usage: node outpostd -s [searchid] -n [interval=60] -o [output=outpost.json]',
        '       node outpostd -c [count=all] -i [input=outpost.json] -d [delay=1] -o [output=outpost-scanned.json]',
        '       node outpostd -r -i [input=outpost-scanned.json] -o [output=outpost-scanned.json]',
        '       node outpostd -p [printer] -i [input=outpost-scanned.json] -o [output=outpost-pretty.txt]',
        '       node outpostd --clean',
    ].join('\n'))
    .alias('s', 'search')
    .describe('s', 'initiates a search daemon, scans the search page every [n].')

    .alias('c', 'scan')
    .describe('c', 'initiates a scan daemon, checks each trade scanned by the search daemon. can specify a number to only scan the first x trades')

    .alias('r', 'review')
    .describe('r', 'review process after a scan, to remove or tag unwanted trades. if value is filter, only filters are matched and no manual review will take place')

    .alias('p', 'prettyprint')
    .describe('p', 'pretty prints a scan\'s output, using the requested prettyprinter (src/printer/{name}.js)')

    .describe('clean', 'cleans i/o files specified by -i and -o, not including cookies.')

    .alias('i', 'input')
    .default('i', 'outpost.json/outpost-scanned.json (c/p,r)')
    .describe('i', 'input file')

    .alias('o', 'output')
    .default('o', 'outpost.json/outpost-scanned.json/outpost-pretty.txt (s/c,r/p)')
    .describe('o', 'output file')

    .alias('j', 'jar')
    .default('j', 'cookies.txt')
    .describe('j', 'cookies required to connect to tf2outpost search. example in cookies.txt.example, you need the uhash cookie')

    .alias('n', 'interval')
    .default('n', 45)
    .describe('n', 'search interval')

    .alias('d', 'delay')
    .default('d', 1)
    .describe('d', 'scan delay (between each check)')

    .alias('f', 'filter')
    .describe('f', 'expression filter (eval\'d) for the review process, if anything matches it, the trade is discarded. example usage in FILTERS')

    .default('print-notes', false)
    .describe('print-notes', 'print notes as soon as a new trade is found (scan).')

    .default('show-full-notes', false)
    .describe('show-full-notes', 'show the full trade notes, instead of just the lines containing numbers (scan and review).');
const argv = optimist.argv;

(function () {
    var ok = true;

    ok = argv.s || argv.c || argv.p || argv.clean || argv.r;
    if (!ok) {
        optimist.showHelp();
        process.exit(1);
    }
}());

if (argv.i === 'outpost.json/outpost-scanned.json (c/p,r)') {
    if (argv.c) argv.i = 'outpost.json';
    else if (argv.p || argv.r) argv.i = 'outpost-scanned.json';
    else if (argv.clean) argv.i = ['outpost.json', 'outpost-scanned.json'];
}

if (argv.o === 'outpost.json/outpost-scanned.json/outpost-pretty.txt (s/c,r/p)') {
    if (argv.s) argv.o = 'outpost.json';
    else if (argv.c || argv.r) argv.o = 'outpost-scanned.json';
    else if (argv.p) argv.o = 'outpost-pretty.txt';
    else if (argv.clean) argv.o = ['outpost.json', 'outpost-scanned.json', 'outpost-pretty.txt'];
}

var main = '';
if (argv.s) main = 'searchd';
else if (argv.c) main = 'scand';
else if (argv.r) main = 'review';
else if (argv.p) main = 'printers/' + argv.p;
else if (argv.clean) main = 'clean';
require('./src/' + main)(argv);
