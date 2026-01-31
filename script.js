let pc1, pc2, dc1, dc2;
let samples = [];
const duration = 30; // seconds
let intervalId, pingInterval, startTime, running=false;

const latencyEl = document.getElementById("latency");
const jitterEl  = document.getElementById("jitter");
const resultEl  = document.getElementById("result");
const outputEl  = document.getElementById("output");
const copyBtn   = document.getElementById("copyBtn");
const toggleBtn = document.getElementById("toggleBtn");
const progressBar = document.getElementById("progressBar");
const timerEl = document.getElementById("timer");

toggleBtn.onclick = () => running ? stopTest() : startTest();
copyBtn.onclick = () => {
  outputEl.select();
  document.execCommand("copy");
  copyBtn.textContent = "Copied ✓";
  setTimeout(() => copyBtn.textContent = "Copy Results", 1500);
};

async function startTest() {
  samples = [];
  running=true;
  toggleBtn.textContent="Stop Test";
  resultEl.style.display="none";
  outputEl.style.display="none";
  copyBtn.style.display="none";
  progressBar.style.width="0%";
  document.querySelector(".progress-container").style.display="block";
  timerEl.textContent=`Time left: ${duration}s`;

  pc1 = new RTCPeerConnection();
  pc2 = new RTCPeerConnection();

  pc1.onicecandidate = e => e.candidate && pc2.addIceCandidate(e.candidate);
  pc2.onicecandidate = e => e.candidate && pc1.addIceCandidate(e.candidate);

  dc1 = pc1.createDataChannel("perf");
  pc2.ondatachannel = e => {
    dc2 = e.channel;
    dc2.onmessage = ev => dc2.send(ev.data);
  };

  dc1.onopen = () => {
    startTime = performance.now();
    intervalId = setInterval(updateProgress, 100);
    pingInterval = setInterval(sendPing, 100);
  };

  dc1.onmessage = ev => {
    const sent = Number(ev.data);
    const rtt = performance.now() - sent;
    samples.push(rtt/2);
    latencyEl.textContent = mean(samples).toFixed(1);
    jitterEl.textContent = calcJitter(samples).toFixed(1);
  };

  const offer = await pc1.createOffer();
  await pc1.setLocalDescription(offer);
  await pc2.setRemoteDescription(offer);

  const answer = await pc2.createAnswer();
  await pc2.setLocalDescription(answer);
  await pc1.setRemoteDescription(answer);
}

function stopTest() {
  running=false;
  clearInterval(intervalId);
  clearInterval(pingInterval);
  finishTest();
}

function sendPing() { if(dc1?.readyState==="open") dc1.send(performance.now().toString()); }

function updateProgress() {
  const elapsed = (performance.now()-startTime)/1000;
  const remaining = Math.max(0,duration-elapsed);
  timerEl.textContent=`Time left: ${remaining.toFixed(1)}s`;
  progressBar.style.width=`${(elapsed/duration)*100}%`;
  if(elapsed>=duration) stopTest();
}

function finishTest(){
  toggleBtn.textContent="Start 30s Test";
  document.querySelector(".progress-container").style.display="none";
  const elapsed = ((performance.now()-startTime)/1000).toFixed(1);
  timerEl.textContent=`Test completed in ${elapsed}s`;

  const avg = mean(samples);
  const jit = calcJitter(samples);
  let status, cls, interpretation;

  if(avg < 50 && jit < 10){
    status="PASS – Endpoint performing well";
    cls="good";
    interpretation="Local computer is likely NOT causing lag";
  } else if(avg <= 100 || jit <= 30){
    status="WARNING – Possible endpoint load";
    cls="warn";
    interpretation="Possible local CPU or app load affecting performance";
  } else {
    status="FAIL – Endpoint likely causing lag";
    cls="bad";
    interpretation="Local computer is likely causing lag in RDP/WebRTC";
  }

  resultEl.textContent=status;
  resultEl.className="result "+cls;
  resultEl.style.display="block";

  outputEl.value =
`EdgeScope – Local Machine Performance Test
---------------------------------------------

Test Duration   : ${elapsed} s
Average Latency : ${avg.toFixed(1)} ms
Jitter          : ${jit.toFixed(1)} ms
Result          : ${status}

Interpretation:
- ${interpretation}

Test Description:
- Measures local computer performance (CPU responsiveness for real-time apps)
- Does NOT test network, ISP, or external server performance
- Designed for endpoint diagnostics only
`;
  outputEl.style.display="block";
  copyBtn.style.display="block";
}

function mean(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }
function calcJitter(arr){
  if(arr.length<2) return 0;
  let diffs=[];
  for(let i=1;i<arr.length;i++) diffs.push(Math.abs(arr[i]-arr[i-1]));
  return mean(diffs);
}
