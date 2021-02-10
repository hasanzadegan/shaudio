var myApp = angular.module('myApp', []);
myApp.controller("controller",function ($scope) {

    $scope.points = [1,10,11,26];
    $scope.selectPoint = function($event,point){
        if($event.ctrlKey){
            if($scope.points.includes(point))
            {
                const index = $scope.points.indexOf(point);
                if (index > -1) {
                    $scope.points.splice(index, 1);
                }
                console.log("deselect",point)
            }
            else
            {
                $scope.points.push(point);
                console.log("select",point)
            }
        }
    }
    $scope.selectKeyFrame = function(point){
        console.log("keyFrame",point);
    }
    myAudio = angular.element(document.getElementById("#myAudio"));
})
//Config
myApp.config(['$sceDelegateProvider',
    function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self']);
    }
]);

myApp.directive('shaudio', function() {

    var template = `<div class="audio-container">
        <span ng-click="play()">{{isplaying ? "&#9632;" : "&#9658;"}}</span>
            <div class="keyFrameList">
                <div class="progress" ng-mousedown="setTime($event)" ng-mouseup="reset()" >
                    <div class="bar" data-ng-style="barstyle">
<!--                    {{duration}}-->
                    </div>
                                    <div ng-repeat="point in keyFrames track by $index" class="keyFrame"
                    style="width:{{keyFrameWidth}};left:{{getPosition(point)}}" 
                    ng-dblclick="selectAndDeselect($event,point)" 
                    ng-click="setAudioTime(point)">
                    <div class="{{getClass(point)}}"  ng-click="selectKeyFrame(point)">&nbsp;</div>
                </div>
                </div>

            </div>
        </div>`;
    return {
        restrict: 'E',
        template: template,
        replace: true,
        scope: {
            durationData: '=',
            pointsData: '=',
            clickData:'=',
            clickFrame:'=',
            url: '@',
            artist: '@',
            title: '@',
        },
        link: function($scope, $element) {
            //Width of progress bar element
            $scope.keyFrames = [];
            $scope.timelineWidth = $element[0].querySelectorAll(".progress")[0].offsetWidth;
            $scope.audio = new Audio();
            $scope.audio.type = "audio/mpeg";
            $scope.audio.src = $scope.url;
            $scope.duration = '0:00';
            $scope.barstyle = {width: "0%"};
            $scope.isplaying = false;

            console.log("$element",$element[0])

            $scope.play = function() {
                if (!$scope.audio.paused) {
                    $scope.audio.pause();
                } else {
                    $scope.audio.play();
                }
            };


            $scope.keyFrameWidth = 0;
            $scope.getPosition = function(point){
                return (point)*$scope.keyFrameWidth;
            }

            $scope.getClass = function(point){
                if(point<$scope.audio.currentTime) {
                    if ($scope.pointsData.includes(point)) {
                        return "playedKeyFrame";
                    }else{
                        return "played";
                    }
                }else if($scope.pointsData.includes(point)){
                    return "selectedKeyFrame";
                }
            }

            $scope.selectAndDeselect = function($event,point){
                $scope.clickData($event,point);
            }

            $scope.selectKeyFrame = function(point){
               $scope.clickFrame(point);
            }

            //

            $scope.setAudioTime = function(point){
                $scope.audio.currentTime = point+1;
                $scope.play();
            }
            $scope.setTime = function($event) {
                $scope.audio.removeEventListener('timeupdate', timeupdate, true);
                var position = $event.clientX - $event.target.offsetLeft;
                $scope.time = (position / $scope.timelineWidth) * 100;
                $scope.audio.currentTime = ($scope.time * $scope.audio.duration) / 100;
                $scope.barstyle.width = $scope.time + "%";
            };

            $scope.reset = function() {
                $scope.audio.addEventListener('timeupdate', timeupdate);
            };

            $scope.audio.addEventListener('timeupdate', timeupdate);

            function timeupdate() {
                var sec_num = $scope.audio.currentTime;

                var minutes = Math.floor(sec_num / 60);
                var seconds = sec_num - (minutes * 60);
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                minutes += "";
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                seconds += "";

                var time = minutes + ':' + seconds.substring(0, 2);
                $scope.duration = time;
                $scope.durationData = $scope.audio.currentTime;
                $scope.durationData = $scope.audio.currentTime;

                for(i=0;i<Math.floor($scope.audio.duration);i++){
                    $scope.keyFrames.push(i);
                }

                $scope.timelineWidth = $element[0].querySelectorAll(".progress")[0].offsetWidth;
                $scope.keyFrameWidth = ($scope.timelineWidth/$scope.audio.duration);
                $scope.barstyle.width = ($scope.audio.currentTime / $scope.audio.duration) * 100 + "%";
                $scope.$apply();
            };

        }
    };
});
