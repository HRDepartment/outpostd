const fs = require('fs');
var outpost;

function outputSuggestion(suggestion) {
    fs.writeFileSync('./' + outpost.ofile, suggestion.join('\n'));
    outpost.log.info('Prettyprinted successfully using backpacktf.');
}

function toBinaryString(bool) {
    return bool ? '1' : '0';
}

function prettyDate(fromNow) {
    return fromNow
        .replace(' ago', '')
        .replace('merely microseconds', 'now')
        .replace(' ', '')
        .replace(/minutes?/, 'm')
        .replace(/seconds?/, 's')
        .replace(/days?/, 'd')
        .replace(/hours?/, 'h')
        .replace(/weeks?/, 'w')
        .replace(/months?/, 'M')
        .replace(/years?/, 'y');
}

// TODO: classifieds integration
function prettyprint(trades, printargs) {
    var suggestion = [],
        args = printargs.trim().split(','),
        name = args[0],
        quality = outpost.QUALITY_IDS[(args[1] || "").toLowerCase()] || 6,
        tradable = toBinaryString((args[2] || "").toLowerCase() !== 'untradable'),
        craftable = toBinaryString((args[3] || "").toLowerCase() !== 'uncraftable'),
        trade, len, i;

    suggestion.push('[b]' + (tradable ? '' : 'Untradable ') + (craftable ? '' : 'Uncraftable ') + (outpost.QUALITY_NAMES[quality] === 'Unique' ? '' : outpost.QUALITY_NAMES[quality] + ' ') + name + '[/b]');
    suggestion.push('');
    suggestion.push('Classifieds: http://backpack.tf/classifieds/?item=' + encodeURIComponent(name) + '&quality=' + quality + '&tradable=' + tradable + '&craftable=' + craftable);
    suggestion.push('');

    for (i = 0, len = trades.length; i < len; i += 1) {
        trade = trades[i];
        // TODO: moment & sorting
        suggestion.push('http://tf2outpost.com/trade/' + trade.tradeid + ' ' + (trade.completed ? 'C' : 'UC') + ' - c-' + prettyDate(trade.created.fromNow) + '/b-' + prettyDate(trade.bump.fromNow) + (trade.tag ? ' ' + trade.tag : ''));
    }

    outputSuggestion(suggestion);
}

module.exports = function (argv) {
    var trailing = argv._.join(' ');
    outpost = require('../utils')(argv);

    if (typeof trailing !== 'string') {
        console.error('-- [args] is required for this pretty printer. Specify the intended item (such as Mann Co. Supply Crate Key) in the arg. Be specific so a correct classifieds link can be added. Quality, tradability , and craftability can be added also using commas:');
        console.error('Mann Co. Supply Crate Key,unique,craftable,tradable (craftable unique Mann Co. Supply Crate Key).');
        console.error('Mann Co. Supply Crate Key,community,uncraftable,untradable (uncraftable untradable community Mann Co. Supply Crate Key).');
        console.error('By default, quality: unique, tradable: yes, and craftable: yes are used.');
        console.error('See QUALITIES for a list of qualities (quality_ids must be used).');
        return;
    }

    outpost.readJsonFile(outpost.ifile, function (trades) {
        prettyprint(trades, trailing);
    });
};
