angular.module('vaultly.nav', [])

.directive('navElement', function () {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('navChanged', function (ev, path) {
                if ( element[0].id === path ) {
                    element.addClass("nav-select");
                } else {
                    element.removeClass("nav-select");
                }
            });
        }
    };
});
