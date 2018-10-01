"use strcit";


var copyfiles	= 	require('copyfiles'),
	fs 			= 	require('fs-extra'),
	rimraf		= 	require('rimraf'),
	CleanCSS	= 	require('clean-css'),
	UglifyJS 	= 	require("uglify-js"),
	SVGO		= 	require('svgo'),
	Promise		=	require('bluebird'),
	cleanCSS 	= 	new CleanCSS()
	svgo		= 	new SVGO({
						plugins: [
							{removeTitle:					true},
							{removeDimensions:				true},
						]
					}),
	ins			=	process.argv[2],
	cst			=	process.argv[2] && 'custom/'+process.argv[2],
	dst			=	process.argv[3] ? "build/"+process.argv[3] : 'dev',
	src			=	'tmp/src'

	taxonomy	= 	cst
					?	require('./'+cst+'/js/config/taxonomy.js')
					:	require('./src/js/config/taxonomy.js'),

	config		=	cst
					?	JSON.parse(fs.readFileSync(cst+'/config.json', 'utf8'))
					:	JSON.parse(fs.readFileSync('config/config.json', 'utf8')),

	preloadImg	=	[],

	build 		= 	Date.now(),

	styles_dir	=	'styles_'+build,
	js_dir		= 	'js_'+build


console.log('Build: ', build)

function done(all){
	all
	?	process.stdout.write('\x1b[32m\n*** All done.\n\x1b[0m')
	:	process.stdout.write('\x1b[32m Done.\n\x1b[0m')
}


function setup(){

	return 	Promise.all([
				cst && fs.stat(cst),
				fs.emptyDir(dst),
				fs.emptyDir('tmp')
			])
			.then( ()	=> 	fs.writeFile(dst+'/build', build, 'utf8'))
			.then( ()	=>	fs.copy('src',  	'tmp/src'))
			.then( () 	=> 	cst 
							?	fs.copy(cst,	'tmp/src', {overwrite: true})
							:	Promise.resolve()
			)

}






function copyQRCodeScriptsSrcToTmp(){
	return 	fs.ensureDir(src+'/js')
			.then( () => Promise.all([
				fs.copy('node_modules/qrcode-generator/qrcode_UTF8.js', 	src+'/js/qrcode_UTF8.js'),
				fs.copy('node_modules/qrcode-generator/qrcode.js', 			src+'/js/qrcode.js'),
				fs.copy('node_modules/angular-qrcode/angular-qrcode.js', 	src+'/js/angular-qrcode.js')
			]))
}

