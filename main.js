import './style.css';

import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdCyzpyIWdJmTU5t2vyplFHlafuHoFw-o",
  authDomain: "gmeet-e837a.firebaseapp.com",
  projectId: "gmeet-e837a",
  storageBucket: "gmeet-e837a.appspot.com",
  messagingSenderId: "218232317010",
  appId: "1:218232317010:web:9c2c703b8bfab24f5ceb8b",
  measurementId: "G-T5N88G8H0E"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;
let localUsername = "";
let remoteUsername = "";
let pdfDummyStore = {};  // Dummy store for PDFs

// HTML elements
const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');
const usernameInput = document.getElementById('usernameInput');
const localUsernameDiv = document.getElementById('localUsername');
const remoteUsernameDiv = document.getElementById('remoteUsername');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const fileInput = document.getElementById('fileInput');
const sendFileButton = document.getElementById('sendFileButton');
const pdfViewerContainer = document.getElementById('pdfViewerContainer');
const pdfViewer = document.getElementById('pdfViewer');
const closePdfButton = document.getElementById('closePdfButton');

// Event listener for username input
usernameInput.onchange = () => {
  localUsername = usernameInput.value;
  localUsernameDiv.textContent = localUsername;
};

// 1. Setup media sources
webcamButton.onclick = async () => {
  if (!localUsername) {
    alert("Please enter a username before starting the webcam.");
    return;
  }

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};

// 2. Create an offer
callButton.onclick = async () => {
  const callDoc = firestore.collection('calls').doc();
  const offerCandidates = callDoc.collection('offerCandidates');
  const answerCandidates = callDoc.collection('answerCandidates');
  const chatMessagesCollection = callDoc.collection('chatMessages');

  callInput.value = callDoc.id;

  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
    username: localUsername, // Store local username in offer data
  };

  await callDoc.set({ offer });

  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
      remoteUsername = data.answer.username;
      remoteUsernameDiv.textContent = remoteUsername;
    }
  });

  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  hangupButton.disabled = false;
  sendButton.disabled = false;
  sendFileButton.disabled = false;

  // Listen for chat messages
  chatMessagesCollection.orderBy('timestamp').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const messageData = change.doc.data();
      if (messageData.type === 'file' && messageData.fileName) {
        displayFileLink(messageData.username, messageData.fileName);
      } else if (messageData.type === 'text') {
        displayMessage(messageData.username, messageData.message);
      }
    });
  });
};

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const answerCandidates = callDoc.collection('answerCandidates');
  const offerCandidates = callDoc.collection('offerCandidates');
  const chatMessagesCollection = callDoc.collection('chatMessages');

  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
  remoteUsername = callData.offer.username;
  remoteUsernameDiv.textContent = remoteUsername;

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
    username: localUsername,
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();
      pc.addIceCandidate(new RTCIceCandidate(data));
    });
  });

  hangupButton.disabled = false;
  sendButton.disabled = false;
  sendFileButton.disabled = false;

  // Listen for chat messages
  chatMessagesCollection.orderBy('timestamp').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const messageData = change.doc.data();
      if (messageData.type === 'file' && messageData.fileName) {
        displayFileLink(messageData.username, messageData.fileName);
      } else if (messageData.type === 'text') {
        displayMessage(messageData.username, messageData.message);
      }
    });
  });
};

// 4. Send chat message
sendButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = firestore.collection('calls').doc(callId);
  const chatMessagesCollection = callDoc.collection('chatMessages');

  const message = chatInput.value;
  if (message) {
    await chatMessagesCollection.add({
      type: 'text',
      username: localUsername,
      message: message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    chatInput.value = "";
  }
};

// 5. Send PDF file
sendFileButton.onclick = async () => {
  const file = fileInput.files[0];
  if (file && file.type === "application/pdf") {
    const callId = callInput.value;
    const callDoc = firestore.collection('calls').doc(callId);
    const chatMessagesCollection = callDoc.collection('chatMessages');

    // Convert file to blob URL
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfBlobUrl = fileReader.result;
      pdfDummyStore[file.name] = pdfBlobUrl; // Save in dummy store

      await chatMessagesCollection.add({
        type: 'file',
        username: localUsername,
        fileName: file.name,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    };
    fileReader.readAsDataURL(file);
  } else {
    alert("Please select a valid PDF file.");
  }
};

// 6. Display chat message
function displayMessage(username, message) {
  const messageElement = document.createElement('div');
  messageElement.className = "message";
  messageElement.textContent = `${username}: ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 7. Display file link in chat
function displayFileLink(username, fileName) {
  const messageElement = document.createElement('div');
  messageElement.className = "message";
  const linkElement = document.createElement('a');
  linkElement.href = "#";
  linkElement.textContent = `${username} sent a PDF: ${fileName}`;
  linkElement.onclick = (e) => {
    e.preventDefault();
    openPdfViewer(fileName);
  };
  messageElement.appendChild(linkElement);
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 8. Open PDF viewer
function openPdfViewer(fileName) {
  if (pdfDummyStore[fileName]) {
    pdfViewer.src = pdfDummyStore[fileName];
    pdfViewerContainer.style.display = "block";
  } else {
    alert("PDF not available.");
  }
}

// 9. Close PDF viewer
closePdfButton.onclick = () => {
  pdfViewer.src = "";
  pdfViewerContainer.style.display = "none";
};

// 10. Hangup function
hangupButton.onclick = () => {
  pc.close();
  localStream.getTracks().forEach((track) => track.stop());
  remoteStream.getTracks().forEach((track) => track.stop());

  webcamVideo.srcObject = null;
  remoteVideo.srcObject = null;

  callButton.disabled = true;
  answerButton.disabled = true;
  hangupButton.disabled = true;
  webcamButton.disabled = false;
  sendButton.disabled = true;
  sendFileButton.disabled = true;

  callInput.value = '';
  localUsernameDiv.textContent = "";
  remoteUsernameDiv.textContent = "";
  chatMessages.innerHTML = "";

  console.log("Call ended.");
};
