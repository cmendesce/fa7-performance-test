module.exports = function(grunt) {

  grunt.initConfig({
    pagespeed_junit: {
      options: {
        urls: ['http://www.fa7.edu.br'],
        key: 'AIzaSyAFMZf07E4WoJSRygfwvqO4ClF7Mfxa4VY',
        reports: [process.env.CIRCLE_TEST_REPORTS + '/junit/gpsi-home.xml']
      }
    }
  });

  grunt.loadNpmTasks('grunt-pagespeed-junit');
  grunt.registerTask('default', ['pagespeed_junit']);
};
