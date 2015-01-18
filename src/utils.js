const fs = require('fs');
const request = require('request');
const Log = require('log');
const chalk = require('chalk');
const log = new Log();
const QUALITY_IDS = {
    "normal": 0,
    "genuine": 1,
    //"rarity2": 2,
    "vintage": 3,
    //"rarity3": 4,
    "unusual": 5,
    "unique": 6,
    "community": 7,
    "developer": 8,
    "selfmade": 9,
    //"customized": 10,
    "strange": 11,
    //"completed": 12,
    "haunted": 13,
    "collectors": 14
};

const QUALITY_NAMES = ["Normal", "Genuine", '_', "Vintage", '_', "Unusual", "Unique", "Community", "Valve", "Self-Made", '_', "Strange", '_', "Haunted", "Collector's"];
const REGEX_NUMBER = /\d/;

const OUTPOST_URL = 'http://www.tf2outpost.com/';
var showFullNotes = false;
var cookiejar, ifile, ofile;

function mergeArrays(a, b) {
    var len, i;

    for (i = 0, len = b.length; i < len; i += 1) {
        if (a.indexOf(b[i]) === -1) {
            a.push(b[i]);
        }
    }

    return a;
}

function outputTrades(outfile, trades) {
    readJsonFile(outfile, function (json) {
        var prevlen = json.length,
            newlen = 0;

        mergeArrays(json, trades);
        newlen = json.length - prevlen;
        writeJsonFile(outfile, json, function () {
            log.info('Trades updated, ' + newlen + ' added.');
        });
    });
}

function outputScan(outfile, scan) {
    writeJsonFile(outfile, scan, function () {
        log.info('Finished scanning [' + scan.length + ' entries].');
    });
}

function writeJsonFile(file, json, cb) {
    fs.writeFile('./' + file, JSON.stringify(json), {encoding: 'utf8'}, function (err) {
        if (err) throw err;
        cb();
    });
}

function readJsonFile(infile, cb) {
    fs.readFile('./' + infile, {encoding: 'utf8'}, function (err, content) {
        if (err && err.code !== 'ENOENT') throw err;

        var json = [];
        try {
            json = JSON.parse(content);
        } catch (ex) {}
        cb(json);
    });
}

function makeRequest(opts, fn) {
    if (typeof opts === 'string') {
        opts = {url: opts};
    }

    opts.jar = cookiejar;
    request(opts, fn);
}

function highlightDetails(message) {
    var lines = [],
        msg = message.split('\n'),
        tail, line, len, i;

    for (i = 0, len = msg.length; i < len; i += 1) {
        line = msg[i];

        if (REGEX_NUMBER.test(line)) {
            lines.push(chalk.bold(line));
        } else {
            if (showFullNotes) lines.push(chalk.dim(line));
        }
    }

    return lines.join('\n');
}

module.exports = function (argv) {
    var cookie = request.cookie(fs.readFileSync('./' + argv.j, 'utf8'));
    cookiejar = request.jar();
    cookiejar.setCookie(cookie, OUTPOST_URL);

    ifile = argv.i;
    ofile = argv.o;

    showFullNotes = !!argv['show-full-notes'];
    return {
        mergeArrays: mergeArrays,
        request: makeRequest,
        highlightDetails: highlightDetails,
        log: log,
        outputTrades: outputTrades,
        outputScan: outputScan,
        readJsonFile: readJsonFile,
        writeJsonFile: writeJsonFile,
        ifile: ifile,
        ofile: ofile,
        OUTPOST_URL: OUTPOST_URL,
        QUALITY_NAMES: QUALITY_NAMES,
        QUALITY_IDS: QUALITY_IDS
    };
};
