const socket = io();
let name;
let textareea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message_area");

do {
  name = prompt("please enter your name:  ");
} while (!name);

textareea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    sendMessage(e.target.value);
  }
});

function sendMessage(message) {
  let msg = {
    user: name,
    message: message.trim(),
  };
  //append
  appendMessage(msg, "outgoing");
  textareea.value = "";
  srcollToBottom();
  //send to server
  socket.emit("message", msg);
}

function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  let className = type;
  mainDiv.classList.add(className, "message");

  let markup = `
  <h4>${msg.user}</h4>
  <p>${msg.message}</p>
`;

  mainDiv.innerHTML = markup;
  messageArea.appendChild(mainDiv);
}

//recieve

socket.on("message", (msg) => {
  appendMessage(msg, "incoming");
  srcollToBottom();
});
function srcollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}
