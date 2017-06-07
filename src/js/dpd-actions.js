"use strict";

(function(){
	if(!window.dpd) 							console.error('icActions: missing dpd. Please load dpd.js.')

	function icActions(){

		this.updateTranslations = function(){
			return dpd.actions.exec('updateTranslations')
		}
	}

	window.ic.actions = new icActions()
})()
