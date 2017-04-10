onmessage = function(e){
	var config = e.data


	function sortByValue(a,b){
		if(a.value>b.value) 	return 1
		if(b.value>a.value) 	return -1
		if(a.value==b.value)	return 0
	}

	switch(config.orderBy){
		case('title'):		
			config.list.sort(function(a,b){
				return a.title.localeCompare(b.title, config.language, {ignorePunctuation:true})
			})
		break

		case('lastEdit'):	
			config.list.forEach(function(item){ item.value = new Date(item.lastEdit || 0)})	
			config.list.sort(sortByValue) 
		break
		
		case('creationDate'):	
			config.list.forEach(function(item){ item.value = new Date(item.creationDate || 0)})	
			config.list.sort(sortByValue) 
		break
		
		case('startDate'):		
			config.list.forEach(function(item){ item.value = new Date(item.startDate || 0)})	
			config.list.sort(sortByValue) 
		break
	}

	if(config.reverse) config.list.reverse()
	
	var map = {}

	config.list.forEach(function(item, index){
		map[item.id] = index
	})

	postMessage(map)	
}