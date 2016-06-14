module.exports = function(grunt) {
  var allSassFiles = [];

  var path = require('path');

  grunt.file.recurse(
    "./stylesheets/",
    function(abspath, rootdir, subdir, filename) {
      if(typeof subdir !== 'undefined'){
        var relpath = subdir + '/' + filename;
      } else {
        var relpath = filename;
      }
      if (filename.match(/\.scss/)) {
        allSassFiles.push("@import '" + relpath + "';");
      }
    }
  );

  grunt.file.write(
    "./spec/stylesheets/test.scss",
    allSassFiles.join("\n")
  );

  var imagesConf = { };
  try {
    var parentPackage = grunt.file.readJSON('../package.json');
    if (parentPackage.initGovUkToolkit) {
      var conf = parentPackage.initGovUkToolkit;
      if (typeof parentPackage.initGovUkToolkit === 'string') {
        var confFile = path.resolve(parentPackage.initGovUkToolkit);
        conf = grunt.file.readJSON(confFile);
      }
      imagesConf.cwd = 'images/';
      imagesConf.src = conf.copy.images || ['**'];
      imagesConf.dest = path.isPathAbsolute(conf.copy.to) ? conf.copy.to : path.resolve('../', conf.copy.to);
    }
  }
  catch (err) {
    // No parent found, nothing to do.
  }

  grunt.initConfig({
    clean: {
      sass: ["spec/stylesheets/test*css"]
    },
    jasmine: {
      javascripts: {
        src: [
          'node_modules/jquery/dist/jquery.js',
          'javascripts/govuk/analytics/google-analytics-universal-tracker.js',
          'javascripts/govuk/analytics/analytics.js',
          'javascripts/**/*.js'
        ],
        options: {
          specs: 'spec/unit/**/*.spec.js',
          helpers: 'spec/unit/*.helper.js'
        }
      }
    },
    sass: {
      development: {
        files: {
          './spec/stylesheets/test-out.css': './spec/stylesheets/test.scss'
        },
        options: {
          loadPath: [
            './stylesheets'
          ],
          style: 'nested'
        }
      }
    },
    shell: {
      multiple: {
        command: [
          'bundle',
          'bundle exec govuk-lint-sass stylesheets'
        ].join('&&')
      }
    },
    copy: {
      images: imagesConf
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('test', ['sass', 'clean', 'jasmine', 'shell']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('init-parent', ['copy:images']);
};
