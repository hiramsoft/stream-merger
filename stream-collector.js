/**
 * Synopis -- blocks stream until all items have been processed, and then continues with streaming.
 *
 * Optionally caller may provide fn to process
 *
 *
 * var Collector = require("gulp-collector");
 * gulp.src(...).
 *      .pipe(Collector(function(objects) { return _(objects).take(15).value(); } ))
 *      .pipe(gulp.dest(...));
 */

var ArrayLatch = function() {
    this._latch = [];

    this.collect = function(items) {
        return items;
    };

    this._src = require('stream').Duplex({objectMode: true});
    this._src._read = function () {
        // This stream has no existing content to push.
    }
    this._src._write = function (items) {
        //console.log("this.push = ", this.push);
        if(items) {
            for (var findex = 0; findex < items.length; findex++) {
                this.push(items[findex]);
            }
        }
        // undocumented on https://nodejs.org/api/stream.html#stream_event_data
        // but "null" is the control signal that there is no more data in the stream...
        this.push(null);
    }
}

ArrayLatch.prototype.onItemAdd = function(item){
    // noop
}

ArrayLatch.prototype.on = function (name, fn) {
    this._events = this._events || {};
    this._events[name] = fn;
};
ArrayLatch.prototype.removeListener = function (name, fn) {
    this._src.removeListener(name, fn);
};
ArrayLatch.prototype.once = function (name, fn) {
    this._once = this._once || {};
    this._once[name] = fn;
};
ArrayLatch.prototype.emit = function (name, fn) {
    this._emits = this._emits || {}
    this._emits[name] = fn;
};
ArrayLatch.prototype.write = function (data) {
    this.onItemAdd(data);
    this._latch = this._latch || [];
    this._latch.push(data);
};
ArrayLatch.prototype.end = function () {
    if (this.collect) {
        var processedLatch = this.collect(this._latch);
        this._src._write(processedLatch);
    }
    else {
        this._src._write(this._latch);
    }

    this._latch = null;
};
ArrayLatch.prototype.pipe = function (nextPipe) {
    return this._src.pipe(nextPipe);
};

var Collector = function(processing){
    var latch = new ArrayLatch();
    if(processing) {
        latch.collect = processing
    }
    return latch;
}

module.exports = Collector;