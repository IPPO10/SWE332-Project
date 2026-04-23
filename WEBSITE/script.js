// ============================================================
// Fitness Hub — script.js
// All application logic: navigation, authentication,
// calorie calculation, goal selection, and saving results.
// ============================================================


// ── APP STATE ──
// These variables track the current state of the application.

let currentUser    = null;   // Stores the logged-in user object (null if guest)
let selectedGender = 'male'; // Default gender selection
let selectedActivity = 1.2;  // Default activity multiplier (Sedentary)
let selectedGoal   = 'maintain'; // Default goal
let lastCalcData   = null;   // Stores the last calculation result


// ============================================================
// INITIALIZATION
// Runs when the page loads. Checks if a user session is saved.
// ============================================================

function init() {
  const savedSession = localStorage.getItem('fh_session');
  if (savedSession) {
    currentUser = JSON.parse(savedSession);
    updateHeader();
  }
}


// ============================================================
// PAGE NAVIGATION
// All content is on one HTML file. Pages are shown/hidden
// using the CSS class "active".
// ============================================================

function showPage(pageName) {
  // Hide all pages
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(function(page) {
    page.classList.remove('active');
  });

  // Show the requested page
  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Scroll back to top
  window.scrollTo(0, 0);
}

function continueAsGuest() {
  // Guest users: clear any session, go straight to calculator
  currentUser = null;
  updateHeader();
  showPage('calculator');
}


// ============================================================
// HEADER
// Updates the header to show the right buttons based on
// whether the user is logged in or a guest.
// ============================================================

function updateHeader() {
  const guestHeader = document.getElementById('header-guest');
  const userHeader  = document.getElementById('header-user');
  const usernameEl  = document.getElementById('header-username');

  if (currentUser) {
    // Show logged-in state
    guestHeader.style.display = 'none';
    userHeader.style.display  = 'flex';
    usernameEl.textContent    = currentUser.fname;
  } else {
    // Show guest state
    guestHeader.style.display = 'flex';
    userHeader.style.display  = 'none';
  }
}


// ============================================================
// AUTHENTICATION
// Users are stored in localStorage as a simple array.
// Passwords are stored as plain text (acceptable for a
// course project with no real backend).
// ============================================================

// Helper: get all registered users from localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem('fh_users') || '[]');
}

// Helper: save the users array back to localStorage
function saveUsers(users) {
  localStorage.setItem('fh_users', JSON.stringify(users));
}

// REGISTER: Create a new account
function doRegister() {
  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const errorEl = document.getElementById('register-error');

  // Basic validation
  if (!fname || !lname || !email || !pass) {
    showError(errorEl, 'Please fill in all fields.');
    return;
  }
  if (pass.length < 6) {
    showError(errorEl, 'Password must be at least 6 characters.');
    return;
  }

  // Check if email already exists
  const users = getUsers();
  const existing = users.find(function(u) { return u.email === email; });
  if (existing) {
    showError(errorEl, 'An account with this email already exists.');
    return;
  }

  // Create the new user object
  const newUser = {
    id:           Date.now(),  // Simple unique ID using timestamp
    fname:        fname,
    lname:        lname,
    email:        email,
    pass:         pass,
    savedResults: []           // Empty array to store future results
  };

  users.push(newUser);
  saveUsers(users);

  // Log the user in automatically after registration
  loginUser(newUser);
  showToast('Account created! Welcome, ' + fname + '.');
  showPage('calculator');
}

// LOGIN: Log in with email and password
function doLogin() {
  const email   = document.getElementById('login-email').value.trim().toLowerCase();
  const pass    = document.getElementById('login-pass').value;
  const errorEl = document.getElementById('login-error');

  // Find user with matching email and password
  const users = getUsers();
  const user  = users.find(function(u) {
    return u.email === email && u.pass === pass;
  });

  if (!user) {
    showError(errorEl, 'Incorrect email or password.');
    return;
  }

  loginUser(user);
  showToast('Welcome back, ' + user.fname + '!');
  showPage('calculator');
}

// Helper: set the current user and save session
function loginUser(user) {
  currentUser = user;
  localStorage.setItem('fh_session', JSON.stringify(user));
  updateHeader();

  // Clear form fields
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value  = '';
  document.getElementById('login-error').style.display  = 'none';
  document.getElementById('register-error').style.display = 'none';
}

// LOGOUT: Clear session and return to home
function logout() {
  currentUser = null;
  localStorage.removeItem('fh_session');
  updateHeader();
  showPage('home');
  showToast('You have been logged out.');
}


