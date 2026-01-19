let choices = [];
let currentFlagIndex = -1;
let nextFlagIndex = -1;
let score = 0;
let streak = 0;
let gameStarted = false;

document.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    loadChoices();
    initializeGame();
    
    document.getElementById('higherBtn').addEventListener('click', () => makeChoice('higher'));
    document.getElementById('drawBtn').addEventListener('click', () => makeChoice('draw'));
    document.getElementById('lowerBtn').addEventListener('click', () => makeChoice('lower'));
});

function loadQuestion() {
    const savedQuestion = localStorage.getItem('higherLowerQuestion');
    const questionHeader = document.getElementById('questionHeader');
    if (savedQuestion) {
        questionHeader.textContent = savedQuestion;
    } else {
        questionHeader.textContent = 'Which is higher or lower?';
    }
}

function loadChoices() {
    const saved = localStorage.getItem('higherLowerChoices');
    if (saved) {
        try {
            choices = JSON.parse(saved);
            if (choices.length === 0) {
                alert('No choices configured. Please go to the admin page to add choices.');
                window.location.href = 'index.html';
            }
        } catch (e) {
            alert('Error loading choices. Please configure them in the admin page.');
            window.location.href = 'index.html';
        }
    } else {
        alert('No choices configured. Please go to the admin page to add choices.');
        window.location.href = 'index.html';
    }
}

function initializeGame() {
    if (choices.length < 2) {
        alert('You need at least 2 choices to play. Please add more in the admin page.');
        return;
    }

    score = 0;
    streak = 0;
    gameStarted = true;
    updateScore();
    
    // Start with a random flag
    currentFlagIndex = Math.floor(Math.random() * choices.length);
    showCurrentFlag();
    
    // Get next flag (different from current)
    getNextFlag();
    
    // Enable buttons
    document.getElementById('higherBtn').disabled = false;
    document.getElementById('drawBtn').disabled = false;
    document.getElementById('lowerBtn').disabled = false;
}

function showCurrentFlag() {
    const current = choices[currentFlagIndex];
    const img = document.getElementById('currentFlagImg');
    const name = document.getElementById('currentFlagName');
    const reveal = document.getElementById('currentRevealNumber');
    
    const flagPath = current.flagPath || current.name;
    img.src = flagPath;
    img.style.display = 'block';
    name.textContent = current.country || current.name.split('/').pop().split('.')[0] || 'Unknown';
    reveal.textContent = current.revealNumber;
    reveal.style.display = 'block';
}

function getNextFlag() {
    // Get a random flag that's different from the current one
    let next;
    do {
        next = Math.floor(Math.random() * choices.length);
    } while (next === currentFlagIndex && choices.length > 1);
    
    nextFlagIndex = next;
    const nextFlag = choices[nextFlagIndex];
    
    const img = document.getElementById('nextFlagImg');
    const name = document.getElementById('nextFlagName');
    const nextReveal = document.getElementById('nextRevealNumber');
    
    // Show the next flag immediately so player can compare
    const flagPath = nextFlag.flagPath || nextFlag.name;
    
    // Preload and show the image
    img.onload = function() {
        // Image loaded successfully - show it
        img.style.display = 'block';
    };
    img.onerror = function() {
        // Image failed to load - show error
        console.error('Failed to load flag image:', flagPath);
        img.style.display = 'none';
    };
    
    img.src = flagPath;
    name.textContent = nextFlag.country || nextFlag.name.split('/').pop().split('.')[0] || 'Unknown';
    
    // Don't show reveal number yet - hide it until after choice
    if (nextReveal) {
        nextReveal.textContent = nextFlag.revealNumber; // Store the value but hide it
        nextReveal.style.display = 'none'; // Hide until after choice
    }
}

function makeChoice(choice) {
    if (!gameStarted) return;
    
    const current = choices[currentFlagIndex];
    const next = choices[nextFlagIndex];
    
    // Disable buttons during result display
    document.getElementById('higherBtn').disabled = true;
    document.getElementById('drawBtn').disabled = true;
    document.getElementById('lowerBtn').disabled = true;
    
    // Flags are already visible, now reveal the next flag's number and check answer
    const nextReveal = document.getElementById('nextRevealNumber');
    if (nextReveal) {
        nextReveal.style.display = 'block'; // Now reveal the number
    }
    
    // Check if correct
    // Ranking equals reveal number (lower number = higher rank)
    let correct = false;
    let isDraw = false;
    
    if (choice === 'draw') {
        isDraw = next.ranking === current.ranking;
        correct = isDraw;
    } else if (choice === 'higher') {
        // Higher rank = lower reveal number
        correct = next.ranking < current.ranking;
    } else { // lower
        // Lower rank = higher reveal number
        correct = next.ranking > current.ranking;
    }
    
    const resultOverlay = document.getElementById('resultOverlay');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    
    const currentCountry = current.country || current.name.split('/').pop().split('.')[0] || 'Unknown';
    const nextCountry = next.country || next.name.split('/').pop().split('.')[0] || 'Unknown';
    
    if (correct) {
        if (isDraw) {
            score++;
            streak++;
            resultIcon.textContent = '=';
            resultText.innerHTML = `DRAW!<br><span class="result-details">${currentCountry}: ${current.revealNumber} vs ${nextCountry}: ${next.revealNumber}</span>`;
            resultOverlay.className = 'result-overlay draw';
        } else {
            score++;
            streak++;
            resultIcon.textContent = '✓';
            resultText.innerHTML = `CORRECT!<br><span class="result-details">${currentCountry}: ${current.revealNumber} vs ${nextCountry}: ${next.revealNumber}</span>`;
            resultOverlay.className = 'result-overlay correct';
        }
    } else {
        streak = 0;
        resultIcon.textContent = '✗';
        resultText.innerHTML = `WRONG!<br><span class="result-details">${currentCountry}: ${current.revealNumber} vs ${nextCountry}: ${next.revealNumber}</span>`;
        resultOverlay.className = 'result-overlay incorrect';
    }
    
    updateScore();
    
    // Show full-screen result overlay
    resultOverlay.style.display = 'flex';
    
    // After 4 seconds, hide overlay and move to next round
    setTimeout(() => {
        resultOverlay.style.display = 'none';
        
        // Move next flag to current
        currentFlagIndex = nextFlagIndex;
        showCurrentFlag();
        
        // Get new next flag
        getNextFlag();
        
        // Hide the reveal number again for the new next flag
        const nextReveal = document.getElementById('nextRevealNumber');
        if (nextReveal) {
            nextReveal.style.display = 'none';
        }
        
        // Re-enable buttons
        document.getElementById('higherBtn').disabled = false;
        document.getElementById('drawBtn').disabled = false;
        document.getElementById('lowerBtn').disabled = false;
    }, 4000);
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
}
