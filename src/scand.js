const cheerio = require('cheerio');
const stripTags = require('js-striphtml').stripTags;
const unescape = require('he').decode;

const REGEX_COMMAS = /,/g;

var outpost;
var scan = [];
var trades, cur, max, delay;

// This is slow, I know.
function findAttributeValue(attrs, name) {
    var span = "<span class='label'>" + name + "</span>",
        attr, len, i;

    for (i = 0, len = attrs.length; i < len; i += 1) {
        attr = attrs[i];
        if (attr.indexOf(span) !== -1) {
            return attr.substr(span.length + 1);
        }
    }

    return "";
}

function parseSide($, items, mode) {
    var side = [];

    items.each(function () {
        var $this = $(this),
            hash = $this.data('hash').split(','),
            attrs = ($this.data('attributes') || "").split('<br>'),
            realName = unescape(stripTags(findAttributeValue(attrs, "Real Name:"))).trim(),
            item;

        item = {
            disabled: $this.hasClass('deleted'),
            defindex: hash[1],
            game: hash[0],
            quality: hash[2],
            name: realName ? realName : $this.data('name'),

            // attrs
            tradable: !$this.hasClass('untradable'),
            craftable: !$this.hasClass('uncraftable'),
            australium: $this.hasClass('australium'),
            gifted: !!findAttributeValue(attrs, "Gifted By:"),
            customName: unescape(realName ? $this.data('name') : ""),
            customDesc: unescape(findAttributeValue(attrs, "Custom Desc:")),
            paint: findAttributeValue(attrs, "Painted:"),
            killstreak: {
                active: findAttributeValue(attrs, "Killstreaks:") === "Active",
                sheen: findAttributeValue(attrs, "Sheen:"),
                killstreaker: findAttributeValue(attrs, "Killstreaker:")
            },
            effect: findAttributeValue(attrs, "Effect:"),
            craft: parseInt($this.find('.craft_no').text().substr(1), 10) || -1
        };

        if (mode === 0 /* has */) item.id = $this.data('id');

        if (item.craft !== item.craft) { // NaN
            item.craft = -1;
        }

        side.push(item);
    });

    return side;
}

function consumeRequest(err, res, body) {
    if (err || res.statusCode !== 200) {
        outpost.log.error('failed to consume request, status code: ' + res.statusCode + ' :: retrying in 10s');
        setTimeout(next, 15000);
        return;
    }

    const $ = cheerio.load(body);
    var trade = {
        tradeid: trades[cur],
        completed: !!$('.status .green').length,
        poster: $('.trade .details .nickname').text(),
        //posterid: parseInt($('.details li a').first().attr('href').replace('/trade/', ''), 10),
        premium: !!$('.trade .details .nickname.premium').length,
        trademsg: unescape(stripTags($('.offer .contents').first().html())),
        //commentcount: $('.details .nickname').length,
        bump: {absolute: '', formatted: '', fromNow: ''},
        created: {absolute: '', formatted: '', fromNow: ''},
        has: [],
        wants: []
    };

    var stats = $('.stats.contents .stat .value'),
        bump = $('.title .details time').first(),
        made = $('.title .details time').eq(1),
        sides = $('.contents ul'),
        has = $(sides[0]).find('li'),
        wants = $(sides[1]).find('li');

    trade.views = +($(stats[0]).text().replace(REGEX_COMMAS, ''));
    trade.bookmarks = +($(stats[1]).text().replace(REGEX_COMMAS, ''));
    trade.bump = {absolute: bump.attr('datetime'), formatted: bump.data('toggle'), fromNow: bump.text()};
    trade.created = {absolute: made.attr('datetime'), formatted: made.data('toggle'), fromNow: made.text()};
    trade.has = parseSide($, has, 0);
    trade.wants = parseSide($, wants, 1);

    scan.push(trade);

    cur += 1;
    setTimeout(next, delay * 1000);
}

function done() {
    outpost.outputScan(outpost.ofile, scan);
}

function next() {
    if (cur >= max) {
        return done();
    }

    outpost.log.info('Scanning %s [' + (cur + 1) + '/' + max + ']', trades[cur]);
    outpost.request(outpost.OUTPOST_URL + 'trade/' + trades[cur], consumeRequest);
}

function setupDaemon(_delay, scannum) {
    delay = _delay;
    max = +scannum;

    if (scannum === "all" || scannum === true || max > trades.length) {
        max = trades.length;
    }

    next();
}

module.exports = function (argv) {
    outpost = require('./utils')(argv);

    cur = 0;
    outpost.readJsonFile(outpost.ifile, function (ids) {
        if (ids.length === 0) {
            outpost.log.notice('No trades to scan, quitting.');
            return process.exit(0);
        }

        trades = ids;
        setupDaemon(argv.d, argv.c);
    });
};
