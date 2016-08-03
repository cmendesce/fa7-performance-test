module.exports = function(grunt) {

  grunt.initConfig({
    pagespeed_junit: {
      options: {
        urls: ['http://www.fa7.edu.br', 'http://www.fa7.edu.br/graduacao', 'http://www.fa7.edu.br/direito'],
        key: 'AIzaSyAFMZf07E4WoJSRygfwvqO4ClF7Mfxa4VY',
        reports: [
          process.env.CIRCLE_TEST_REPORTS + '/junit/gpsi-home.xml',
          process.env.CIRCLE_TEST_REPORTS + '/junit/gpsi-graduacao.xml',
          process.env.CIRCLE_TEST_REPORTS + '/junit/gpsi-direito.xml'
        ]
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['pagespeed_junit']);
};
