var rgbVideoElement = document.querySelector("video#rgbVideo");
var depthVideoElement = document.querySelector("video#depthVideo");
var rgbSelect = document.querySelector("select#rgbSource");
var depthSelect = document.querySelector("select#depthSource");
var startButton = document.querySelector("button#start");

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function gotSources(sourceInfos) {
  for (var i = 0; i != sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    if (sourceInfo.kind === 'video') {
      var option = document.createElement("option");
      option.value = sourceInfo.id;
      option.text = sourceInfo.label || 'camera ' + (depthSelect.length + 1);
      depthSelect.appendChild(option);
      var option1 = document.createElement("option");
      option1.value = sourceInfo.id;
      option1.text = sourceInfo.label || 'camera ' + (rgbSelect.length + 1);
      rgbSelect.appendChild(option1);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === 'undefined'){
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
} else {
  MediaStreamTrack.getSources(gotSources);
}


function successCallbackRgb(stream) {
  window.rgbStream = stream; // make stream available to console
  rgbVideoElement.src = window.URL.createObjectURL(stream);
}

function successCallbackDepth(stream) {
  window.depthStream = stream; // make stream available to console
  depthVideoElement.src = window.URL.createObjectURL(stream);
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

function startRgb(){
  if (!!window.rgbStream) {
    rgbVideoElement.src = null;
    window.rgbStream.stop();
  }
 
  var rgbVideoSource = rgbSelect.value;
  var rgbConstraints = {
    video: {
      optional: [{sourceId: rgbVideoSource}]
    }
  };
  navigator.getUserMedia(rgbConstraints, successCallbackRgb, errorCallback);
}

function startDepth() {
  if (!!window.depthStream) {
    depthVideoElement.src = null;
    window.depthStream.stop();
  }

  var depthVideoSource = depthSelect.value;
  var depthConstraints = {
    video: {
      optional: [{sourceId: depthVideoSource}]
    }
  };
  navigator.getUserMedia(depthConstraints, successCallbackDepth, errorCallback);
}

rgbSelect.onchange = startRgb;
depthSelect.onchange = startDepth;

startRgb();
startDepth();