// ============================================================
// CALCULATOR
// Handles gender and activity selection on the form.
// ============================================================

// Set gender when user clicks Male or Female button
function setGender(gender) {
  selectedGender = gender;
  document.getElementById('btn-male').classList.toggle('active', gender === 'male');
  document.getElementById('btn-female').classList.toggle('active', gender === 'female');
}

// Set activity level when user clicks an activity button
function setActivity(clickedBtn) {
  // Remove active from all activity buttons
  const allActivityBtns = document.querySelectorAll('.activity-btn');
  allActivityBtns.forEach(function(btn) {
    btn.classList.remove('active');
  });

  // Set the clicked button as active
  clickedBtn.classList.add('active');
  selectedActivity = parseFloat(clickedBtn.dataset.value);
}


// ============================================================
// CALORIE CALCULATION
// Uses the Mifflin-St Jeor equation to calculate BMR,
// then multiplies by the activity factor to get TDEE.
//
// Formula:
//   Male:   BMR = (10 × weight) + (6.25 × height) − (5 × age) + 5
//   Female: BMR = (10 × weight) + (6.25 × height) − (5 × age) − 161
//   TDEE = BMR × activity multiplier
// ============================================================

function calculate() {
  // Read input values
  const age    = parseFloat(document.getElementById('calc-age').value);
  const weight = parseFloat(document.getElementById('calc-weight').value);
  const height = parseFloat(document.getElementById('calc-height').value);

  // Validate inputs
  if (!age || !weight || !height) {
    showToast('Please enter all values.');
    return;
  }
  if (age < 10 || age > 100) {
    showToast('Please enter a valid age (10–100).');
    return;
  }
  if (weight < 30 || weight > 300) {
    showToast('Please enter a valid weight (30–300 kg).');
    return;
  }
  if (height < 100 || height > 250) {
    showToast('Please enter a valid height (100–250 cm).');
    return;
  }

  // Calculate BMR using Mifflin-St Jeor equation
  let bmr;
  if (selectedGender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * selectedActivity);
  bmr = Math.round(bmr);

  // Map activity multiplier to a readable label
  const activityLabels = {
    1.2:   'Sedentary',
    1.375: 'Lightly Active',
    1.55:  'Moderately Active',
    1.725: 'Very Active',
    1.9:   'Extra Active'
  };

  // Save calculation data for use on results page
  lastCalcData = {
    age:      age,
    weight:   weight,
    height:   height,
    gender:   selectedGender,
    activity: selectedActivity,
    bmr:      bmr,
    tdee:     tdee
  };

  // Populate the results page with calculated values
  displayResults(activityLabels);

  showPage('results');
}

// Fill in all the results page elements
function displayResults(activityLabels) {
  const tdee = lastCalcData.tdee;

  // Calculate calories for each goal
  const maintainKcal = tdee;
  const loseKcal     = Math.max(1200, tdee - 500); // Never go below 1200 kcal
  const gainKcal     = tdee + 500;

  // Update goal card numbers
  document.getElementById('kcal-maintain').textContent = maintainKcal.toLocaleString();
  document.getElementById('kcal-lose').textContent     = loseKcal.toLocaleString();
  document.getElementById('kcal-gain').textContent     = gainKcal.toLocaleString();

  // Update stats summary
  document.getElementById('stat-age').textContent      = lastCalcData.age + ' yrs';
  document.getElementById('stat-weight').textContent   = lastCalcData.weight + ' kg';
  document.getElementById('stat-height').textContent   = lastCalcData.height + ' cm';
  document.getElementById('stat-gender').textContent   = lastCalcData.gender === 'male' ? 'Male' : 'Female';
  document.getElementById('stat-activity').textContent = activityLabels[lastCalcData.activity];
  document.getElementById('stat-bmr').textContent      = lastCalcData.bmr + ' kcal';

  // Default to "maintain" goal on fresh results
  selectedGoal = 'maintain';
  updateGoalDisplay();

  // Show/hide save sections based on login status
  if (currentUser) {
    document.getElementById('save-bar-loggedin').style.display = 'flex';
    document.getElementById('save-bar-guest').style.display    = 'none';
    document.getElementById('save-btn').textContent  = 'Save Result';
    document.getElementById('save-btn').disabled     = false;
    loadSavedHistory();
  } else {
    document.getElementById('save-bar-loggedin').style.display = 'none';
    document.getElementById('save-bar-guest').style.display    = 'block';
    document.getElementById('saved-history-card').style.display = 'none';
  }
}


