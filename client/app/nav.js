angular.module('vaultViewer.nav', [])

.directive('navElement', function () {
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('navChanged', function (ev, activetab) {
                if ( element[0].id === activetab ) {
                    element.addClass("nav-select");
                } else {
                    element.removeClass("nav-select");
                }
            });
        }
    };
});
