function Mock(){	

	var random_numbers 	= [],
		i 				= 0

	while(i<100){
		random_numbers.push(Math.random())
		i++
	}


	this.rand = function(max,id){
		id = (id||0) % 100

		return Math.floor(random_numbers[id]*max)
	}

	this.image = function(id){
		return "/mock/example_"+this.rand(7, id)+".png"
	}


	this.random = function(arr,id){
		return arr[this.rand(arr.length, id)]
	}

	this.arr	= function(l){

		var i 	= 0,
			arr = []

		while(i < l){
			arr.push(i)
			i++
		}
		
		return arr
	}

	return this
}