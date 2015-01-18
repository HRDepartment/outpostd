A filter is just a short little script executed for every item matched. In the evaluated context, there is a 'trade' and an 'item' object (items) available, with these properties:

# trade

- int tradeid
- bool completed
- string poster
- bool premium
- string trademsg
- object bump{string absolute, string formatted, string fromNow}
- object created{string absolute, string formatted, string fromNow}
- array has[item]
- array wants[item]
- int views
- int bookmarks

# item

- int? id (int for the has array, undefined for the wants array) (current item id, not original_id)
- bool has
- bool wants
- bool disabled
- string defindex
- string game
- string quality
- string name

- bool tradable
- bool craftable
- bool australium
- bool gifted
- string customName
- string customDesc
- string paint
- object killstreak[killstreak]
- string effect
- int craft (-1 if none)

# killstreak

- bool active
- string sheen
- string killstreaker

There are also some helper functions available:

- when.has, when.wants | Use these if you only want to match one side. Signature is (item, condition) - see below.
- when.offer | Matches '[game] Offers'. Signature is (item).

Example usage (trade):

```
-f "!trade.completed" (filters non-completed)
-f "!trade.completed && trade.views < 100" (filters non-completed, plus view count must be >= 100)
-f "!trade.premium" (filters trades by premium members)
-f "trade.premium" (filters trades by non premium members)
```

Example usage (item):

```
-f "item.quality !== '6'" (unique quality only)
-f "item.name !== 'Mann Co. Supply Crate Key' && item.name !== 'Refined Metal'" (keys and ref only)
-f "when.has(item, !item.australium)" (has item, not australium -> removed)
-f "when.wants(item, item.painted)" (want item, painted -> removed)
-f "when.offer(item)" (if item is 'Offers', discard trade)
```

If any filter returns a truthy value, the entire trade is discarded. As a special case, if a regular expression is returned as a result (/exp/ instanceof RegExp), its test method is called with the trade's trademsg. If that returns true, the trade is discarded.


Example with RegExp:
```
-f "/australium/i" (/australium/i.test(trade.trademsg)) - hide trades with "australium" in the notes
```

It's also possible to skip the review process and just use the filter:

```
-r filter
```
