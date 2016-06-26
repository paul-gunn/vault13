angular.module('vaultViewer.render', [])

.controller('RenderController', function ($scope, $timeout, $location, Renderer) {
    var currentJob = Renderer.getCurrentJob();
    var timer; 

    if( !currentJob ) { // no work to be done..
        $location.path('/main');   
    }

    var waitForCompletion = function() {
        Renderer.getCurrentJob()
        .then(function(currentJob) {
            if( currentJob.done ) {
                $location.path('/view/' + currentJob.urn);   
            } else {
                $scope.currentJob = currentJob;
                timer = $timeout(waitForCompletion, 1000);
            }
        });
    };

    $scope.$on("$destroy",function( event ) {
         if( timer ) {
             $timeout.cancel( timer );
         }
    });
    
    waitForCompletion();
});

