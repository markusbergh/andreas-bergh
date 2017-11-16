/*
* These are my memories Grunt Configuration
* This file contains the configuration for GruntJS.
*
* Author:
* Markus Bergh, 2015
*/

module.exports = function(grunt) {
  // Grunt configuration
  grunt.initConfig({

    /*
    * Package
    */
    pkg: grunt.file.readJSON('package.json'),

    /*
    * Banner
    */
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '* Copyright (c) <%= grunt.template.today("yyyy") %> ',

    /*
    * Watch SASS directories
    */
    watch: {
      sass: {
        files: ['<%= pkg.directories.src_sass %>/**/*.sass'],
        tasks: ['sass:dev']
      },
      sass_teaser: {
        files: ['<%= pkg.directories.src_teaser_sass %>/**/*.sass'],
        tasks: ['sass:teaser']
      }
    },

    /*
    * SASS compiler
    */
    sass: {
      dev: {
        options: {
          style: 'expanded',
          trace: true,
          sourcemap: true,
          precision: 4
        },
        files: {
          '<%= pkg.directories.src_css %>/styles.css': '<%= pkg.directories.src_sass %>/styles.sass'
        }
      },
      teaser: {
        options: {
          style: 'expanded',
          trace: true,
          sourcemap: true,
          precision: 4
        },
        files: {
          '<%= pkg.directories.src_teaser_css %>/styles.css': '<%= pkg.directories.src_teaser_sass %>/styles.sass'
        }
      },
      deploy: {
        options: {
          style: 'compressed',
          trace: true,
          sourcemap: true,
          precision: 4
        },
        files: {
          '<%= pkg.directories.deploy_css %>/styles.min.css': '<%= pkg.directories.src_sass %>/styles.sass'
        }
      },
      deploy_teaser: {
        options: {
          style: 'compressed',
          trace: true,
          sourcemap: true,
          precision: 4
        },
        files: {
          '<%= pkg.directories.deploy_teaser_css %>/styles.min.css': '<%= pkg.directories.src_teaser_sass %>/styles.sass'
        }
      }
    },

    /*
    * RequireJS optimization
    */
    requirejs: {
      web: {
        options: {
          wrap: true,
          almond: true,
          appDir: '<%= pkg.directories.src_js %>',
          dir: '<%= pkg.directories.deploy_js %>',
          baseUrl: './',
          keepBuildDir: true,
          preserveLicenseComments: false,
          skipDirOptimize: false,
          normalizeDirDefines: "skip",
          removeCombined: true,
          mainConfigFile: '<%= pkg.directories.src_js %>/config.js',
          paths: {
            almond: 'vendor/almond-0.2.9'
          },
          modules: [
            {
              name: 'script-<%= pkg.version %>.min',
              include: ['almond', 'main'],
              create: true
            }
          ]
        }
      },
      teaser: {
        options: {
          wrap: true,
          almond: true,
          appDir: '<%= pkg.directories.src_teaser_js %>',
          dir: '<%= pkg.directories.deploy_teaser_js %>',
          baseUrl: './',
          keepBuildDir: true,
          preserveLicenseComments: false,
          skipDirOptimize: false,
          normalizeDirDefines: "skip",
          removeCombined: true,
          mainConfigFile: '<%= pkg.directories.src_teaser_js %>/config.js',
          paths: {
            almond: 'vendor/almond-0.2.9'
          },
          modules: [
            {
              name: 'script-<%= pkg.version %>.min',
              include: ['almond', 'main'],
              create: true
            }
          ]
        }
      }
    },

    /*
    * Process HTML
    */
    processhtml: {
      options: {

      },
      web: {
        files: {
          '<%= pkg.directories.deploy %>/index.html': '<%= pkg.directories.src %>/index.html'
        }
      },
      teaser: {
        files: {
          '<%= pkg.directories.deploy_teaser %>/index.html': '<%= pkg.directories.src_teaser %>/index.html'
        }
      }
    },

    /*
    * Copy static files
    */
    copy: {
      static: {
        files: [
          {
            expand: true,
            cwd: '<%= pkg.directories.src %>/static/img',
            src: ['**'],
            dest: '<%= pkg.directories.deploy %>/static/img'
          }
        ]
      },
      teaser: {
        files: [
          {
            expand: true,
            cwd: '<%= pkg.directories.src_teaser %>/static/img',
            src: ['**'],
            dest: '<%= pkg.directories.deploy_teaser %>/static/img'
          }
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-processhtml');

  grunt.registerTask('default', ['sass:dev', 'watch:sass']);

  grunt.registerTask('develop', ['sass:dev', 'watch:sass']);
  grunt.registerTask('teaser', ['sass:teaser', 'watch:sass_teaser']);

  grunt.registerTask('deploy', ['sass:deploy', 'requirejs:web', 'processhtml:web', 'copy:static']);
  grunt.registerTask('deploy_teaser', ['sass:deploy_teaser', 'requirejs:teaser', 'processhtml:teaser', 'copy:teaser']);
};
