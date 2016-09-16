"use strict";


angular.module('InfoCompassModule',[
	"icApi",
	"smlLayout",
	"ngSanitize",
	"icServices",
	"icDirectives",
	"monospaced.qrcode",
])


.config([
	'icApiProvider',
	'smlLayoutProvider',

	function(icApiProvider, smlLayoutProvider){

		//$animateProvider.classNameFilter(/animate-me/)

		icApiProvider.setBase('http://213.187.84.22:3000')

		smlLayoutProvider.setModes([			
			{
				name:		'XS',	
				width: 		23,
				stretch:	true
			},	
			{
				name:		'S',
				width:		48,
				stretch:	true
			},
			{
				name:		'M',
				width:		64,
				stretch:	false
			},
			{
				name:		'L',
				width:		80,
				stretch:	false
			},
			{
				name:		'XL',
				width:		120,
				stretch:	false
			}
		])
	}
])


.controller('InfoCompassCtrl',[
	
	'$scope',
	'icBootstrap',
	'icSite',
	'icFilterConfig',
	'smlLayout',
	'icConfigData',
	'icLanguageConfig',
	'icSearchResults',


	function($scope, icBootstrap, icSite, icFilterConfig, smlLayout, icConfigData, icLanguageConfig, icSearchResults){
		$scope.icSite 			= icSite
		$scope.smlLayout		= smlLayout 		//Muss das wirklich?
		$scope.icConfigData		= icConfigData 
		$scope.icSearchResults	= icSearchResults
		$scope.icLanguageConfig = icLanguageConfig
	}

])




