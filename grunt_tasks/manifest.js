module.exports = function(grunt) {
	grunt.registerMultiTask('manifest', 'Create appcache manifest file', function() {

		var self	=	this,
			content = 	"CACHE MANIFEST \n"+
						"#" + (new Date()) + "\n",
			dest	=	this.files[0].dest

		this.files.forEach(function(file){
			file.src.forEach(function(filename){
				if(file.cwd+'/'+filename != dest) content += '/'+filename+'\n'
			})
		})

		content += 	"\nNETWORK:\n"+
					"*\n\n"

		grunt.file.write(this.files[0].dest, content)

	})
}