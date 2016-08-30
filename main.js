#!/usr/bin/env node

var _ = require("underscore")._;
var winston = require("winston");

var pack = require("./pack");

var optimist = require("optimist")
    .options("input", {
        alias: "i", describe: "input folder"
    })
    .options("output", {
        alias: "o", describe: "output JSON file (default: assets.json)"
    })
    .options("preloader", {
        alias: "p", describe: "preloader folder"
    })
    .options("prependBasePath", {
        alias: "pb", describe: "prepends base path to each asset id"
    })
    .options("help", {
        alias: "h", describe: "help"
    });


var argv = optimist.argv;
var opts = _.extend({}, argv);

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true
    , level: argv.log
    , handleExceptions: false
});
winston.debug("parsed arguments", argv);

opts.logger = winston;

opts.output = argv.output ? argv.output : "./assets.json";

if (argv.help || !opts.input || !opts.output) {
    if (!argv.help) winston.error("invalid options");
    winston.info("Usage: base64pack -i assets -o assets.json");
    winston.info(optimist.help());
    process.exit(1);
}

pack(opts, function (err, obj) {
    if (err) {
        winston.error(err);
        process.exit(0);
    }
    winston.info("done");
});