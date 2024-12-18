let userData = JSON.parse(localStorage.getItem('userData')) || {}; // Load user data from localStorage
let currentUser = null;
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let difficulty = 'easy'; // Default to easy mode

// DOM elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const resetBtn = document.getElementById('reset-btn');
const easyModeBtn = document.getElementById('easy-mode-btn');
const hardModeBtn = document.getElementById('hard-mode-btn');
const boardEl = document.getElementById('board');
const userInfoEl = document.getElementById('user-info');
const userPointsEl = document.getElementById('user-points');
const gameStatusEl = document.getElementById('game-status');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginForm = document.getElementById('login-form');
const gameBoardContainer = document.querySelector('.board-container');
const displayUsernameEl = document.getElementById('display-username');
const seeAccountBtn = document.getElementById('see-account-btn');

// Function to show user info and game board
function showUserInfo() {
    userInfoEl.style.display = 'block';
    loginForm.style.display = 'none';
    displayUsernameEl.textContent = currentUser;
    userPointsEl.textContent = userData[currentUser].points;
    gameBoardContainer.style.display = 'block';
}

// Function to hide user info and game board
function hideUserInfo() {
    userInfoEl.style.display = 'none';
    loginForm.style.display = 'block';
    gameBoardContainer.style.display = 'none';
}

// Register a new user
signupBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username && password) {
        if (!userData[username]) {
            userData[username] = { password, points: 0 };
            localStorage.setItem('userData', JSON.stringify(userData));
            alert('Sign-up successful!');
            currentUser = username;
            showUserInfo();
        } else {
            alert('Username already exists.');
        }
    } else {
        alert('Please enter both username and password.');
    }
});

// Login existing user
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username && password) {
        if (userData[username] && userData[username].password === password) {
            currentUser = username;
            showUserInfo();
        } else {
            alert('Incorrect username or password.');
        }
    } else {
        alert('Please enter both username and password.');
    }
});

// Logout user
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    hideUserInfo();
});

// Update points after a win
function updatePoints() {
    if (currentUser) {
        userData[currentUser].points += 10;
        localStorage.setItem('userData', JSON.stringify(userData));
        userPointsEl.textContent = userData[currentUser].points;
    }
}

// Event listener for the "See My Account" button
seeAccountBtn.addEventListener('click', () => {
    if (currentUser) {
        alert(`Account Info:\nUsername: ${currentUser}\nPoints: ${userData[currentUser].points}`);
    } else {
        alert('Please log in first.');
    }
});

// Game logic
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            const winner = board[a]; // Store the winner (X or O)
            gameActive = false;
            setTimeout(() => {
                gameStatusEl.textContent = `${winner} wins!`;
                updatePoints(); // Add points when user wins
            }, 500);
            return;
        }
    }

    if (!board.includes('')) {
        gameActive = false;
        setTimeout(() => {
            gameStatusEl.textContent = 'It\'s a draw!';
        }, 500);
    }
}

function handleClick(e) {
    const cellIndex = e.target.dataset.index;
    if (board[cellIndex] || !gameActive) return; // If the cell is already filled or game is not active, do nothing

    board[cellIndex] = currentPlayer;
    e.target.textContent = currentPlayer;
    checkWinner();
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatusEl.textContent = `${currentPlayer}'s turn`;

    if (currentPlayer === 'O' && gameActive) {
        setTimeout(() => {
            computerMove();
        }, 500);
    }
}

function computerMove() {
    let move;
    if (difficulty === 'easy') {
        // Easy mode: Random move
        do {
            move = Math.floor(Math.random() * 9);
        } while (board[move]);
    } else if (difficulty === 'hard') {
        // Hard mode: Basic AI (blocking or winning)
        move = findBestMove();
    }

    board[move] = 'O';
    const cell = document.querySelector(`[data-index="${move}"]`);
    cell.textContent = 'O';
    checkWinner();
    currentPlayer = 'X';
    gameStatusEl.textContent = `${currentPlayer}'s turn`;
}

function findBestMove() {
    // Try to win or block the player from winning
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // Check if AI can win
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === board[b] && board[a] === 'O' && !board[c]) {
            return c;
        }
        if (board[b] === board[c] && board[b] === 'O' && !board[a]) {
            return a;
        }
        if (board[c] === board[a] && board[c] === 'O' && !board[b]) {
            return b;
        }
    }

    // Block the player from winning
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === board[b] && board[a] === 'X' && !board[c]) {
            return c;
        }
        if (board[b] === board[c] && board[b] === 'X' && !board[a]) {
            return a;
        }
        if (board[c] === board[a] && board[c] === 'X' && !board[b]) {
            return b;
        }
    }

    // No immediate threats, so make a random move
    let move;
    do {
        move = Math.floor(Math.random() * 9);
    } while (board[move]);
    return move;
}

// Reset game board
resetBtn.addEventListener('click', () => {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    gameStatusEl.textContent = `${currentPlayer}'s turn`;

    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.textContent = '');
});

// Difficulty settings
easyModeBtn.addEventListener('click', () => {
    difficulty = 'easy';
    easyModeBtn.style.backgroundColor = '#4CAF50';
    hardModeBtn.style.backgroundColor = '#888';
});

hardModeBtn.addEventListener('click', () => {
    difficulty = 'hard';
    hardModeBtn.style.backgroundColor = '#4CAF50';
    easyModeBtn.style.backgroundColor = '#888';
});

// Attach click event to cells
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick);
});
