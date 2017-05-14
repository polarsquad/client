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
				compileTaxonomyTemplate('categories', 	'src/styles/templates/ic-category.template'),
				compileTaxonomyTemplate('types', 		'src/styles/templates/ic-types.template')
			])
			.then(function(results){			 
				return 	fs.ensureDir('tmp/styles')
						.then(() => fs.writeFile('tmp/styles/taxonomy.css', results.join('\n\n'), 'utf8'))
			})
}


function images2Css(src_folder, dst_folder, template_file, preload){
	return	Promise.all([
				fs.readFile(template_file, 'utf8'),
				fs.readdir(src_folder)
			])
			.then(result => {
				var template	= 	result[0], 
					filenames 	= 	result[1].filter( (filename) => fs.lstatSync(src_folder+'/'+filename).isFile())
					preload		= 	preload
									?	'\n\nbody:before{\n display:none;\n content:'
										+ filenames.map( (fn) => '\turl(dst_folder' + fn + ')' ).join('')
										+ ';\n}\n\n'
									: ''



				return 	filenames.map(function(filename){

							var parts = filename.replace(/\..*/g, '').split('-')

							return 	template
									.replace(/{{([^{}[]]*)name\[([0-9]+)\]}}/g, function(match, p1, p2){
										var part = parts && parts[parseInt(p2)]

										return 	part
												?	p1+part
												:	''
									})
									.replace(/{{name}}/g, dst_folder+'/'+filename)
						})
						.join('\n\n')
						+ preload 
			})
}

function compileIconsTemplatesToTmp(){
	return	images2Css('src/images/icons', '/images/icons/', 'src/styles/templates/ic-icon.template', true)
			.then( css => fs.ensureDir('tmp/styles').then( () => fs.writeFile('tmp/styles/icons.css', css , 'utf8')) )
}

function compileImageTemplatesToTmp(){
	return	images2Css('src/images/large', '/images/large', 'src/styles/templates/ic-image.template')
			.then( css => fs.ensureDir('tmp/styles').then( () => fs.writeFile('tmp/styles/images.css', css , 'utf8')) )
}


function prepareBiyarni(){

	return 	Promise.all([
				fs.readFile("node_modules/typeface-biryani/index.css",	"utf8"),
				fs.copy("node_modules/typeface-biryani/files",			"dev/fonts/Biyarni"),
				fs.ensureDir("dev/styles")
			])
			.then( result	=> result[0].replace(/\.\/files/g, '/fonts/Biyarni'))
			.then( css 		=> fs.writeFile('tmp/styles/biryani.css', css, 'utf8'))
}


function prepareRoboto(){

	return 	Promise.all([
				fs.readFile("node_modules/roboto-fontface/css/roboto/roboto-fontface.css",	"utf8"),
				fs.copy("node_modules/roboto-fontface/fonts/Roboto",		"dev/fonts/Roboto"),
				fs.ensureDir("dev/styles")
			])
			.then( result	=> result[0].replace(/\.\.\/\.\.\/fonts\/Roboto/g, '/fonts/Roboto'))
			.then( css 		=> fs.writeFile('tmp/styles/roboto.css', css, 'utf8'))
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
				var index	= result[0],
					head 	= result[1]

				head = head.replace(/CONFIG/g, JSON.stringify(config))	

				return	index
						.replace(/CONFIG\.BACKEND\_LOCATION/g, 		config.backendLocation)
						.replace(/\s*<\!--\s*BUILD HEAD\s*-->/g, 	'\n'+head)
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


.then( () => console.log('\nCompiling icon templates /tmp...'))
.then(compileIconsTemplatesToTmp)
.then( () =>  console.log('Done.'))


.then( () => console.log('\nCompiling image templates /tmp...'))
.then(compileImageTemplatesToTmp)
.then( () =>  console.log('Done.'))


.then( () => console.log('\nPreparing Biyarni...'))
.then(prepareBiyarni)
.then( () =>  console.log('Done.'))


.then( () => console.log('\nPreparing Roboto...'))
.then(prepareRoboto)
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







