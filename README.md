Synopsis
====

Merge multiple [NodeJS streams](https://nodejs.org/api/stream.html) together and output as one stream.

Useful for merging LESS and SASS tasks in [Gulp](http://gulpjs.com/) since they build separately
but often can be merged and minified together.

    var StreamMerger = require('stream-merger');
    
    // ... assume these dependencies are set up

    var lessStream = lessTasks(gulp.src(bundle.lessIn));

    var sassStream = sassTasks(gulp.src(bundle.sassIn));
    
    var cssStream = cssTasks(gulp.src(bundle.cssIn));
    
    var combinedStream =
        StreamMerger([lessStream, sassStream, cssStream])
        .pipe(concatCss(bundle.out))
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
        ;
    
    if(isProd){
        combinedStream = combinedStream
            .pipe(stripMaps())
            .pipe(minifyCSS());
    }
    else {
        combinedStream = combinedStream
            .pipe(sourcemaps.write('.'));
    }
    
    combinedStream
        .pipe(gulp.dest(styleSettings.destPath))
        .on('end', function(){
            bundleComplete()
        });
        


Consideration
======

Internally the separate streams are buffered (well, slurped) using an in-memory array.

If you have a scenario that doesn't fit or think slurping defeats the purpose of streams,
this may not be the right merger for you.
        
Dependencies
======

There is no direct dependency on gulp.
You may use this stream merger anywhere that accepts NodeJS streams.

Why does the merger block before releasing the merged stream?
The original use case for this merger was an environment
that needed to know the complete merged stream contents before continuing.

I now use it for gulp build scripts and it hasn't been an issue (yet).
If it becomes one, I'll rewrite.

License
======

MIT +no-false-attribs License