var copyfiles	= require('copyfiles'),
	fs 			= require('fs'),
	config		= JSON.parse(fs.readFileSync('config.json', 'utf8')),
	CleanCSS	= require('clean-css')

if(!fs.existsSync('dev')) fs.mkdir('dev')



copyfiles(["src/js/**/*.js", 			"dev/js"], 		 	2, function(){})
copyfiles(["src/pages/**/*.html", 		"dev/pages"], 		2, function(){})
copyfiles(["src/partials/**/*.html", 	"dev/partials"],	2, function(){})

copyfiles(["vendor.js", 				"dev/js"], 			0, function(){})
copyfiles(["config.json", 				"dev"], 			0, function(){})

// Fonts:
copyfiles(["node_modules/roboto-fontface/fonts/Roboto/*", 					"dev/fonts/Roboto"],	4, function(){})
copyfiles(["node_modules/roboto-fontface/css/roboto/roboto-fontface.css", 	"dev/styles/Roboto"],	4, function(){})




// Index:
var build_head 	= fs.readFileSync('src/dev_head.html', 'utf8')
	content 	= fs.readFileSync('src/index.html', 'utf8')


content = 	content
			.replace(/CONFIG\.BACKEND\_LOCATION/g, 		config.backendLocation)
			.replace(/\s*<\!--\s*BUILD HEAD\s*-->/g, 	'\n'+build_head)


fs.writeFileSync('dev/index.html', content, 'utf8')

// Styles:
if(!fs.existsSync('dev/styles')) fs.mkdir('dev/styles')

var	styles 				= 	fs.readdirSync('src/styles')
							.map(function(filename){ 
								return filename.match(/\.css$/) 
								?	'src/styles/'+filename
								:	undefined
							}).filter(function(x){ return !!x}),

	initial_styles 		= 	fs.readdirSync('src/styles/initial')
							.map(function(filename){ 
								return filename.match(/\.css$/) 
								?	'src/styles/initial/'+filename
								:	undefined
							}).filter(function(x){ return !!x})

							
var	cleanCSS			=	new CleanCSS({rebaseTo: 'dev/styles'}),
	min_styles 			= 	cleanCSS.minify(styles),
	min_initial_styles	= 	cleanCSS.minify(initial_styles)


console.log('Minified styles:')
min_styles.errors.forEach(function(error){ console.log(error) })
console.log(min_styles.stats)

fs.writeFileSync('dev/styles/styles.css', min_styles.styles, 'utf8')
console.log('\n-> dev/styles/styles.css \n\n')

console.log('Minified initial styles:')
min_initial_styles.errors.forEach(function(error){ console.log(error) })
console.log(min_initial_styles.stats)

fs.writeFileSync('dev/styles/initial.css', min_initial_styles.styles, 'utf8')
console.log('\n-> dev/styles/initial.css \n\n')


