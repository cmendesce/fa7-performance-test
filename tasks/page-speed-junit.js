'use strict';

module.exports = function (grunt) {
  const PAGESPEED_URL = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed';

  grunt.registerTask('pagespeed_junit_2', 'Pagespeed to junit task runner for grunt.', function() {
    var options = this.options({
      threshold: 60,
      strategy: 'mobile'
    });

    var async = require('async');
    var querystring = require('querystring');

    var pages = options.pages;

    for (var i = 0; i < pages.length; i++) {
      pages[i].report = options.folder + 'gpsi-' + pages[i].name.toLowerCase() + '.xml';

      var params = {
        url: pages[i].url,
        key: options.key,
        strategy: options.strategy
      };
      pages[i].gpsiUrl = PAGESPEED_URL + '?' + querystring.stringify(params);
    }

    var done = this.async();
    async.each(pages, eachPage, done);
  });

  function eachPage(page, callback) {

    var request = require('request');

    request(page.gpsiUrl, function(e, r, b) {
      handlePageResult(page, e, r, b);
      callback();
    });

  }

  function handlePageResult(page, error, response, body) {
    if (!error && response.statusCode === 200) {
      var b = JSON.parse(body);
      var stats = b.pageStats;
      var results = b.formattedResults;
      var ruleResults = results.ruleResults;
      var failures = 0;
      
      var builder = require('xmlbuilder');
      var xml = builder.create('testsuites', {
        failures: '%%FAILURES%%',
        name: page.name,
        tests: Object.keys(ruleResults).length
      });
      xml.ele('testsuite', {
        failures: '%%FAILURES%%',
        name: page.name,
        tests: Object.keys(ruleResults).length
      });

      Object.keys(ruleResults).forEach(function(key, index) {
        var rule = ruleResults[key];
        if (parseFloat(rule.ruleImpact) > 0) {
           failures++;
        }
        xml = parseRule(rule, page, xml);
      });
      //tc.ele('system-out', {}, impact);
      var output = xml.end({pretty: true}).replace(/%%FAILURES%%/g, failures.toString());
      grunt.file.write(page.report, output);
      grunt.log.writeln('Page score: ' + b.score);
      grunt.log.writeln('Total failures: ' + failures);
      grunt.log.writeln('>> File: ' + page.report + ' created.');

    } else {
      grunt.fail.warn('Error retrieving results.');
    }
  }

  // parsing
  function parseRule(rule, page, xml) {

    var testCase = xml.ele('testcase', {
      assertions: 1,
      classname: '[PageSpeed] ' + page.name,
      name: rule.localizedRuleName,
      status: rule.ruleImpact,
      time: ''
    });
    if (parseFloat(rule.ruleImpact) > 0) {

      testCase.ele('failure', {
        message: rule.summary.format
      });
    }

    return testCase.up();
  }

};