// ============================================================
// GOAL SELECTION
// Updates the displayed calorie number and highlighted card
// when the user clicks a goal.
// ============================================================

function selectGoal(goal) {
  selectedGoal = goal;
  updateGoalDisplay();
}

function updateGoalDisplay() {
  const tdee = lastCalcData.tdee;

  // Calorie amounts for each goal
  const calories = {
    maintain: tdee,
    lose:     Math.max(1200, tdee - 500),
    gain:     tdee + 500
  };

  // Labels for each goal
  const labels = {
    maintain: 'Maintain Weight',
    lose:     'Lose Weight',
    gain:     'Gain Weight'
  };

  // Update the main hero display
  document.getElementById('result-number').textContent    = calories[selectedGoal].toLocaleString();
  document.getElementById('result-goal-badge').textContent = labels[selectedGoal];
  document.getElementById('save-goal-label').textContent  = labels[selectedGoal];

  // Highlight the selected goal card
  document.getElementById('goal-maintain').classList.toggle('selected', selectedGoal === 'maintain');
  document.getElementById('goal-lose').classList.toggle('selected',     selectedGoal === 'lose');
  document.getElementById('goal-gain').classList.toggle('selected',     selectedGoal === 'gain');
}


// ============================================================
// SAVING RESULTS
// Logged-in users can save their result to localStorage.
// Up to 10 results are stored per user.
// ============================================================

function saveResult() {
  if (!currentUser || !lastCalcData) return;

  const goalLabels = {
    maintain: 'Maintain Weight',
    lose:     'Lose Weight',
    gain:     'Gain Weight'
  };

  const calories = {
    maintain: lastCalcData.tdee,
    lose:     Math.max(1200, lastCalcData.tdee - 500),
    gain:     lastCalcData.tdee + 500
  };

  // Create the result entry
  const entry = {
    date:   new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    goal:   goalLabels[selectedGoal],
    kcal:   calories[selectedGoal],
    age:    lastCalcData.age,
    weight: lastCalcData.weight,
    height: lastCalcData.height
  };

  // Add to the user's saved results
  const users = getUsers();
  const userIndex = users.findIndex(function(u) { return u.id === currentUser.id; });
  if (userIndex === -1) return;

  if (!users[userIndex].savedResults) {
    users[userIndex].savedResults = [];
  }

  // Add new entry at the beginning (most recent first)
  users[userIndex].savedResults.unshift(entry);

  // Keep only the last 10 results
  if (users[userIndex].savedResults.length > 10) {
    users[userIndex].savedResults.pop();
  }

  saveUsers(users);

  // Update current user in session
  currentUser = users[userIndex];
  localStorage.setItem('fh_session', JSON.stringify(currentUser));

  // Update the save button to show it was saved
  document.getElementById('save-btn').textContent = 'Saved ✓';
  document.getElementById('save-btn').disabled    = true;

  showToast('Result saved successfully!');
  loadSavedHistory();
}

// Load and display saved results for the current user
function loadSavedHistory() {
  const historyCard = document.getElementById('saved-history-card');
  const historyList = document.getElementById('saved-history-list');

  if (!currentUser) {
    historyCard.style.display = 'none';
    return;
  }

  // Get fresh user data from localStorage
  const users = getUsers();
  const user  = users.find(function(u) { return u.id === currentUser.id; });
  const results = (user && user.savedResults) ? user.savedResults : [];

  if (results.length === 0) {
    historyCard.style.display = 'none';
    return;
  }

  // Show the history card
  historyCard.style.display = 'block';

  // Build the list of saved entries
  historyList.innerHTML = results.map(function(r) {
    return '<div class="saved-entry">' +
      '<div>' +
        '<div class="saved-entry-goal">' + r.goal + '</div>' +
        '<div class="saved-entry-meta">' + r.date + ' · ' + r.weight + 'kg, ' + r.height + 'cm, ' + r.age + 'yrs</div>' +
      '</div>' +
      '<span class="saved-entry-kcal">' + r.kcal.toLocaleString() + ' kcal</span>' +
    '</div>';
  }).join('');
}


// ============================================================
// UTILITIES
// ============================================================

// Show an error message inside an auth form
function showError(element, message) {
  element.textContent   = message;
  element.style.display = 'block';
}

// Show a temporary toast notification at the bottom of screen
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  // Hide after 3 seconds
  setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}


// ── Run init when page loads ──
init();
