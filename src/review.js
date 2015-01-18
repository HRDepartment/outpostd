const prompt = require('prompt');
const chalk = require('chalk');

const REGEX_OFFERS = /Offers$/;

var outpost;
var toRemove = [];
var scanned, cur;

var schema = {
    properties: {
        decline: {
            description: 'decline (y)',
            message: 'decline trade, ignored if input isn\'t "y"'
        },
        tag: {
            description: 'tag',
            message: 'optional tag, can be used by prettyprinter'
        }
    }
};

function done() {
    var removed = [];
    toRemove.forEach(function (trade) {
        scanned.splice(scanned.indexOf(trade), 1);
        removed.push(trade.tradeid);
    });

    outpost.log.info('Removed trades %s', removed.join(', '));
    outpost.writeJsonFile(outpost.ofile, scanned, function () {
        outpost.log.info('Review process complete.');
    });
}

function squashDuplicates(arr) {
    var list = [],
        records = {},
        val;

    arr.forEach(function (val) {
        records[val] = (records[val] || 0) + 1;
    });

    for (val in records) {
        list.push(val + ' ×' + records[val]);
    }

    return list;
}

function itemlist(list) {
    return squashDuplicates(list.map(function (item) {
        return item.name;
    })).join(', ');
}

function matchesFilter(trade, filter) {
    var items = trade.has.concat(trade.wants),
        _len, _i, _res;

    const when = {
        has: function (item, filter) {
            return item.id ? filter : false;
        },
        wants: function (item, filter) {
            return item.id ? false : filter;
        },
        offer: function (item) {
            return REGEX_OFFERS.test(item.name);
        }
    };

    for (_i = 0, _len = items.length; _i < _len; _i += 1) {
        item = items[_i];
        _res = eval(filter);

        if (_res instanceof RegExp) {
            if (_res.test(trade.trademsg)) {
                return true;
            }
        } else if (_res) {
            return true;
        }
    }

    return false;
}

function review(filter, opts) {
    if (cur >= scanned.length) {
        return done();
    }

    function next() {
        cur += 1;
        review(filter, opts);
    }

    var trade = scanned[cur];
    if (filter && typeof filter === 'string') {
        if (matchesFilter(trade, filter)) {
            toRemove.push(trade);

            console.log('Trade ' + trade.tradeid + ' marked for deletion (matched by filter).');
            return next();
        } else if (opts.onlyFilters) {
            console.log('Trade ' + trade.tradeid + ' ignored (not matched by filter).');
            return next();
        }
    } else if (opts.onlyFilters) {
        outpost.log.error("-r filter was specified, but no filters were passed.");
        return process.exit(1);
    }

    console.log('Trade[' + chalk.inverse((cur + 1) + '/' + scanned.length) + ']: ' + trade.tradeid + ' by ' + trade.poster + (trade.completed ? chalk.green(' [completed]') : '') + ' ' + trade.views + ' views');
    console.log(chalk.red('Made'), trade.created.fromNow, '|', chalk.magenta('Bumped'), trade.bump.fromNow);
    console.log(chalk.cyan('Has'), itemlist(trade.has));
    console.log(chalk.blue('Wants'), itemlist(trade.wants));
    console.log(outpost.highlightDetails(trade.trademsg));

    prompt.get(schema, function (err, result) {
        if (err) throw err;

        if (result.tag) {
            trade.tag = result.tag;
        }
        if (result.decline && result.decline === 'y') {
            toRemove.push(trade);
            console.log('Trade marked for deletion.');
        }

        next();
    });
}

module.exports = function (argv) {
    outpost = require('./utils')(argv);
    cur = 0;
    outpost.readJsonFile(outpost.ifile, function (json) {
        scanned = json;

        if (scanned.length === 0) {
            outpost.log.notice('No trades in the -i file. Did you use -c (scan)?');
            return process.exit(0);
        }

        prompt.start();
        review(argv.f, {
            onlyFilters: argv.r === 'filter'
        });
    });
};
