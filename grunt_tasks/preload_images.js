module.exports = function(grunt) {
	grunt.registerMultiTask('preload_images', 'Insert list of image urls into file.', function() {
		
		function clipPath(src, dest){
			var	path_src 	= src.split('/'),
				path_dest	= dest.split('/'),
				pos 		= 0,
				path_rel	= ''


			while(path_src[pos] == path_dest[pos])	{ pos++ }
			for(var i = 0; 		i < path_dest.length	- pos -1; 	i++)	{ path_rel += '../' }
			for(var i = pos; 	i < path_src.length 	-1; 		i++)	{ path_rel += path_src[i]+'/' }

			path_rel += path_src[path_src.length -1]

			return path_rel
		}

		console.log(this.files[0].dest)
		var filenames =	this.files.reduce(function(sum, file) {
							return sum.concat(file.src.map(function(filename){ return clipPath(filename, file.dest) }))
							

							// grunt.file.write(file.dest, "body:after{ display:none; content: %1;}".replace(/%1/, contents))
							// grunt.log.writeln('File "' + file.dest + '" created.')
						}, []),
			content 	= grunt.file.read(this.files[0].dest).replace(/<!--grunt images-->/, JSON.stringify(filenames))

			grunt.file.write(this.files[0].dest, content)

	})
}