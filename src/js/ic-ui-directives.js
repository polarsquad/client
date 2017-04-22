"use strict";


angular.module('icUiDirectives', [])


.directive('icScrollRepeatLimit',[

	'$timeout',

	function($timeout){
		return {
			restrict:	'A',

			link: function(scope, element, attrs){
				var parent = element[0]

				while( (parent = parent.parentElement) && !parent.hasAttribute('ic-scroll-repeat-limit-container')){}

				if(!parent) return null

				scope[attrs.icScrollRepeatLimitAs|| 'icScrollRepeatLimit'] = 10

				parent = angular.element(parent)

				$scope.$watch(attrs.icScrollRepeatLimit, function(){
					
				})

				function updateLimit(){
					console.log(element[0].getBoundingClientRect().bottom, parent[0].getBoundingClientRect().bottom, parent[0].clientHeight)
					if(element[0].getBoundingClientRect().bottom-parent[0].getBoundingClientRect().bottom > parent[0].clientHeight) return false
					
					scope[attrs.icScrollRepeatLimit] = (scope[attrs.icScrollRepeatLimit] || 0) +10
					
					scope.$apply()
					
					return true
				}

				function onScroll(){
					parent.off('scroll', onScroll)
					window.requestAnimationFrame(function(){
						if(updateLimit()){
							window.setTimeout(function(){
								onScroll()
							}, 250)	
						} else {
							parent.on('scroll', onScroll)
						} 

					})
				}
				// TODO ensure parent doesnt change size!
				// 
				//bad: onScroll()
			
			}
		}
	}

])
