module.exports = function (grunt) {
    grunt.initConfig({
        browserify: {
            watch: {
                src: [
                    "./client/api/**/*.js",
                    "./client/app/**/*.js"
                ],
                dest: './client/dist/vault13.js',
                options: {
                    browserifyOptions: { debug: true },
                    transform: [["babelify", { "presets": ["es2015"] }]],
                    watch: true,
                    keepAlive: true
                }
            },
            build: {
                src: [
                    "./client/api/**/*.js",
                    "./client/app/**/*.js"
                ],
                dest: './client/dist/vault13.js',
                options: {
                    browserifyOptions: { debug: true },
                    transform: [["babelify", { "presets": ["es2015"] }]],
                }
            }
            
        }
         
    });
    
    grunt.loadNpmTasks('grunt-browserify');
};


 