(function(exports){

	exports.categories = [
		{
			name:		'information',
			tags:		[	
							"health",
							"education",
							"leisure",
							"abc",
							"education",
							"leisure",
							"culture",
							"services",
						],
			colors:		['hsla(99,48%,60%,1)', 'hsla(99,28%,38%,1)']
		},
		{
			name:		'goods',
			tags:		[
							"information",
							"law",
							"work",
							"education",
							"social",
							"leisure",
							"city",
							"services",
						],
			colors:		['hsla(40,48%,60%,1)', 'hsla(40,28%,38%,1)']

		},
		{
			name:		'health',
			tags:		[
							"law",
							"places",
							"support",
							"health",
							"education",
							"leisure",
							"culture",
							"services",
							"events"
						],
			colors:		['hsla(50,48%,60%,1)', 'hsla(50,28%,38%,1)']
		},
		{
			name:		'culture_leisure',
			tags:		[
							"support",
							"health",
							"work",
							"education",
							"social",
							"leisure",
							"culture",
							"city",
						],
			colors:		['hsla(10,48%,60%,1)', 'hsla(10,28%,38%,1)']
		},
	]

	exports.types = [
		{
			name:		'location',
			colors:		['rgba(200,240,200,1)', 'rgba(220,240,220,1)'],
		},
		{
			name:		'event',
			colors:		['rgba(200,240,240,1)', 'rgba(220,240,240,1)'],
		},
		{
			name:		'service',
			colors:		['rgba(240,200,200,1)', 'rgba(240,220,220,1)'],
		},
		{
			name:		'information',
			colors:		['rgba(240,240,200,1)', 'rgba(240,240,220,1)'],
		}
	]

	exports.unsortedTags = ['work', 'city', 'free', 'accessible']

}(
	('undefined' !== typeof exports) 
	? exports
	: (this['ic'] = this['ic'] || {})['taxonomy'] = (this['ic']['taxonomy'] || {})
))
