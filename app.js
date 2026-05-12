const prompts = [
  {
    category: "intro",
    label: "자기소개",
    text: "Tell me about yourself. What kind of person are you?",
    tip: "현재 일/공부, 성격, 좋아하는 활동, 최근 목표 순서로 자연스럽게 연결해보세요.",
  },
  {
    category: "home",
    label: "집/동네",
    text: "Describe your home. What is your favorite place there?",
    tip: "방 구조보다 그 장소에서 무엇을 하고 왜 편한지 말하면 답변이 살아납니다.",
  },
  {
    category: "home",
    label: "집/동네",
    text: "Tell me about your neighborhood. What do you usually do there?",
    tip: "위치, 분위기, 자주 가는 장소, 최근 기억을 하나의 이야기로 묶어보세요.",
  },
  {
    category: "hobby",
    label: "취미",
    text: "What do you like to do in your free time? Why do you enjoy it?",
    tip: "취미를 시작한 계기와 지금도 계속하는 이유를 감정 표현과 함께 말해보세요.",
  },
  {
    category: "hobby",
    label: "취미",
    text: "Compare how you enjoyed your hobby in the past and how you enjoy it now.",
    tip: "used to, these days, compared to before 같은 표현으로 변화가 보이게 답하세요.",
  },
  {
    category: "experience",
    label: "경험",
    text: "Tell me about a memorable trip or outing you had recently.",
    tip: "언제, 누구와, 무슨 일이 있었는지 말한 뒤 가장 기억나는 장면을 자세히 묘사하세요.",
  },
  {
    category: "experience",
    label: "경험",
    text: "Describe a problem you had while using a service and how you solved it.",
    tip: "문제 상황, 즉시 한 행동, 상대방 반응, 결과를 차례로 말하면 안정적입니다.",
  },
  {
    category: "roleplay",
    label: "롤플레이",
    text: "Call a hotel and ask three or four questions before making a reservation.",
    tip: "가격, 위치, 체크인 시간, 조식 여부처럼 실제 예약 질문을 짧게 이어가세요.",
  },
  {
    category: "roleplay",
    label: "롤플레이",
    text: "You cannot attend an appointment. Call your friend and suggest another plan.",
    tip: "사과, 이유, 대안 시간, 상대방 배려 표현을 넣어 자연스럽게 말해보세요.",
  },
];

const categorySelect = document.querySelector("#categorySelect");
const newPromptBtn = document.querySelector("#newPromptBtn");
const promptCategory = document.querySelector("#promptCategory");
const promptText = document.querySelector("#promptText");
const promptTip = document.querySelector("#promptTip");
const promptList = document.querySelector("#promptList");
const timerMode = document.querySelector("#timerMode");
const timerValue = document.querySelector("#timerValue");
const prepBtn = document.querySelector("#prepBtn");
const answerBtn = document.querySelector("#answerBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const resetBtn = document.querySelector("#resetBtn");
const recordBtn = document.querySelector("#recordBtn");
const playback = document.querySelector("#playback");
const recordStatus = document.querySelector("#recordStatus");
const saveNoteBtn = document.querySelector("#saveNoteBtn");
const phraseNote = document.querySelector("#phraseNote");
const feedbackNote = document.querySelector("#feedbackNote");

let currentPromptIndex = 0;
let timer = null;
let remainingSeconds = 40;
let activeDuration = 40;
let activeMode = "준비 시간";
let mediaRecorder = null;
let chunks = [];

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderTimer() {
  timerMode.textContent = activeMode;
  timerValue.textContent = formatTime(remainingSeconds);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function startTimer(seconds, mode) {
  stopTimer();
  remainingSeconds = seconds;
  activeMode = mode;
  renderTimer();

  timer = setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();

    if (remainingSeconds <= 0) {
      stopTimer();
      timerMode.textContent = `${mode} 종료`;
    }
  }, 1000);
}

function pickPrompt() {
  const category = categorySelect.value;
  const candidates =
    category === "all"
      ? prompts
      : prompts.filter((prompt) => prompt.category === category);
  const next = candidates[Math.floor(Math.random() * candidates.length)];
  currentPromptIndex = prompts.indexOf(next);
  renderCurrentPrompt();
}

function renderCurrentPrompt() {
  const prompt = prompts[currentPromptIndex];
  promptCategory.textContent = prompt.label;
  promptText.textContent = prompt.text;
  promptTip.textContent = prompt.tip;
}

function renderPromptList() {
  promptList.innerHTML = prompts
    .map(
      (prompt) => `
        <article class="prompt-item">
          <p class="pill">${prompt.label}</p>
          <h3>${prompt.text}</h3>
          <p>${prompt.tip}</p>
        </article>
      `,
    )
    .join("");
}

async function toggleRecording() {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "녹음 시작";
    recordStatus.textContent = "녹음이 완료되었습니다. 재생해서 확인해보세요.";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener("dataavailable", (event) => {
      chunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      playback.src = URL.createObjectURL(blob);
      stream.getTracks().forEach((track) => track.stop());
    });
    mediaRecorder.start();
    recordBtn.textContent = "녹음 중지";
    recordStatus.textContent = "녹음 중입니다. 답변이 끝나면 중지를 눌러주세요.";
  } catch (error) {
    recordStatus.textContent = "마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.";
  }
}

function saveNotes() {
  const payload = {
    phrase: phraseNote.value.trim(),
    feedback: feedbackNote.value.trim(),
    prompt: prompts[currentPromptIndex].text,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem("opic-studio-notes", JSON.stringify(payload));
  saveNoteBtn.textContent = "저장 완료";
  setTimeout(() => {
    saveNoteBtn.textContent = "메모 저장";
  }, 1400);
}

function restoreNotes() {
  const saved = localStorage.getItem("opic-studio-notes");
  if (!saved) return;

  const payload = JSON.parse(saved);
  phraseNote.value = payload.phrase || "";
  feedbackNote.value = payload.feedback || "";
}

newPromptBtn.addEventListener("click", pickPrompt);
categorySelect.addEventListener("change", pickPrompt);
prepBtn.addEventListener("click", () => {
  activeDuration = 40;
  startTimer(activeDuration, "준비 시간");
});
answerBtn.addEventListener("click", () => {
  activeDuration = 120;
  startTimer(activeDuration, "답변 시간");
});
pauseBtn.addEventListener("click", () => {
  if (timer) {
    stopTimer();
    pauseBtn.textContent = "이어하기";
    return;
  }

  if (remainingSeconds <= 0) return;

  pauseBtn.textContent = "일시정지";
  startTimer(remainingSeconds, activeMode);
});
resetBtn.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = activeDuration;
  pauseBtn.textContent = "일시정지";
  renderTimer();
});
recordBtn.addEventListener("click", toggleRecording);
saveNoteBtn.addEventListener("click", saveNotes);

renderPromptList();
restoreNotes();
renderTimer();
