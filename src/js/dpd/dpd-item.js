"use strict";

(function(){
	if(!window.dpd) 							console.error('icItemDpd: missing dpd. Please load dpd.js.')
	if(!(window.ic && window.ic.itemConfig)) 	console.error('icItemDpd: missing ic.itemConfig. Please load item_config.js.')


	function IcItem(item_data){


		var icItem = this

		icItem.downloading 		= undefined

		icItem.importData = function(data){

			//There are no partial imports! If a property is not in data, then the default value is assumed or the value deleted!

			if(!data){
				console.warn('icItemDpd: .importData() called without any data.')
				return icItem
			}

			ic.itemConfig.properties.forEach(function(property){

				// object
				if(property.type == 'object'){
					
					if(!data[property.name] && (property.mandatory || property.defaultValue === null) ){
						icItem[property.name] = angular.copy(property.defaultValue)
						return null
					}

					icItem[property.name] = {}

					for(var key in data[property.name]) {
						if(data[property.name][key] !== undefined) icItem[property.name][key] = data[property.name][key]
					}

					return null
				}

				// array
				if(property.type == 'array'){
					
					if(property.mandatory && !data[property.name]){
						icItem[property.name] = angular.copy(property.defaultValue)
						return null
					}

					icItem[property.name] = []

					;(data[property.name] || []).forEach(function(x){
						if(icItem[property.name].indexOf(x) == -1) icItem[property.name].push(x)
					})
					return null
				}


				// string or number
				icItem[property.name] = data[property.name] || (property.mandatory ? angular.copy(property.defaultValue) : undefined)


				if(property.type == "number"){
					icItem[property.name] = parseFloat(String(icItem[property.name]).replace(/,/, '.'))
				}

			})

			return icItem
		}


		icItem.diff = function(key, data, lang){
			const property = ic.itemConfig.properties.find( property => property.name == key)

			if(!property) return true			

			const value = icItem[key]

			if(!value && !data) return false
			if( value && !data)	return true
			if(!value &&  data) return true

			if(property.translatable){
				
				const langs = 	lang
								?	[lang]
								:	[...Object.keys(value), ... Object.keys(data) ]

				return 	langs.some( l => {

							if(typeof value[l] != 'string' && typeof data[l] != 'string') return false
							if(typeof value[l] == 'string' && typeof data[l] != 'string') return true
							if(typeof value[l] != 'string' && typeof data[l] == 'string') return true

							return value[l].trim() != data[l].trim()

						})
			}

			if(property.type == 'string'){

				if(typeof value != 'string' && typeof data != 'string') return false
				if(typeof value == 'string' && typeof data != 'string') return true
				if(typeof value != 'string' && typeof data == 'string') return true

				return value.trim() != data.trim()
			} 	

			if(property.type == 'array')	return value.some( v => !data.includes(v)) && data.some( d => !value.includes(d) )		

			if(property.type == 'number')	return parseFloat(value) != parseFloat(data)

			return value != data	
		}

		icItem.exportData = function(name, key){
			var data = {}

			ic.itemConfig.properties.forEach(function(property){ 
				if(!name || name == property.name){
					if(!key){
						data[property.name] 		=  	icItem[property.name] || null
					} else {
						data[property.name] 		= 	{}
						data[property.name][key]	= 	icItem[property.name][key]
					}
				}
			})

			return data
		}

		icItem.download = function(){
			if(!icItem.id) console.error('icItemDpd.download: missing item id.')

			if(icItem.downloading && icItem.ongoingDownload) return icItem.ongoingDownload

			icItem.downloading 		= 	true
			icItem.ongoingDownload 	= 	dpd(ic.itemConfig.collectionName)
										.get({id: icItem.id})
										.then(icItem.importData)
										.then(function(){
											icItem.downloading = false
											return icItem
										})

			return icItem.ongoingDownload
		}

		icItem.update = function(key, subkey){
			if(!icItem.id) console.error('icItemDpd.update: missing item id.')

			return 	dpd(ic.itemConfig.collectionName)
					.put({id: icItem.id}, icItem.exportData(key, subkey))
		}


		icItem.submitAsNew = function(){
			return	dpd(ic.itemConfig.collectionName)
					.post(icItem.exportData())
					.then(function(data){
						icItem.importData(data)
						return data
					})
		}

		icItem.submitAsEditSuggestion = function(){
			var data = icItem.exportData()


			data.state			= "suggestion"
			data.proposalFor 	= icItem.id


			return	dpd(ic.itemConfig.collectionName)
					.post(data)
					.then(function(data){
						//icItem.importData(data)
						return data
					})
		}


		icItem.delete = function(){
			return 	dpd(ic.itemConfig.collectionName)
					.del({id: icItem.id})
		}

		icItem.getErrors = function(property_name, key){

			var errors	= 	ic.itemConfig.properties.reduce(function(errors, property){
								if(!property || property_name == property.name){
									var e = property.getErrors(icItem[property.name], key)
									if(e) errors[property_name] = e
								}
								return errors
							}, {})

			if(Object.keys(errors).length == 0) return null

			return	property_name
					?	errors[property_name]
					:	errors

		}



		if(item_data && item_data.id){
			icItem.id = item_data.id 
			return icItem.importData(item_data)
		} else {
			console.error('icItemDpd: missing item id.')
			return null
		}

	}


	window.ic.Item = IcItem
}())


