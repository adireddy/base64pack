var fs = require("fs");
var mkdirp = require('mkdirp');

module.exports = function() {
    var opts = arguments[0];
    var callback = arguments[1];
    var inputFolder = opts.input;
    var outputFile = opts.output;
    var prependBasePath = opts.prependBasePath;
    var list = { "meta": [0, 0] };
    var count = 0;
    var size = 0;
    var MIME_TYPES = {
        "mp3": "audio/mpeg",
        "m4a": "audio/mp4",
        "mp4": "audio/mp4",
        "mpg": "audio/mpeg",
        "mpeg": "audio/mpeg",
        "mpga": "audio/mpeg",
        "mp1": "audio/mpeg",
        "mp2": "audio/mpeg",
        "aac": "audio/aac",
        "ogg": "audio/ogg",
        "oga": "audio/ogg",
        "wav": "audio/wav",
        "webm": "audio/webm",
        "weba": "audio/webm",
        "aif": "audio/x-aiff",
        "aifc": "audio/x-aiff",
        "aiff": "audio/x-aiff",
        "mid": "audio/midi",
        "midi": "audio/midi",
        "png": "image/png",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "jpe": "image/jpeg",
        "tif": "image/tiff",
        "gif": "image/gif",
        "tiff": "image/tiff",
        "bmp": "image/bmp",
        "json": "text/plain",
        "atlas": "text/plain",
        "txt": "text/plain",
        "text": "text/plain",
        "xml": "text/xml"
    };

    if (/[\/\\]/.test(inputFolder.substring(inputFolder.length - 1, inputFolder.length))) inputFolder = inputFolder.substring(0, inputFolder.length - 1);
    var preloaderFolder = opts.preloader ? inputFolder + "/" + opts.preloader : inputFolder + "/preloader";
    outputFile = outputFile.replace("\/", "/");

    if (inputFolder) {
        listFiles(inputFolder);
        list["meta"] = [count, size];
        mkdirp(outputFile.substring(0, outputFile.lastIndexOf("/")), function (err) {
            fs.writeFileSync(outputFile, JSON.stringify(list));
        });
    }

    if (opts.preloader) {
        list = { "meta": [0, 0] };
        count = 0;
        size = 0;
        listFiles(preloaderFolder);
        list["meta"] = [count, size];
        fs.writeFileSync(outputFile.substring(0, outputFile.lastIndexOf(".")) + "-preloader.json", JSON.stringify(list));
    }

    function listFiles(folder) {
        try {
            var files = fs.readdirSync(folder);
            files.forEach(function (file) {
                var ext = file.split(".").pop();
                var filePath = folder + "/" + file;
                var stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    if (filePath === preloaderFolder) return;
                    listFiles(filePath);
                }
                else {
                    var data = fs.readFileSync(filePath, "base64");
                    if(MIME_TYPES[ext]) {
                        var subPath = prependBasePath ? filePath : filePath.substring(inputFolder.length + 1, filePath.length);
                        list[subPath] = "data:" + MIME_TYPES[ext] + ";base64," + data;
                        count++;
                        size += stats.size;
                    }
                }
            });
        }
        catch (e) {
            callback("failed with exception: " + e.message);
        }
    }
}