function bundleScriptsToDst(){


	return	Promise.props({
				"vendor.js":					fs.readFile('vendor.js', 							'utf8'),
				"taxonomy.js": 					fs.readFile(src+'/js/config/taxonomy.js', 			'utf8'),
				"dpd-items.js": 				fs.readFile(src+'/js/dpd/dpd-item.js', 				'utf8'),
				"dpd-item-storage.js": 			fs.readFile(src+'/js/dpd/dpd-item-storage.js', 		'utf8'),
				"ic-preload.js": 				fs.readFile(src+'/js/ic-preload.js', 				'utf8'),
				"ic-layout.js": 				fs.readFile(src+'/js/ic-layout.js', 				'utf8'),
				"ic-services.js": 				fs.readFile(src+'/js/ic-services.js', 				'utf8'),
				"ic-directives.js": 			fs.readFile(src+'/js/ic-directives.js',				'utf8'),
				"ic-filters.js": 				fs.readFile(src+'/js/ic-filters.js', 				'utf8'),
				"ic-ui-directives.js": 			fs.readFile(src+'/js/ic-ui-directives.js', 			'utf8'),
				"ic-map-module.js": 			fs.readFile(src+'/js/ic-map-module.js', 			'utf8'),
				"custom.js":					fs.readFile(src+'/js/custom.js',					'utf8').catch( (e) => console.log('skipping custom.js') || ''),
				"app.js": 						fs.readFile(src+'/js/app.js', 						'utf8'),


				"qrcode.js": 					fs.readFile(src+'/js/qrcode.js', 					'utf8'),
				"qrcode_UTF8.js": 				fs.readFile(src+'/js/qrcode_UTF8.js', 				'utf8'),
				"angular-qrcode.js": 			fs.readFile(src+'/js/angular-qrcode.js', 			'utf8'),
			})
			.then( files	=> UglifyJS.minify(files , { sourceMap: {url: "scripts.js.map"}} ))
			.then( result 	=> {
									if(result.error) return console.log(result.error) 

									return 	fs.ensureDir(dst+'/'+js_dir)
											.then( () => 	Promise.all([
																fs.writeFile(dst+'/'+js_dir+'/scripts.js', result.code, 'utf8'),
																fs.writeFile(dst+'/'+js_dir+'/scripts.js.map', result.map, 'utf8')
															])
											)
								},
					e		=> console.error(e)
			)
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
												var color = item.colors && item.colors[parseInt(p1)] || '#999988'
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
				compileTaxonomyTemplate('categories', 	src+'/styles/templates/ic-category.template'),
				compileTaxonomyTemplate('types', 		src+'/styles/templates/ic-types.template')
			])
			.then(function(results){			 
				return 	fs.ensureDir('tmp/styles')
						.then(() => fs.writeFile('tmp/styles/taxonomy.css', results.join('\n\n'), 'utf8'))
			})
}

function svgColors(src_folder, dest_folder, config){
	return	Promise.resolve( fs.ensureDir(dest_folder) )
			.then( 	() 			=> 	fs.readdir(src_folder) )
			.filter(filename 	=> 	filename.match(/\.svg$/) && fs.lstatSync(src_folder+'/'+filename).isFile()	)	
			.map(	filename 	=>	Promise.props({ 
										name: 		filename, 
										content : 	fs.readFile(src_folder+'/'+filename, 'utf8')
									})  
			)
			.map(	file 		=> 	Promise.each( 
										config.colors, 
										color => {
											var fn = 	color.name
														?	file.name.replace(/\.svg$/,'-'+color.name+'.svg')
														:	file.name

													return fs.writeFile(dest_folder+'/'+fn, file.content.replace(new RegExp(config.replace, "g"), color.value), 'utf8')
										}
									)
			)

			
}

function svgMinimize(src_folder, dest_folder){
	return	fs.ensureDir(dest_folder)
			.then( () => fs.readdir(src_folder) )
			.then( result => result.filter( (filename) => filename.match(/\.svg$/) && fs.lstatSync(src_folder+'/'+filename).isFile()) )
			.then( (filenames) => Promise.all(
				filenames.map( (filename) => {
					return	fs.readFile(src_folder+'/'+filename, 'utf8')
							.then( content => new Promise( resolve => svgo.optimize(content, resolve) ) )
							.then( result => fs.writeFile(dest_folder+'/'+filename, result.data, { flag : 'w', encoding: 'utf8'}))
				})				
			))
}

