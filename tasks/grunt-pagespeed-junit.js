/*
 * grunt-pagespeed-junit
 * https://github.com/jeremy-green/grunt-pagespeed-junit
 *
 * Copyright (c) 2015 Jeremy Green
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  grunt.registerTask('pagespeed_junit', 'Pagespeed to junit task runner for grunt.', function () {
    var done = this.async();
    var options = this.options({
      threshold: 60,
      strategy: 'mobile'
    });

    var request = require('request');
    var querystring = require('querystring')
    var async = require('async');
    var builder = require('xmlbuilder');

    var pages = options.pages;
    for (var i = 0; i < options.pages.length; i++) {
      pages[i].report = options.folder + 'gspi-' + pages[i].name.toLowerCase() + '.xml';
    }

    async.each(pages, _eachAsync, done);

    function _eachAsync(page, callback) {
      var params = {
        url: page.url,
        key: options.key,
        strategy: options.strategy
      };
      var q = querystring.stringify(params);
      var url = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?' + q;
      var failures = 0;
      
      request(url, function (error, response, body) {
        grunt.log.writeln('Running PageSpeed Insights on ' + page.url + '.');

        if (!error && response.statusCode === 200) {
          var b = JSON.parse(body);
          var stats = b.pageStats;
          var results = b.formattedResults;
          var ruleResults = results.ruleResults;

          var xml = builder.create('testsuites', {
            failures: '%%FAILURES%%',
            name: b.title,
            tests: Object.keys(ruleResults).length
          })
          .ele('testsuite', {
            failures: '%%FAILURES%%',
            name: b.title,
            tests: Object.keys(ruleResults).length
          })
          /*.ele('properties');

          [
            'kind',
            'id',
            'responseCode',
            'title',
            'ruleGroups'
          ].forEach(function(element, index, array) {
            xml = xml.ele('property', {
              name: element,
              value: b[element]
            }).up();
          });

          xml = xml.up();*/

          Object.keys(ruleResults).forEach(function(key, index) {
            var val = ruleResults[key];
            var blocks = val.urlBlocks;

            var name = '[GSPI]' + page.name + ' ' + val.localizedRuleName;
            var tc = xml.ele('testcase', {
              assertions: 1,
              classname: name,
              name: name,
              status: val.ruleImpact,
              time: ''
            });

            if (parseFloat(val.ruleImpact) > 0) {
              failures++;
              tc.ele('failure', {
                message: val.summary.format
              });
            }

            var impact = 'Rule Impact: ' + val.ruleImpact + '\n';

if (blocks !== undefined) {

            blocks.forEach(function(element) {

              var format = element.header.format;
              var args = element.header.args;

              if (typeof args !== 'undefined' && args.length > 0) {
                args.forEach(function(arg, i) {
                  arg.value = arg.value.replace(/&/g, '&amp;')
                                       .replace(/"/g, '&quot;')
                                       .replace(/'/g, '&#39;')
                                       .replace(/</g, '&lt;')
                                       .replace(/>/g, '&gt;');

                  if (arg.type !== 'HYPERLINK') {
                    format = format.replace('$' + (i+1).toString(), arg.value);
                  } else {
                    format += ' [' + args[0].value + ']';
                  }
                });
                impact += format + '\n';
              }

              if (typeof element.urls !== 'undefined') {
                args = element.urls;
                args.forEach(function(arg, i) {
                  format = arg.result.format;
                  var a = arg.result.args;
                  a.forEach(function(elem, iterator) {
                    elem.value = elem.value.replace(/&/g, '&amp;')
                                           .replace(/"/g, '&quot;')
                                           .replace(/'/g, '&#39;')
                                           .replace(/</g, '&lt;')
                                           .replace(/>/g, '&gt;');

                    format = format.replace('$' + (iterator+1).toString(), elem.value);
                  });
                  impact += format + '\n';

                });

              }

            });
}


            tc.ele('system-out', {}, impact);
            xml = tc.up();

          });

          var output = xml.end({pretty: true}).replace(/%%FAILURES%%/g, failures.toString());
          grunt.file.write(page.report, output);
          grunt.log.writeln('Page score: ' + b.score);
          grunt.log.writeln('Total failures: ' + failures);
          grunt.log.writeln('>> File: ' + page.report + ' created.');

        } else {
          grunt.fail.warn('Error retrieving results.');
        }
        callback();
      });
    };


  });
};
