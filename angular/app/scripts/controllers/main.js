'use strict';

var ProjectCtrl = function ($scope, $modalInstance, project) {
	$scope.project = project;
	$scope.ok = function () {
		$modalInstance.close();
	};
};

angular
.module('angularApp')
.controller('MainCtrl', function ($scope) {})
.factory('github', function( $http, $q ) {
	return {
		search: function( query ) {
			var deferred = $q.defer();
			$http.get('https://api.github.com/search/repositories',{
				params:{
					q: query
				}
			}).success( function( data ) {
				deferred.resolve( data );
			});
			return deferred.promise;
		}
	}
} )
.directive('project', function($modal){
	return {
		restrict: 'E',
		scope: {
			project: '='
		},
		template: '<div class="col-md-4"><div class="project"><a ng-click="detail(project)"><h4>{{project.name}}</h4></a><div>{{project.description}}</div></div></div>',
		link: function( $scope ) {
			$scope.detail = function( ) {
			$modal.open({
				templateUrl: 'projectDetail.html',
				controller: ProjectCtrl,
				resolve: {
					project: function () {
						return $scope.project;
					}
				}
			});
			}
		}
	}
})
.controller('SearchController', function ($scope,github) {
	$scope.q = '';

	$scope.loading = false;

	$scope.badPatterns = false;
	$scope.$watch('q',function(){
		if ( $scope.q !== undefined ) {
			$scope.badPatterns = $scope.q.match(/\//);
		}
	});

	function parseResponse( data ) {
		var block = [];
		for( var i in data.items ) {
			block.push( data.items[i] );
			if ( block.length >= 3 ) {
				$scope.projects.push( block );
				block = [];
			}
		}
		if ( block.length > 0 ) {
			$scope.projects.push( block );
		}
	}

	$scope.search = function() {
		$scope.loading = true	;
		$scope.projects = [];
		github.search( $scope.q ).then( function( data ) {
			$scope.loading = false;
			parseResponse( data );
		} );
	}
});
