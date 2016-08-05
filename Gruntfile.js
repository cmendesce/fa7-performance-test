module.exports = function(grunt) {

  grunt.initConfig({
    pagespeed_junit: {
      options: {
        folder: process.env.CIRCLE_TEST_REPORTS + '/junit/',
        pages: [
          {name: 'Direito', url: 'http://www.fa7.edu.br/graduacao/direito'},
          {name: 'Home', url: 'http://www.fa7.edu.br'},
          {name: 'Graduacao', url: 'http://www.fa7.edu.br/graduacao'}
        ],
        key: 'AIzaSyAFMZf07E4WoJSRygfwvqO4ClF7Mfxa4VY'
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['pagespeed_junit']);
};
