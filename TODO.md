### things to remember
* First you can develop using an absolute path with Plug
* :checkhealth is a great command to see whats going on.
* Plugin needs to be created at "rplugin/node/file.js".
* Plugin needs to be created at "rplugin/node/folder/package.json -> main.js".
* If it doesn't work, that is because you haven't doen :UpdateRemotePlugins in a while....
* ^ -- That does not have to be true if you use alwaysInit property when initializing your plugin.  So recommend both dev and alwaysInit to be true.
    * but that does not always work.  That only works for the main file. :(
    * I suggest developing one file until you have something you like, then move that into another file as it wont change as much.
* echom is great
* nargs: "*" is the way to get args.  weeee!!!
* try catch your life away.
* await plugin.nvim.outWrite(`BETTER END WITH A \n`);

* Ban: gotham, google, znake
