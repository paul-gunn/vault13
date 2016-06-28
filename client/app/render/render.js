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
            $scope.currentJob = currentJob;

            if( currentJob.done && currentJob.renderStatus.status === 'success') {
                $location.path('/view/' + currentJob.urn);   
            } else if (!currentJob.done ) {
                 timer = $timeout(waitForCompletion, 1000); // poll for result in 1s
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

