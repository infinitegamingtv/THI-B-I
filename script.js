const questions = [
    {
        q: "Thế vận hội Mùa hè (Olympic) đầu tiên được tổ chức ở đâu?",
        options: ["Hy Lạp", "Pháp", "Anh", "Mỹ"],
        correct: 0
    },
    {
        q: "Ai là vận động viên bơi lội giành nhiều huy chương vàng Olympic nhất mọi thời đại?",
        options: ["Mark Spitz", "Michael Phelps", "Ian Thorpe", "Caeleb Dressel"],
        correct: 1
    },
    {
        q: "Kiểu bơi nào thường được coi là bơi nhanh nhất?",
        options: ["Bơi ếch", "Bơi ngửa", "Bơi sải (trườn sấp)", "Bơi bướm"],
        correct: 2
    },
    {
        q: "Kình ngư Nguyễn Thị Ánh Viên đã giành bao nhiêu HCV tại SEA Games 28?",
        options: ["6", "7", "8", "9"],
        correct: 2
    },
    {
        q: "Hồ bơi tiêu chuẩn Olympic có chiều dài bao nhiêu mét?",
        options: ["25m", "50m", "100m", "75m"],
        correct: 1
    },
    {
        q: "Trong bơi lội tiếp sức hỗn hợp 4x100m, thứ tự các kiểu bơi là gì?",
        options: ["Ngửa, Ếch, Bướm, Sải", "Sải, Ngửa, Ếch, Bướm", "Ếch, Bướm, Ngửa, Sải", "Bướm, Ngửa, Ếch, Sải"],
        correct: 0
    },
    {
        q: "Vận động viên bơi lội Paul Biedermann giữ kỷ lục thế giới ở cự ly nào?",
        options: ["100m tự do", "200m tự do", "400m tự do", "Cả 200m và 400m tự do"],
        correct: 3
    }
];

let currentTeam = 'A'; // 'A' or 'B'
let teamPos = { A: 0, B: 0 };
const stepSize = 13.5; // percent to move per correct answer (7 * 13.5 = 94.5%)
const winPos = 90; // threshold to win

let currentQuestionIndex = -1;
const usedQuestions = new Set();

// Sounds
const correctSound = new Audio('media/media1.m4a');
const wrongSound = new Audio('media/media2.m4a');
const winSound = new Audio('media/audio1.wav'); // Fallback to whatever audio is there
// If the actual sound files fail to load, we just catch the error so it doesn't break the game.

// DOM Elements
const numbersContainer = document.getElementById('question-numbers');
const qModal = document.getElementById('question-modal');
const rModal = document.getElementById('result-modal');
const mTitle = document.getElementById('modal-title');
const mQuestion = document.getElementById('modal-question');
const mAnswers = document.getElementById('modal-answers');
const rTitle = document.getElementById('result-title');
const rMessage = document.getElementById('result-message');
const btnNext = document.getElementById('btn-next');
const btnRestart = document.getElementById('btn-restart');
const swimmerA = document.getElementById('swimmer-a');
const swimmerB = document.getElementById('swimmer-b');
const turnIndicator = document.getElementById('current-turn');

// Initialize Question Board
function initBoard() {
    numbersContainer.innerHTML = '';
    for (let i = 0; i < questions.length; i++) {
        const btn = document.createElement('button');
        btn.classList.add('q-btn');
        btn.innerText = i + 1;
        btn.onclick = () => openQuestion(i, btn);
        numbersContainer.appendChild(btn);
    }
    updateTurnUI();
}

function updateTurnUI() {
    turnIndicator.innerText = `Đội ${currentTeam}`;
    turnIndicator.className = `team-${currentTeam.toLowerCase()}-turn`;
}

function openQuestion(index, btnElem) {
    if (usedQuestions.has(index)) return;
    
    currentQuestionIndex = index;
    usedQuestions.add(index);
    btnElem.classList.add('used');

    const q = questions[index];
    mTitle.innerText = `Câu hỏi số ${index + 1}`;
    mQuestion.innerText = q.q;
    
    mAnswers.innerHTML = '';
    q.options.forEach((opt, i) => {
        const ansBtn = document.createElement('button');
        ansBtn.classList.add('ans-btn');
        ansBtn.innerText = opt;
        ansBtn.onclick = () => checkAnswer(i);
        mAnswers.appendChild(ansBtn);
    });

    qModal.classList.add('active');
}

function checkAnswer(selectedIndex) {
    qModal.classList.remove('active');
    
    const isCorrect = selectedIndex === questions[currentQuestionIndex].correct;
    
    if (isCorrect) {
        playSound(correctSound);
        teamPos[currentTeam] += stepSize;
        if (teamPos[currentTeam] > 100) teamPos[currentTeam] = 100;
        
        showResult(`CHÍNH XÁC!`, `Đội ${currentTeam} bơi lên một đoạn!`, 'text-correct');
    } else {
        playSound(wrongSound);
        teamPos[currentTeam] -= stepSize;
        if (teamPos[currentTeam] < 0) teamPos[currentTeam] = 0;
        
        showResult(`SAI RỒI!`, `Đội ${currentTeam} bị lùi lại!`, 'text-wrong');
    }

    updateSwimmerPosition();
}

function updateSwimmerPosition() {
    swimmerA.style.left = `${teamPos.A}%`;
    swimmerB.style.left = `${teamPos.B}%`;
}

function showResult(title, message, titleClass) {
    rTitle.innerText = title;
    rTitle.className = titleClass;
    rMessage.innerText = message;
    
    // Check win condition
    if (teamPos[currentTeam] >= winPos) {
        playSound(winSound);
        rTitle.innerText = `CHÚC MỪNG!`;
        rTitle.className = 'text-win';
        rMessage.innerText = `Đội ${currentTeam} đã về đích và giành chiến thắng!`;
        btnNext.classList.add('hidden');
        btnRestart.classList.remove('hidden');
    } else {
        btnNext.classList.remove('hidden');
        btnRestart.classList.add('hidden');
        
        // If all questions are used and no one wins
        if (usedQuestions.size === questions.length) {
            rTitle.innerText = `HẾT CÂU HỎI!`;
            rTitle.className = 'text-win';
            const winner = teamPos.A > teamPos.B ? 'A' : (teamPos.B > teamPos.A ? 'B' : 'Hòa');
            if (winner === 'Hòa') {
                rMessage.innerText = `Trò chơi kết thúc với kết quả Hòa!`;
            } else {
                rMessage.innerText = `Trò chơi kết thúc. Đội ${winner} bơi xa hơn và giành chiến thắng!`;
            }
            btnNext.classList.add('hidden');
            btnRestart.classList.remove('hidden');
        }
    }

    setTimeout(() => {
        rModal.classList.add('active');
    }, 500); // Wait for swimmer animation
}

function playSound(audioEl) {
    try {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log("Audio play failed:", e));
    } catch(e) {}
}

btnNext.onclick = () => {
    rModal.classList.remove('active');
    // Switch turn
    currentTeam = currentTeam === 'A' ? 'B' : 'A';
    updateTurnUI();
};

btnRestart.onclick = () => {
    rModal.classList.remove('active');
    teamPos = { A: 0, B: 0 };
    currentTeam = 'A';
    usedQuestions.clear();
    updateSwimmerPosition();
    initBoard();
};

// Start the game
initBoard();
