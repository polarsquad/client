"use strict";

var lcEvents = angular.module('lcEvents', [])


.directive('lcClick',[
	function(){
		return {
			restrict:	'A',

			link:function(scope, element, attrs){
				element.on('click', function(){
					console.log('click')
					scope.$eval(attrs.lcClick)
					scope.$digest()
				})
			}
		}
	}
])