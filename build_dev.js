var copyfiles	= require('copyfiles'),
	fs 			= require('fs'),
	rimraf		= require('rimraf'),
	config		= JSON.parse(fs.readFileSync('config/config.json', 'utf8')),
	taxonomy	= require('./config/taxonomy.js'),
	CleanCSS	= require('clean-css')


function whenFn(fn_with_callback, params){

	params = params || []

	return function(){
		return 	new Promise(function(resolve, reject){
					params.push(function(e,result){
						if(e){
							reject(e)
						} else {
							resolve(result)
						}
					})
					fn_with_callback.apply(null, params)
				})
	}
}

function when(fn_with_callback, params){
	return whenFn(fn_with_callback, params)()
}


function ascDir(path){

	var p 		= Promise.resolve(),
		path	= path.split('/')


	path.forEach(function(section, index){
		var sub_path = path.slice(0,index+1).join('/')

		p = p
			.then(whenFn(fs.mkdir, [sub_path]))
			.catch(function(e){
				if(e.code == 'EEXIST') return Promise.resolve()
			})
	})	

	return p
}





function setup(){
	return 	Promise.all([
				when(rimraf, 	['dev']).then(whenFn(fs.mkdir, 	['dev'])),
				when(rimraf, 	['tmp']).then(whenFn(fs.mkdir, 	['tmp'])),
			])
}


function compileTaxonomyTemplatesToTmp() {
	return	Promise.all([
				when(fs.readFile, ['src/styles/ic-category.template', 'utf8'] )
				.then(function(category_template){
					return	taxonomy.categories.map(function(category){
								if(!category.name) 					console.error('Taxonomy templates: Missing categoriy name:', category)
								if(category.name.match(/[^a-z]/)) 	console.error('Taxonomy templates: Only lower case names allowed for categories:', category.name)
								return	category_template
										.replace(/{{name}}/g, 			category.name)
										.replace(/{{color\[([0-9]+)\]}}/g, 
											function(match, p1){
												var color = category.colors && category.colors[parseInt(p1)]
												if(!color) console.error('Taxonomy templates: missing color: {{color['+p1+']}}', category.name)

												return color
											}
										)
							})
							.join('\n\n')
				})
			])
			.then(function(results){			 
				return 	ascDir('tmp/styles')
						.then(whenFn(fs.writeFile, ['tmp/styles/taxonomy.css', results.join('\n\n'), 'utf8']))
			})
}




function copyFilesToDev(){
	return 	Promise.all([
				when(copyfiles,[["src/js/**/*.js", 			"dev/js"], 		 	2]),
				when(copyfiles,[["src/pages/**/*.html", 	"dev/pages"], 		2]),
				when(copyfiles,[["src/partials/**/*.html", 	"dev/partials"],	2]),
				when(copyfiles,[["src/images/**/*.*", 		"dev/images"],		2]),

				when(copyfiles,[["vendor.js", 				"dev/js"], 			0]),
				when(copyfiles,[["config/**/*", 			"dev/config"], 		1]),

				// Fonts:
				when(copyfiles,[["node_modules/roboto-fontface/fonts/Roboto/*", 					"dev/fonts/Roboto"],	4]),
				when(copyfiles,[["node_modules/roboto-fontface/css/roboto/roboto-fontface.css", 	"dev/styles/Roboto"],	4])
			])
}


function bundleStyles(src_dir, target_dir, filename){

	var	cleanCSS = new CleanCSS({rebaseTo: target_dir})

	return	when(fs.readdir,[src_dir])
			.then(function(filenames){

				var filenames	=	filenames
									.map(function(fn){ 
										return 	fn.match(/\.css$/) 
												?	src_dir+'/'+fn
												:	undefined
									})
									.filter(function(x){ return !!x }),

					minify_result =	cleanCSS.minify(filenames)


				return 	minify_result.errors.length
						?	Promise.reject(minify_result.errors)
						:	minify_result.styles
			})
			.then(function(css){
				return	ascDir(target_dir)
						.then(when(fs.writeFile, [target_dir+'/'+filename, css, 'utf8']))
			})
}


function bundleStylesToDev(){

	return 	when(copyfiles,[["src/styles/**/*.css", "tmp/styles"], 2])
			.then(function(){
				return	Promise.all([
							bundleStyles('tmp/styles', 			'dev/styles', 'styles.css'),
							bundleStyles('tmp/styles/initial', 	'dev/styles', 'initial.css')
						])
			})
}



function compileIndex(){

	return 	Promise.all([
				when(fs.readFile,['src/index.html', 	'utf8']),
				when(fs.readFile,['src/dev_head.html', 	'utf8'])
			])
			.then(function(result){
				return	result[0]
						.replace(/CONFIG\.BACKEND\_LOCATION/g, 		config.backendLocation)
						.replace(/\s*<\!--\s*BUILD HEAD\s*-->/g, 	'\n'+result[1])
			})
			.then(function(content){
				return when(fs.writeFile,['dev/index.html', content, 'utf8'])				
			})
}


function cleanUp(){
	return when(rimraf,['tmp'])
}


setup()

.then(function(){ console.log('\nCompiling taxonomy templates /tmp...')})
.then(compileTaxonomyTemplatesToTmp)
.then(function(){ console.log('Done.')})

.then(function(){ console.log('\nCopying files copied to /dev...')})
.then(copyFilesToDev)
.then(function(){ console.log('Done.')})

.then(function(){ console.log('\nBudling styles into dev...')})
.then(bundleStylesToDev)
.then(function(){ console.log('Done.')})


.then(function(){ console.log('\nCompiling Index into dev...')})
.then(compileIndex)
.then(function(){ console.log('Done.')})

.then(function(){ console.log('\nCleaninng up...')})
.then(cleanUp)
.then(function(){ console.log('Done.')})


.then(
	function(){
		console.log('\nAll done. \n')
	},
	function(e){
		console.trace(e)
	}
)







