"use strict";


angular.module('icFilters', [
	'icServices',
])


.filter('osmLink', [
	function(){
		return function(config){
			return 	config.longitude && config.latitude
					?	'https://www.openstreetmap.org/?mlat='+config.latitude +'&mlon=' + config.longitude + '#map=17/'+config.latitude+'/'+config.longitude
					:	'https://www.openstreetmap.org/search?query='+config.address + ', ' + config.zip + ', ' + config.city
		}
	}
])




.filter('gmLink', [
	function(){
		return function(config){
			return	config.longitude && config.latitude
					?	'https://www.google.de/maps/place/'+config.latitude+'+' + config.longitude + '/@'+config.latitude + ',' + config.longitude +',17z'
					:	'https://www.google.de/maps/place/'+config.address+', '+config.zip+', '+config.city
		}
	}
])



.filter('icLinkPrefix', function(){
	return function(key){
		return	{
					'website':		'',
					'twitter':		'',
					'facebook':		'',
					'linkedin':		'',
					'instagram':	'',
					'pinterest':	'',
					'email':		'mailto:',
					'phone':		'tel:'
				}[key]
	}
})




.filter('icDate', [

	'icLanguages',

	function(icLanguages){

		var toLocaleDateStringSupportsLocales 	= false,
			dates								= {}

		try {
			new Date().toLocaleString('i')
		} catch (e) {
			toLocaleDateStringSupportsLocales =  e instanceof RangeError
		}

		function icDateFilter(date_str, use_time){
			dates[date_str] 								= dates[date_str] || {}
			dates[date_str][icLanguages.currentLanguage]	= dates[date_str][icLanguages.currentLanguage] || {}


			if(!dates[date_str][icLanguages.currentLanguage].withoutTime){
				dates[date_str][icLanguages.currentLanguage].withoutTime = 	toLocaleDateStringSupportsLocales
																			?	new Date(date_str).toLocaleDateString(icLanguages.currentLanguage)
																			:	date_str
			} 

			if(!dates[date_str][icLanguages.currentLanguage].withTime && use_time){
				dates[date_str][icLanguages.currentLanguage].withTime	= 	dates[date_str][icLanguages.currentLanguage].withoutTime +
																			(
																				toLocaleDateStringSupportsLocales
																				?	new Date(date_str).toLocaleTimeString(icLanguages.currentLanguage)
																				:	''
																			)
			}

			return 	use_time
					?	dates[date_str][icLanguages.currentLanguage].withTime
					:	dates[date_str][icLanguages.currentLanguage].withoutTime

		}

		icDateFilter.$stateful = true

		return icDateFilter

	}
])

