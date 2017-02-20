function prefix(pre, a){
	return  a.map(function(item){
				return pre+'/'+item
			})
}

module.exports = function(grunt) {


	grunt.loadTasks('grunt_tasks')

	grunt.loadNpmTasks('grunt-contrib-copy')
	grunt.loadNpmTasks('grunt-svgmin')
	grunt.loadNpmTasks('grunt-contrib-uglify')
	grunt.loadNpmTasks('grunt-contrib-cssmin')
	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-string-replace')
	grunt.loadNpmTasks('grunt-angular-templates')
	grunt.loadNpmTasks('grunt-svg-sprite')
	grunt.loadNpmTasks('grunt-bower')


	grunt.initConfig({


		paths:{
			bower:  'bower_components',
			src:    'src',
			dist:   'dist',
			dev:    'dev',
		},

		filenames: {
			scripts:            'scripts.min.js',
			initial_scripts:    'initial_scripts.min.js',
			styles:             'styles.min.css',
			initial_styles:     'initial_styles.min.css',
			preload_images:		'ic-init.js',
			templates:			'ic-templates.js',
		},



		scripts: [
			'**/angular.js',
			'**/angular-sanitize.js',
			'**/angular-translate.js',
			'**/qrcode.js',
			'**/qrcode_UTF8.js',
			'**/angular-qrcode.js',
			'**/leaflet.js',
			'**/leaflet.markercluster.js',
			'**/ic-api.js',
			'**/pl-images.js',
			'**/ic-init.js',
			'**/ic-directives.js',
			'**/ic-map-module.js',
			'**/ic-services.js',
			'**/smlLayout.js',
			'**/ic-module.js',
			'**/app.js',
		],


		styles: [
			'**/leaflet.css',
			'**/MarkerCluster.css',
			'**/typography_and_colors.css',
			'**/layout.css',
			'**/partials.css',
			'**/map.css',
			// '**/print.css',          
		],

		initial_styles: [
			'**/roboto-fontface.css',
			'**/critical.css'
		],



		'copy': {
			
			dev: {
				files: [
					{expand: true, flatten: true, cwd: '<%= paths.bower %>',    src: '<%= scripts %>',          			dest: '<%= paths.dev %>/js'},
					{expand: true, flatten: true, cwd: '<%= paths.bower %>',    src: '<%= styles %>',          			 	dest: '<%= paths.dev %>/styles'},
					{expand: true, flatten: true, cwd: '<%= paths.bower %>',    src: '**/Roboto/*', 	          			dest: '<%= paths.dev %>/fonts/Roboto'},
					{expand: true, flatten: true, cwd: '<%= paths.bower %>',    src: '<%= initial_styles %>',   			dest: '<%= paths.dev %>/styles'},
					{expand: true, flatten: true, cwd: '<%= paths.src %>',      src: ['images/**/*', '!images/**/*.svg'],	dest: '<%= paths.dev %>/images'},
					{expand: true, flatten: true, cwd: '<%= paths.src %>',      src: '<%= scripts %>',          			dest: '<%= paths.dev %>/js'},
					{expand: true, flatten: true, cwd: '<%= paths.src %>',      src: '<%= styles %>',           			dest: '<%= paths.dev %>/styles'},
					{expand: true, flatten: true, cwd: '<%= paths.src %>',      src: '<%= initial_styles %>',   			dest: '<%= paths.dev %>/styles'},
				]
			},

			dist: {
				files: [
					{expand: true, cwd: '<%= paths.dev %>/fonts',       src: ['**/*'],  dest: '<%= paths.dist %>/fonts'},
					{expand: true, cwd: '<%= paths.dev %>/images',      src: ['**/*'],  dest: '<%= paths.dist %>/images'},
				]
			},
		},


		'svgmin': {
			options: {
				plugins: [
					{
						removeTitle: true,

						removeAttrs: {
							attrs: ['xmlns']
						}
					}, 
				]
			},

			dev: {
				files: [
					{expand: true, flatten: true, cwd: '<%= paths.src %>',	src: 'images/**/*.svg',	dest: '<%= paths.dev %>/images'},
				]
			}
		},




		'ngtemplates': {
			options: {
				module: "InfoCompass",
				htmlmin: {
					collapseBooleanAttributes:      true,
					collapseWhitespace:             true,
					removeAttributeQuotes:          true,
					removeComments:                 true,
					removeEmptyAttributes:          true,
					removeRedundantAttributes:      true,
					removeScriptTypeAttributes:     true,
					removeStyleLinkTypeAttributes:  true
				}
			},

			dev:{
				cwd:    '<%= paths.src %>',
				src:    ["partials/**/*.html", "pages/**/*.html"],
				dest:   "<%= paths.dev %>/js/<%= filenames.templates %>"
			}

		},


		'uglify': {

			scripts: {

				options: {
					preserveComments: false,
				},  

				
				src: 	['<%= scripts %>', '<%= paths.dev %>/js/<%= filenames.templates %>'],
				dest: 	'<%= paths.dist %>/js/<%= filenames.scripts %>',
				filter: function(filepath) {
							var regex = new RegExp("^"+grunt.template.process('<%= paths.dev %>'))
							return filepath.match(regex)
						}
			},

		},




		'cssmin': {
			styles: {
				files:[
					{
						src: 	['<%= styles %>'],
						dest:	'<%= paths.dist %>/styles/<%= filenames.styles %>',
						filter: function(filepath) {
							console.log(filepath)
							var regex = new RegExp("^"+grunt.template.process('<%= paths.dev %>'))
							return filepath.match(regex)
						}
					},
					{ 
						src: '<%= initial_styles %>',   
						dest: '<%= paths.dist %>/styles/<%= filenames.initial_styles %>' ,
						filter: function(filepath) {
							var regex = new RegExp("^"+grunt.template.process('<%= paths.dev %>'))
							return filepath.match(regex)
						}
					}
				]
			}
		},



		'preload_images': {
			dev: {
				src: 		['<%= paths.dev %>/images/**/*'],
				dest: 	'<%= paths.dev %>/js/<%= filenames.preload_images %>'
			}
		},




		'string-replace': {

			dev: {

				src:        '<%= paths.src %>/index.html',
				dest:       '<%= paths.dev %>/index.html',

				options: {
					replacements: [
						{
							pattern:        /<!--Grunt head-->/,
							replacement:    function(){
												var templates		= grunt.template.process('<%= filenames.templates %>'),
													head 			= '\n'

												grunt.file.expand({cwd: 'dev'},grunt.config.data.initial_styles)
												.forEach(function(abs_path){
													var filename = abs_path.replace(/.*\//g,'')
													head += '\t\t<link href = "styles/'+filename+'" type="text/css" rel = "stylesheet"/>\n'
												})

												head +='\n'


												grunt.file.expand({cwd: 'dev'}, grunt.config.data.styles)
												.forEach(function(abs_path){
													var filename = abs_path.replace(/.*\//g,'')
													head += '\t\t<link href = "styles/'+filename+'" type="text/css" rel = "stylesheet"/>\n'
												})

												head +='\n'

												grunt.file.expand({cwd: 'dev'}, grunt.config.data.scripts)
												.forEach(function(abs_path){
													var filename = abs_path.replace(/.*\//g,'')
													head += '\t\t<script src = "js/'+filename+'"></script>\n'
												})


												head += '\t\t<script src = "js/'+templates+'"></script>\n'

												head += "\n\t\t<script>angular.element(function(){angular.bootstrap(document, ['InfoCompass'])})</script>\n"

												return head
											}
						},
					]
				}
			},

			dist: {

				src:        '<%= paths.src %>/index.html',
				dest:       '<%= paths.dist %>/index.html',

				options: {
					replacements: [
						{
							pattern:        /<!--Grunt head-->/,
							replacement:    function(){
												var src 		= 	grunt.template.process('<%= paths.src %>'),
													template	=	grunt.file.read(src+'/dist_head.html'),
													head		=	grunt.template.process(template)

												return head
											}
						},
					]
				}
			},
		},

		
		// svg_sprite: {

		// 		icons: {
		// 				src:    ['<%= paths.dist %>images/icon*.svg'],
		// 				dest:   '<%= paths.dist %>/images',
		// 				options:    {
		// 					mode: {
		// 						stack: {
		// 							dest: '',
		// 							sprite: 'icons.svg',
		// 						}
		// 					}               
		// 				},
		// 		},
		// },




		

		watch:{
			dev: {
				files:	['<%= paths.src %>/**/*','<%= paths.bower %>/**/*'],
				tasks:	['dev']
			},
			

		},

	})


	grunt.registerTask('scripts',   ['uglify:scripts'])
	grunt.registerTask('styles',    ['cssmin:styles' ])
	grunt.registerTask('assets',    ['copy:fonts', 'copy:images'])


	grunt.registerTask('ic_index',          ['string-replace:index'])
	grunt.registerTask('ic_icons',          ['svg_sprite:icons'])
	grunt.registerTask('ic_images',         ['preload_images'])
	grunt.registerTask('infocompass',       ['ic_icons', 'ic_images', 'ic_index'])

	grunt.registerTask('dev',[
		'copy:dev',
		'svgmin:dev',
		'preload_images:dev',
		'ngtemplates:dev',
		'string-replace:dev'
	])


	grunt.registerTask('dist',[
		'dev',
		'copy:dist',
		'uglify:scripts',
		'cssmin:styles',
		'string-replace:dist'
	])

	grunt.registerTask('install', [
		'bower', 
		'dist'
	])

	grunt.registerTask('default', ['watch'])


}
