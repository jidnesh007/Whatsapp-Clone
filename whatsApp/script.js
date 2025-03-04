const PRE = "DELTA";
const SUF = "MEET";
var room_id;
var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null;
var screenSharing = false;
function createRoom() {
  console.log("Creating Room");
  let room = document.getElementById("room-input").value;
  if (room == " " || room == "") {
    alert("Please enter room number");
    return;
  }
  room_id = PRE + room + SUF;
  peer = new Peer(room_id);
  peer.on("open", (id) => {
    console.log("User Connected with ID: ", id);
    hideModal();
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        local_stream = stream;
        setLocalStream(local_stream);
      },
      (err) => {
        console.log(err);
      }
    );
    notify("Waiting for User to join.");
  });
  peer.on("call", (call) => {
    call.answer(local_stream);
    call.on("stream", (stream) => {
      setRemoteStream(stream);
    });
    currentPeer = call;
  });
}

function setLocalStream(stream) {
  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}
function setRemoteStream(stream) {
  let video = document.getElementById("remote-video");
  video.srcObject = stream;
  video.play();
}

function hideModal() {
  document.getElementById("entry-modal").hidden = true;
}

function notify(msg) {
  let notification = document.getElementById("notification");
  notification.innerHTML = msg;
  notification.hidden = false;
  setTimeout(() => {
    notification.hidden = true;
  }, 3000);
}

function joinRoom() {
  console.log("Joining Room");
  let room = document.getElementById("room-input").value;
  if (room == " " || room == "") {
    alert("Please enter room number");
    return;
  }
  room_id = PRE + room + SUF;
  hideModal();
  peer = new Peer();
  peer.on("open", (id) => {
    console.log("Connected with Id: " + id);
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        local_stream = stream;
        setLocalStream(local_stream);
        notify("Joining User");
        let call = peer.call(room_id, stream);
        call.on("stream", (stream) => {
          setRemoteStream(stream);
        });
        currentPeer = call;
      },
      (err) => {
        console.log(err);
      }
    );
  });
}

function startScreenShare() {
  if (screenSharing) {
    stopScreenSharing();
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    screenStream = stream;
    let videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => {
      stopScreenSharing();
    };
    if (peer) {
      let sender = currentPeer.peerConnection.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
      screenSharing = true;
    }
    console.log(screenStream);
  });
}

function stopScreenSharing() {
  if (!screenSharing) return;
  let videoTrack = local_stream.getVideoTracks()[0];
  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  }
  screenStream.getTracks().forEach(function (track) {
    track.stop();
  });
  screenSharing = false;
}
function disconnectCall() {
  if (currentPeer) {
    currentPeer.close(); // Close the peer connection
    notify("Call Disconnected");

    // Stop all tracks of the local stream (video/audio)
    local_stream.getTracks().forEach((track) => track.stop());

    // Stop screen sharing if it is active
    if (screenSharing && screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    // Clear the video elements
    let localVideo = document.getElementById("local-video");
    let remoteVideo = document.getElementById("remote-video");
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    screenSharing = false;
    currentPeer = null;
  } else {
    notify("No active call to disconnect.");
  }
}
var cameraOn = true; // To track the state of the camera (on/off)

document.getElementById("camera-toggle").addEventListener("click", () => {
  toggleCamera();
});

function toggleCamera() {
  if (!local_stream) {
    console.log("No local stream available.");
    return;
  }

  let videoTrack = local_stream.getVideoTracks()[0]; // Get the video track

  if (cameraOn) {
    // If the camera is on, stop the video track
    videoTrack.enabled = false;
    document.getElementById("camera-toggle").style.backgroundColor =
      "transparent";
    notify("Camera Turned Off");
  } else {
    // If the camera is off, start the video track again
    videoTrack.enabled = true;
    notify("Camera Turned On");
  }

  cameraOn = !cameraOn; // Toggle the camera state
}
function setLocalStream(stream) {
  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();

  // Show controls when video starts
  document.querySelectorAll(".box2 button").forEach((button) => {
    button.classList.remove("hidden");
  });
  document.getElementById("box").classList.remove("hidden");
}

function disconnectCall() {
  if (currentPeer) {
    currentPeer.close(); // Close the peer connection
    notify("Call Disconnected");

    // Stop all tracks of the local stream (video/audio)
    local_stream.getTracks().forEach((track) => track.stop());

    // Stop screen sharing if it is active
    if (screenSharing && screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    // Clear the video elements
    let localVideo = document.getElementById("local-video");
    let remoteVideo = document.getElementById("remote-video");
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    // Hide controls when video stops
    document.querySelectorAll(".box2 button").forEach((button) => {
      button.classList.add("hidden");
    });
    document.getElementById("video-container").classList.remove("hidden");

    screenSharing = false;
    currentPeer = null;
  } else {
    notify("No active call to disconnect.");
  }
}
var micOn = true; // To track the state of the microphone (on/off)

document.getElementById("mic-toggle").addEventListener("click", () => {
  toggleMicrophone();
});

function toggleMicrophone() {
  if (!local_stream) {
    console.log("No local stream available.");
    return;
  }

  let audioTrack = local_stream.getAudioTracks()[0]; // Get the audio track

  if (micOn) {
    // If the microphone is on, disable the audio track
    audioTrack.enabled = false;
    notify("Microphone Muted");
  } else {
    // If the microphone is off, enable the audio track again
    audioTrack.enabled = true;
    notify("Microphone Unmuted");
  }

  micOn = !micOn; // Toggle the microphone state
}
