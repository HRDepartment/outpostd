## To get started:
- npm install

Then,

- Windows: outpostd -h
- Unix: ./outpostd.sh -h
- Universal: node outpostd.js -h (subject to change)

Windows style will be used throughout because it's shorter & simpler.

### Set up some of the files
- outpostd --clean --clean-jar

### Set up the cookies
- Copy cookies.txt.example into cookies.txt
- Open your browser [log into tf2outpost.com], and look for your uhash cookie.
    - In Chrome, this can be done by clicking on the lock/blank file, clicking on "Show cookies and site data", selecting tf2outpost.com and expanding it and its cookies. The uhash cookie is what you're looking for. Focus on the 'Content' field and Ctrl+A Ctrl+C. Replace the xxxxx in your cookies file with the hash (32 characters).

## Start collecting tradeids
- Create a search on outpost, you can use whatever options you want. - http://www.tf2outpost.com/search
- `outpostd -s searchid`, example: `outpostd -s 1234567`

### Start scanning trades
- Once you're done collecting tradeids, scan your collected trades (^C)
- `outpostd -c`

### Review trades
- The scan will automatically exit. Once you're done, it's time to review your collected trades.
- `outpostd -r`
- tags are optional and are used by your preferred printer only. In the case of backpacktf, you'd want to specify how much the trader is looking for.
- Filters are possible too, see the FILTERS file.

### Human-readable output
The following printers are available:

* backpacktf
    * `outpostd -p backpacktf -- Mann Co. Supply Crate Key`
    * `outpostd -p backpacktf -- Mann Co. Supply Crate Key,strange,uncraftable,tradable`
    * Example output:
    ```
        [b]Mann Co. Supply Crate Key[/b]
        [classifieds link]
        [link] - c-[created]/b-[bumped] [tag]
    ```
    `--` is required for this pretty printer. Specify the intended item (such as Mann Co. Supply Crate Key) in the arg. Be specific so a correct classifieds link can be added. Quality, tradability, and craftability can be added also using commas: Mann Co Supply Crate Key,6,1,1 (craftable unique Mann Co. Supply Crate Key).
    By default, unique, tradable, and craftable are used.
