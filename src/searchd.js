const cheerio = require('cheerio');
const stripTags = require('js-striphtml').stripTags;
const unescape = require('he').decode;

var outpost;
var searchid, printnotes;

function consumeRequest(err, res, body) {
    if (err || !res || res.statusCode !== 200) {
        outpost.log.error('failed to consume request, status code: ' + res.statusCode);
        return;
    }

    const $ = cheerio.load(body);
    var trades = [];
    $('[data-tradeid]').each(function () {
        var id = $(this).data('tradeid'), notes;
        trades.push(id);

        if (printnotes) {
            notes = outpost.highlightDetails(unescape(stripTags($(this).find('.notes').html() || '')));
            if (notes) {
                console.log('Trade #' + id);
                console.log(notes);
            }
        }
    });

    outpost.outputTrades(outpost.ofile, trades);
}

function search() {
    outpost.request(outpost.OUTPOST_URL + 'search/' + searchid, consumeRequest);
}

function setupDaemon(interval) {
    search();
    setInterval(search, interval * 1000);
}

module.exports = function (argv) {
    outpost = require('./utils')(argv);
    searchid = argv.s;
    printnotes = !!argv['print-notes'];

    setupDaemon(argv.n);
};
