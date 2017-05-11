var copyfiles	= require('copyfiles'),
	fs 			= require('fs-extra'),
	rimraf		= require('rimraf'),
	config		= JSON.parse(fs.readFileSync('config/config.json', 'utf8')),
	taxonomy	= require('./config/taxonomy.js'),
	CleanCSS	= require('clean-css')


function setup(){
	return 	Promise.all([
				fs.emptyDir('dev'),
				fs.emptyDir('tmp')
			])
}


function compileTaxonomyTemplate(key, template){
	return 		fs.readFile(template, 'utf8')
				.then(function(template){
					return	taxonomy[key].map(function(item){
								if(!item.name) 					console.error('Taxonomy templates: Missing name:',key , item)
								if(item.name.match(/[^a-z_]/)) 	console.error('Taxonomy templates: Only lower case letters and "_" allowed in names:',key , item.name)
								return	template
										.replace(/{{name}}/g, 			item.name)
										.replace(/{{color\[([0-9]+)\]}}/g, 
											function(match, p1){
												var color = item.colors && item.colors[parseInt(p1)]
												if(!color) console.error('Taxonomy templates: missing color: {{color['+p1+']}}', item.name)

												return color
											}
										)
							})
							.join('\n\n')
				})
}


function compileTaxonomyTemplatesToTmp() {
	return	Promise.all([
				compileTaxonomyTemplate('categories', 	'src/styles/ic-category.template'),
				compileTaxonomyTemplate('types', 		'src/styles/ic-types.template')
			])
			.then(function(results){			 
				return 	fs.ensureDir('tmp/styles')
						.then(() => fs.writeFile('tmp/styles/taxonomy.css', results.join('\n\n'), 'utf8'))
			})
}



function compileIconsTemplatesToTmp(){
	return	Promise.all([
				fs.readFile('src/styles/ic-icon.template', 'utf8'),
				fs.readdir('src/images/icons')
			])
			.then(result => {
				var template	= 	result[0], 
					filenames 	= 	result[1].filter( (filename) => fs.lstatSync('src/images/icons/'+filename).isFile())
					preload		= 	'\n\nbody:before{\n display:none;\n content:'
									+ filenames.map( (fn) => '\turl(/images/icons/' + fn + ')' ).join('')
									+ ';\n}\n\n'


				return 	filenames.map(function(filename){

							var parts = filename.replace(/\..*/g, '').split('-')

							return 	template
									.replace(/{{([^{}[]]*)name\[([0-9]+)\]}}/g, function(match, p1, p2){
										var part = parts && parts[parseInt(p2)]

										return 	part
												?	p1+part
												:	''
									})
									.replace(/{{name}}/g, '/images/icons/'+filename)
						})
						.join('\n\n')
						+ preload 
			})
			.then( css => fs.ensureDir('tmp/styles').then( () => fs.writeFile('tmp/styles/icons.css', css , 'utf8')) )
}


function prepareFonts(){

	return 	Promise.all([
				fs.readFile("node_modules/typeface-biryani/index.css",	"utf8"),
				fs.copy("node_modules/typeface-biryani/files",			"dev/fonts/Biyarni"),
				fs.ensureDir("dev/styles")
			])
			.then( result	=> result[0].replace(/\.\/files/g, '/fonts/Biyarni'))
			.then( css 		=> fs.writeFile('tmp/styles/typeface-biryani.css', css, 'utf8'))
}





function copyFilesToDev(){
	return 	Promise.all([

				fs.copy("src/js", 			"dev/js"),
				fs.copy("src/pages",		"dev/pages"),
				fs.copy("src/partials",		"dev/partials"),
				fs.copy("src/images", 		"dev/images"),
				fs.copy("vendor.js", 		"dev/js/vendor.js"),
				
				//todo?
				fs.copy("config", 			"dev/config", {dereference: true}),
			])
}



function bundleStyles(src_dir, target_dir, filename){

	var	cleanCSS = new CleanCSS()

	return	fs.readdir(src_dir)
			.then(function(filenames){

				var filenames	=	filenames
									.map(function(fn){ 
										return 	fn.match(/\.css$/) 
												?	src_dir+'/'+fn
												:	undefined
									})
									.filter(function(x){ return !!x }),

					minify_result =	cleanCSS.minify(filenames)

				if(filenames.length == 0) return Promise.reject('bundleStyles: files missing.')


				return 	minify_result.errors.length
						?	Promise.reject(minify_result.errors)
						:	minify_result.styles
			})
			.then(function(css){
				return	fs.ensureDir(target_dir)
						.then(() => fs.writeFile(target_dir+'/'+filename, css, 'utf8'))
			})
}


function bundleStylesToDev(){

	return 	Promise.all([
				fs.copy("src/styles", "tmp/styles")					.then(() => bundleStyles('tmp/styles', 			'dev/styles', 'styles.css')),
				fs.copy("src/styles/initial", "tmp/styles/initial")	.then(() => bundleStyles('tmp/styles/initial', 	'dev/styles', 'initial.css'))
				
			])
}



function compileIndex(){

	return 	Promise.all([
				fs.readFile('src/index.html', 	'utf8'),
				fs.readFile('src/dev_head.html', 	'utf8')
			])
			.then(function(result){
				return	result[0]
						.replace(/CONFIG\.BACKEND\_LOCATION/g, 		config.backendLocation)
						.replace(/\s*<\!--\s*BUILD HEAD\s*-->/g, 	'\n'+result[1])
			})
			.then(function(content){
				return fs.writeFile('dev/index.html', content, 'utf8')				
			})
}




function cleanUp(){
	return fs.remove('tmp')
}

setup()

.then( () => console.log('\nCompiling taxonomy templates /tmp...'))
.then(compileTaxonomyTemplatesToTmp)
.then( () =>  console.log('Done.'))

.then( () => console.log('\n Compiling Icon templates /tmp...'))
.then(compileIconsTemplatesToTmp)
.then( () =>  console.log('Done.'))

.then( () => console.log('\n Preparing Fonts...'))
.then(prepareFonts)
.then( () =>  console.log('Done.'))


.then( () => console.log('\nCopying files copied to /dev...'))
.then(copyFilesToDev)
.then( () => console.log('Done.'))

.then( () => console.log('\nBudling styles into dev...'))
.then(bundleStylesToDev)
.then( () => console.log('Done.'))


.then( () => console.log('\nCompiling Index into dev...'))
.then(compileIndex)
.then( () =>  console.log('Done.'))



.then( () => console.log('\nCleaninng up...'))
.then(cleanUp)
.then( () => console.log('Done.'))


.then(
	()	=> console.log('\nAll done. \n'),
	e	=> console.trace(e)
)







