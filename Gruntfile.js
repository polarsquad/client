module.exports = function(grunt) {

	grunt.initConfig({
		watch:{
			templates:{
				files: ["partials/**/*.html", "pages/**/*.html"],
				tasks: ['ngtemplates']
			},

			images:{
				files: ['styles/**/*.css'],
				tasks: ['img_preload']
			}
		},

		img_preload: {
				my_target: {
				files: {
					'styles/preload-images.css': ['styles/**/*.css']
				}
			}
		},

		ngtemplates: {
				myapp: {
						options: {
							module: "InfoCompass",
							htmlmin: {
								// collapseBooleanAttributes:      true,
								// collapseWhitespace:             true,
								// removeAttributeQuotes:          true,
								// removeComments:                 true,
								// removeEmptyAttributes:          true,
								// removeRedundantAttributes:      true,
								// removeScriptTypeAttributes:     true,
								// removeStyleLinkTypeAttributes:  true
							}
						},
						src: ["partials/**/*.html", "pages/**/*.html"],
						dest: "partials/templates.js"
				}
		}
	});

	grunt.loadNpmTasks('grunt-img-preload');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['ngtemplates', 'img_preload', 'watch']);

};
