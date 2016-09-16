module.exports = function(grunt) {

	grunt.initConfig({
		preload_images: {
			files: {
				src: ["images/**/*"],
				dest: "styles/preload_images.css"
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
		},

		watch:{
			templates:{
				files: ["partials/**/*.html", "pages/**/*.html"],
				tasks: ['ngtemplates']
			},

			images:{
				files: ["images/**/*"],
				tasks: ['preload_images']
			}
		}
	});

	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['ngtemplates', 'preload_images', 'watch']);


	grunt.registerMultiTask('preload_images', 'Preload images with CSS2 body:after', function() {
		
		function clipPath(src, dest){
			var	path_src 	= src.split('/'),
				path_dest	= dest.split('/'),
				pos 		= 0,
				path_rel	= ''


			while(path_src[pos] == path_dest[pos])				{ pos++ }
			for(var i = 0; i < path_dest.length	- pos -1; i++)	{ path_rel += '../' }
			for(var i = 0; i < path_src.length 	- pos -1; i++)	{ path_rel += path_src[i]+'/' }

			path_rel += path_src[path_src.length -1]

			return path_rel
		}

		this.files.forEach(function(file) {
			var contents = file.src.filter(function(filepath) {

				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.')
					return false
				} else {
					return true
				}

			}).map(function(filepath){
				return "url(%1)".replace(/%1/, clipPath(filepath, file.dest))
			})
			.join(' ');

			grunt.file.write(file.dest, "body:after{ display:none; content: %1;}".replace(/%1/, contents))
			grunt.log.writeln('File "' + file.dest + '" created.')
		});
	})

};
