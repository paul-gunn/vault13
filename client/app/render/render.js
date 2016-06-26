angular.module('vaultViewer.render', [])

.controller('RenderController', function ($scope, $timeout, $location, Renderer) {
    var currentJob = Renderer.getCurrentJob();
    var timer; 

    if( !currentJob ) { // no work to be done..
        $location.path('/main');   
    }

    var waitForCompletion = function() {
        currentJob = Renderer.getCurrentJob();
        if( currentJob.done ) {
            $location.path('/view/' + currentJob.urn);   
        } else {
            timer = $timeout(waitForCompletion, 1000);
        }
    };

    $scope.$on("$destroy",function( event ) {
         if( timer ) {
             $timeout.cancel( timer );
         }
    });
    
    waitForCompletion();
});