function imagesToCss(src_folder, dst_folder, template_file, preload){

	return	Promise.all([
				fs.readFile(template_file, 'utf8'),
				fs.readdir(src_folder)
			])
			.then(result => {
				var template	= 	result[0], 
					filenames 	= 	result[1].filter( (filename) => fs.lstatSync(src_folder+'/'+filename).isFile())

				if(preload) filenames.forEach( fn =>  preloadImg.push(dst_folder+'/'+ fn) )

				return 	filenames.map( filename  => Promise.props({
							template: 	template,
							name: 		filename,
							svg: 		filename.match(/.svg$/) ? fs.readFile(src_folder+'/'+filename, 'utf8') : undefined
						}))
			})
			.map( ({template, name, svg}) => {

				var parts 	= name.replace(/\..*/g, '').split('-'),
					svg		= encodeURIComponent( (svg || '').replace(/"/g,"'"))


				return 	template
						.replace(/{{([^{}[]]*)name\[([0-9]+)\]}}/g, function(match, p1, p2){
							var part = parts && parts[parseInt(p2)]

							return 	part
									?	p1+part
									:	''
						})
						.replace(/{{name}}/g, dst_folder+'/'+name)
						.replace(/{{svg}}/g, svg)
			})
			.then( templates => templates.join('\n\n') )
}


function preloadImagesTmp(){
	return 	Promise.resolve()
			.then( () => fs.ensureDir('tmp/json') )
			.then( () => fs.writeFile('tmp/json/preload-images.json', JSON.stringify(preloadImg) ))
}



function preloadNgTemplatesTmp(){
	return	Promise.all([
				Promise.map(fs.readdir(src+'/partials'), 	filename => 'partials/'+filename),
				Promise.map(fs.readdir(src+'/pages'),		filename => 'pages/'+filename),
				fs.ensureDir('tmp/json')
			])
			.then(	([partials, pages])	=> [].concat(partials, pages) )
			.map(	filename 			=> Promise.props({ name: filename, content : fs.readFile(src+'/'+filename, 'utf8')} ) )
			.then(	files				=> fs.writeFile('tmp/json/preload-templates.json', JSON.stringify(files) ) )

}



function compileIconsSrcToTmp(){
	return 	svgColors(src+'/images/raw_icons', 'tmp/images/icons', {
				replace: '#000000',
				colors: [
					{name: null,		value: '#000000'},
					{name: 'active',	value: config.activeIconColor 	|| '#802651'},
					{name: 'plain',		value: config.plainIconColor	|| '#979797'},
					{name: 'white',		value: '#ffffff'},
				]
			})
}

function compileMarkersSrcToTmp(){
	return 	svgColors(src+'/images/raw_markers', 'tmp/images/icons', {
				replace: '#7F7F7F',
				colors: [
							...(taxonomy.categories.map(	category 	=> { return {name: category.name, 	value: category.colors[0] 	|| '#999988' } })),
							...(taxonomy.types.map( 		type 		=> { return {name: type.name, 		value: type.colors[0] 		|| '#999988' } })),
							{name: 'unknown', value: '#999988'}
						]
			})
}


function compileIconTemplatesTmpToTmp(){
	return	imagesToCss('tmp/images/icons', '/images/icons', src+'/styles/templates/ic-icon.template', false)
			.then( css => fs.ensureDir('tmp/styles').then( () => fs.writeFile('tmp/styles/icons.css', css , 'utf8')) )
}

function compileImageTemplatesSrcToTmp(){
	return	imagesToCss(src+'/images/large', '/images/large', src+'/styles/templates/ic-image.template', true)
			.then( css => fs.ensureDir('tmp/styles').then( () => fs.writeFile('tmp/styles/images.css', css , 'utf8')) )
}


function prepareBiyarni(){

	return 	Promise.all([
				fs.readFile("node_modules/typeface-biryani/index.css",	"utf8"),
				fs.copy("node_modules/typeface-biryani/files",			dst+"/fonts/Biyarni"),
				fs.ensureDir('tmp/styles')
			])
			.then( result	=> result[0].replace(/\.\/files/g, '/fonts/Fira-Sans'))
			.then( css 		=> fs.writeFile('tmp/styles/biryani.css', css, 'utf8'))
}


function prepareFira(){
	return 	Promise.all([
				fs.readFile("node_modules/typeface-fira-sans/index.css",	"utf8"),
				fs.copy("node_modules/typeface-fira-sans/files",			dst+"/fonts/Fira-Sans"),
				fs.ensureDir('tmp/styles')
			])
			.then( result	=> result[0].replace(/\.\/files/g, '/fonts/Fira-Sans'))
			.then( css 		=> fs.writeFile('tmp/styles/fira-sans.css', css, 'utf8'))
}


function prepareRoboto(){

	return 	Promise.all([
				fs.readFile("node_modules/roboto-fontface/css/roboto/roboto-fontface.css",	"utf8"),
				fs.copy("node_modules/roboto-fontface/fonts/Roboto",		dst+"/fonts/Roboto"),
				fs.ensureDir('tmp/styles')
			])
			.then( result	=> result[0].replace(/\.\.\/\.\.\/fonts\/Roboto/g, '/fonts/Roboto'))
			.then( css 		=> fs.writeFile('tmp/styles/roboto.css', css, 'utf8'))
}


function prepareFonts(){
	return 	Promise.all([
				prepareRoboto,
				prepareFira,
				prepareBiyarni
			])
			.then( () => console.log("\n\n#####CHECK FONTS!!\n"))

}

function copyFilesSrcToTmp(){
	return 	Promise.all([
				fs.copy(src+'/images/icons', 	"tmp/images/icons")
			])
}

function createConfigJson(){
	return 	Promise.resolve()
			.then( () => fs.ensureDir('tmp/json'))
			.then( () => fs.writeFile('tmp/json/config.json', JSON.stringify(config) ) )
}



function copyReadyFilesToDst(){
	return 	Promise.all([

				fs.copy(src+"/images/large", 	dst+"/images/large"),
				fs.copy(src+"/js/worker", 		dst+'/worker'),

				// fs.copy("vendor.js", 		dst+"/js/vendor.js"),
				
				//tmp
				fs.copy("tmp/images", 			dst+"/images"),
				fs.copy("tmp/json",				dst)
			])
}



function bundleStyles(src_dir, target_dir, filename){

	return	fs.readdir(src_dir)
			.then(function(filenames){

				var filenames		=	filenames
										.sort()
										.map(function(fn){ 
											return 	fn.match(/\.css$/) 
													?	src_dir+'/'+fn
													:	undefined
										})
										.filter(function(x){ return !!x }),

					minify_result 	=	cleanCSS.minify(filenames)


				return 	minify_result.errors.length
						?	Promise.reject(minify_result.errors)
						:	minify_result.styles
			})
			.catch( function(e){
				if(e.syscall == 'scandir' && e.errno == -2) return ""	
				return Promise.reject(e)			
			})
			.then(function(css){
					return	fs.ensureDir(target_dir)
							.then(() => fs.writeFile(target_dir+'/'+filename, css, 'utf8'))
			})
}


function bundleStylesToDst(){

	return 	Promise.all([
				fs.copy(src+"/styles", 									"tmp/styles"),	
				fs.copy("node_modules/leaflet/dist/leaflet.css", 		"tmp/styles/leaflet.css"),
				fs.copy(src+'/styles/initial', 							"tmp/styles/initial")
			])
			.then( () => Promise.all([
				bundleStyles('tmp/styles/initial', 	dst+'/'+styles_dir, 'initial.css'),
				bundleStyles('tmp/styles', 			'tmp/bundle', '0_styles.css'),
				bundleStyles('tmp/styles/last', 	'tmp/bundle', '1_last.css')
			]))
			.then( () => {
				bundleStyles('tmp/bundle', dst+'/'+styles_dir, 'styles.css')
			})
			.catch(console.log)

}

function compileIndex(){

	return 	Promise.all([
				fs.readFile(src+'/index.html', 				'utf8'),
				fs.readFile(src+'/dev_head.html', 			'utf8'),
				fs.readFile(src+'/ic-loading-screen.html', 	'utf8')
			])
			.spread( (index, head, loading_screen, partials, pages) => {

				return	index
						.replace(/\s*<\!--\s*BUILD HEAD\s*-->/g, 			'\n'+head)
						.replace(/\s*<\!--\s*BUILD LOADING-SCREEN\s*-->/g, 	'\n'+loading_screen)
						.replace(/CONFIG\.TITLE/g, 							config.title)
						.replace(/CONFIG\.DESCRIPTION/g, 					config.description || '')
						.replace(/CONFIG\.BACKEND\_LOCATION/g, 				config.backendLocation)
						.replace(/CONFIG\.FRONTEND\_LOCATION/g, 			config.frontendLocation || '')
						.replace(/DIR.STYLES/g,								styles_dir)
						.replace(/DIR.JS/g,									js_dir)
						.replace(/BUILD/g,									build)

			})
			.then( content => fs.writeFile(dst+'/index.html', content, 'utf8') )
}


function minimizeSvgIconsTmp(){
	return svgMinimize('tmp/images/icons', 'tmp/images/icons')
}


function copyPromiscuousForIE(){
	return fs.copy("node_modules/promiscuous/promiscuous-browser-full.js",	dst+"/"+js_dir+"/"+"promiscuous-browser-full.js")
}


function cleanUp(){
	return fs.remove('tmp')
}



setup()


.then( () => process.stdout.write('\nCopying qr code scripts from src to '+dst+' ...'))
.then(copyQRCodeScriptsSrcToTmp)
.then( () => done() )


.then( () => process.stdout.write('\nCopying files from src to /tmp for further processing ...'))
.then(copyFilesSrcToTmp)
.then( () => done() )



.then( () => process.stdout.write('\nCompiling raw icons from src to /tmp for further processing ...'))
.then(compileIconsSrcToTmp)
.then( () => done() )


.then( () => process.stdout.write('\nCompiling raw markers from src to /tmp for further processing ...'))
.then(compileMarkersSrcToTmp)
.then( () => done() )


.then( () => process.stdout.write('\nMinimizing SVG icons in  in /tmp...'))
.then(minimizeSvgIconsTmp)
.then( () => done() )


.then( () => process.stdout.write('\nCompiling icon templates for icons in /tmp into /tmp for further processing ...'))
.then(compileIconTemplatesTmpToTmp)
.then( () => done() )


.then( () => process.stdout.write('\nCompiling taxonomy templates into /tmp for further processing ...'))
.then(compileTaxonomyTemplatesToTmp)
.then( () => done() )



.then( () => process.stdout.write('\nCompiling image templates for images in src into /tmp for further processing ...'))
.then(compileImageTemplatesSrcToTmp)
.then( () => done() )


.then( () => process.stdout.write('\nCompiling collecting images in json for later preloading into /tmp for further processing ...'))
.then( preloadImagesTmp)
.then( () => done() )


.then( () => process.stdout.write('\nCompiling collecting ng-templates in json for later preloading  styles into /tmp for further processing ...'))
.then( preloadNgTemplatesTmp)
.then( () => done() )


.then( () => process.stdout.write('\nPreparing Fonts...'))
.then(prepareFonts)
.then( () => done() )


.then( () => process.stdout.write('\ncreating config.json in /tmp...'))
.then(createConfigJson)
.then( () => done() )


.then( () => process.stdout.write('\nCopying ready files to '+dst+'...'))
.then(copyReadyFilesToDst)
.then( () => done() )


.then( () => process.stdout.write('\nBuidling styles into '+dst+'...'))
.then(bundleStylesToDst)
.then( () => done() )



.then( () => process.stdout.write('\nBuidling scripts into '+dst+'...'))
.then(bundleScriptsToDst)
.then( () => done() )




.then( () => process.stdout.write('\nCompiling Index into '+dst+'...'))
.then(compileIndex)
.then( () => done() )




.then( () => process.stdout.write('\nCopying IE stuff into '+dst+'...'))
.then(copyPromiscuousForIE)
.then( () => done() )




// .then( () => process.stdout.write('\nCleaninng up...'))
// .then(cleanUp)
// .then( () => process.stdout.write('\x1b[32m Done.'))


.then(
	()	=> done(true),
	e	=> console.trace(e)
)







