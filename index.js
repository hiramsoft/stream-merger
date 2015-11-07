/**
 * Synopsis: Given an array of streams, blocks until all streams have ended and
 * then continues with one merged stream.
 */

var Collector = require('./stream-collector.js');
var _ = require('lodash');

var ArrayMerger = function(streams){
    // first, set up internal stream
    this._src = this._src || require('stream').Duplex({objectMode: true});
    this._src._read = function () {
        // This stream has no existing content to push.
    }
    this._src._write = function (items) {
        if (items && items.length) {
            for (var findex = 0; findex < items.length; findex++) {
                this.push(items[findex]);
            }
        }
        this.push(null);
    }

    if(!streams){
        console.error("ArrayMerger expects an array of streams");
        return;
    }

    // timing issue of this means we want to curry and define streamFinished here
    this._streamFinished = function(streamId) {
        this._merged = this._merged || [];
        var self = this;
        return function (data) {
            self._streamsDone++;

            self._merged = _.union(self._merged, data);

            if (self._streamsDone >= self._totalStreams) {
                self._src._write(self._merged);
            }
        }
    };

    // second, pipe each stream through to the stream finished latch

    this._totalStreams = streams.length;
    this._streamsDone = 0;
    for(var streami=0;streami < streams.length;streami++){
        var stream = streams[streami];
        if(!stream){
            console.log("Stream is null", stream);
        }
        stream.pipe(
            Collector(
                this._streamFinished(streami)
            )
        )
    }
}

ArrayMerger.prototype.on = function (name, fn) {
    this._src.on(name, fn);
};
ArrayMerger.prototype.removeListener = function (name, fn) {
    this._src.removeListener(name, fn);
};
ArrayMerger.prototype.once = function (name, fn) {
    this._src.once(name, fn);
};
ArrayMerger.prototype.emit = function (name, fn) {
    this._src.emit(name, fn);
};
ArrayMerger.prototype.write = function (data) {
    this._src.write(data);
};
ArrayMerger.prototype.end = function () {
    this._src.end();
};

ArrayMerger.prototype.pipe = function (nextPipe) {
    return this._src.pipe(nextPipe);
};

var StreamMerger = function(left, right){
    if(_.isArray(left)){
        return new ArrayMerger(left);
    }
    else if (left && right){
        return new ArrayMerger([left, right]);
    }
    else {
        return new ArrayMerger([left]);
    }
}

module.exports = StreamMerger;