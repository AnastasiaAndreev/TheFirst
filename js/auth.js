// Simple client-side auth + Google Sheets stubs
(function(){
  const SHEETS_URL_USERS = 'https://script.google.com/macros/s/YOUR_USERS_SCRIPT_ID/exec';
  const SHEETS_BOOKINGS_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit';
  const ADMIN_PASSWORD = 'admin123'; // Shared admin password

  function saveUserToLocal(user){
    localStorage.setItem('thefirst_user', JSON.stringify(user));
  }
  function getUser(){
    const raw = localStorage.getItem('thefirst_user');
    return raw ? JSON.parse(raw) : null;
  }
  function logout(){
    localStorage.removeItem('thefirst_user');
    // Redirect to home page after logout
    window.location.href = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
  }

  function clearAllData(){
    localStorage.removeItem('thefirst_user');
    localStorage.removeItem('demo_users');
    localStorage.removeItem('demo_bookings');
    localStorage.removeItem('demo_reviews');
    // Clear all localStorage data
    localStorage.clear();
    // Redirect to home page after clearing data
    window.location.href = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
  }

  // Make clearAllData available globally
  window.clearAllData = clearAllData;
  
  // Make updateHeaderNavigation available globally
  window.updateHeaderNavigation = updateHeaderNavigation;

  // Phone number formatting function
  function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove all non-digits
    
    // If it starts with 375, remove it since we'll add +375
    if (value.startsWith('375')) {
      value = value.substring(3);
    }
    
    // Limit to 9 digits (Belarusian mobile numbers)
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    
    // Format as +375 (XX) XXX-XX-XX
    let formatted = '+375';
    if (value.length > 0) {
      formatted += ' (' + value.substring(0, 2);
      if (value.length > 2) {
        formatted += ') ' + value.substring(2, 5);
        if (value.length > 5) {
          formatted += '-' + value.substring(5, 7);
          if (value.length > 7) {
            formatted += '-' + value.substring(7, 9);
          }
        }
      }
    }
    
    input.value = formatted;
  }

  // Initialize phone inputs with +375
  function initializePhoneInputs() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    phoneInputs.forEach(input => {
      // Pre-fill with +375 if empty
      if (!input.value || input.value === '') {
        input.value = '+375';
      }
    });
  }

  // Update placeholder visibility based on input content
  function updatePlaceholderVisibility(input) {
    const placeholder = input.parentElement.querySelector('.phone-placeholder');
    if (placeholder) {
      const value = input.value;
      
      if (value === '+375' || value === '') {
        // Show placeholder when only +375 or empty
        placeholder.style.opacity = '0.7';
      } else {
        // Hide placeholder when user has typed more than +375
        placeholder.style.opacity = '0';
      }
    }
  }

  // Add phone formatting to all phone inputs
  function addPhoneFormatting() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
    phoneInputs.forEach(input => {
      input.addEventListener('input', function() {
        formatPhoneNumber(this);
        updatePlaceholderVisibility(this);
      });
      
      input.addEventListener('paste', function(e) {
        setTimeout(() => {
          formatPhoneNumber(this);
          updatePlaceholderVisibility(this);
        }, 0);
      });

      // Prevent deletion of +375 prefix
      input.addEventListener('keydown', function(e) {
        if ((e.keyCode === 8 || e.keyCode === 46) && this.value === '+375') {
          e.preventDefault();
        }
      });

      // Initialize placeholder visibility
      updatePlaceholderVisibility(input);
    });
  }


  async function upsertUserToSheets(user){
    try {
      await demoSheets.handleUserUpsert(user);
    } catch(e){ console.warn('Demo sheets users upsert failed:', e); }
  }

  function calcDiscount(bookingsCount){
    if (bookingsCount >= 10) return 10;
    if (bookingsCount >= 5) return 5;
    return 0;
  }

  function isAdmin(user){
    return user && user.password === ADMIN_PASSWORD;
  }

  // Notification system
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Function to update header navigation based on user status
  function updateHeaderNavigation() {
    const userStatus = document.getElementById('userStatus');
    const userStatusMobile = document.getElementById('userStatusMobile');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userNameDisplayMobile = document.getElementById('userNameDisplayMobile');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    const headerLogoutBtnMobile = document.getElementById('headerLogoutBtnMobile');
    const notLoggedInStatus = document.getElementById('notLoggedInStatus');
    const notLoggedInStatusMobile = document.getElementById('notLoggedInStatusMobile');

    const current = getUser();
    if (current) {
      // Show user status in header
      if (userStatus) {
        userStatus.style.display = 'flex';
        userNameDisplay.textContent = `Привет, ${current.name}`;
      }
      if (userStatusMobile) {
        userStatusMobile.style.display = 'flex';
        userNameDisplayMobile.textContent = `Привет, ${current.name}`;
      }
      
      // Hide "not logged in" status
      if (notLoggedInStatus) notLoggedInStatus.style.display = 'none';
      if (notLoggedInStatusMobile) notLoggedInStatusMobile.style.display = 'none';
      
      // Show admin database link if admin
      if (isAdmin(current)) {
        const adminDatabaseLink = document.getElementById('adminDatabaseLink');
        const adminDatabaseLinkMobile = document.getElementById('adminDatabaseLinkMobile');
        if (adminDatabaseLink) adminDatabaseLink.style.display = 'block';
        if (adminDatabaseLinkMobile) adminDatabaseLinkMobile.style.display = 'block';
        
        // Hide account link for admin (they use database instead)
        const userAccountLink = document.getElementById('userAccountLink');
        const userAccountLinkMobile = document.getElementById('userAccountLinkMobile');
        if (userAccountLink) userAccountLink.style.display = 'none';
        if (userAccountLinkMobile) userAccountLinkMobile.style.display = 'none';
      } else {
        // Show account link for regular users
        const userAccountLink = document.getElementById('userAccountLink');
        const userAccountLinkMobile = document.getElementById('userAccountLinkMobile');
        if (userAccountLink) userAccountLink.style.display = 'block';
        if (userAccountLinkMobile) userAccountLinkMobile.style.display = 'block';
        
        // Hide admin database link for regular users
        const adminDatabaseLink = document.getElementById('adminDatabaseLink');
        const adminDatabaseLinkMobile = document.getElementById('adminDatabaseLinkMobile');
        if (adminDatabaseLink) adminDatabaseLink.style.display = 'none';
        if (adminDatabaseLinkMobile) adminDatabaseLinkMobile.style.display = 'none';
      }
    } else {
      // Hide user status in header
      if (userStatus) userStatus.style.display = 'none';
      if (userStatusMobile) userStatusMobile.style.display = 'none';
      
      // Hide admin database links and user account links
      const adminDatabaseLink = document.getElementById('adminDatabaseLink');
      const adminDatabaseLinkMobile = document.getElementById('adminDatabaseLinkMobile');
      const userAccountLink = document.getElementById('userAccountLink');
      const userAccountLinkMobile = document.getElementById('userAccountLinkMobile');
      if (adminDatabaseLink) adminDatabaseLink.style.display = 'none';
      if (adminDatabaseLinkMobile) adminDatabaseLinkMobile.style.display = 'none';
      if (userAccountLink) userAccountLink.style.display = 'none';
      if (userAccountLinkMobile) userAccountLinkMobile.style.display = 'none';
      
      // Show "not logged in" status
      if (notLoggedInStatus) notLoggedInStatus.style.display = 'flex';
      if (notLoggedInStatusMobile) notLoggedInStatusMobile.style.display = 'flex';
      
      // Show account links when not logged in
      const accountLink = document.getElementById('accountLink');
      const accountLinkMobile = document.getElementById('accountLinkMobile');
      if (accountLink) accountLink.style.display = 'block';
      if (accountLinkMobile) accountLinkMobile.style.display = 'block';
    }
  }

  // Note: Auto-logout removed to prevent interference with normal navigation

  document.addEventListener('DOMContentLoaded', () => {
    // Initialize phone inputs with +375 and add formatting
    initializePhoneInputs();
    addPhoneFormatting();
    
    const authForm = document.getElementById('authForm');
    const authStatus = document.getElementById('authStatus');
    const userName = document.getElementById('userName');
    const userPhone = document.getElementById('userPhone');
    const userDiscount = document.getElementById('userDiscount');
    const userBookings = document.getElementById('userBookings');
    const logoutBtn = document.getElementById('logoutBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');

    // Update header navigation based on user status
    updateHeaderNavigation();
    
    // Handle login page specifically
    const current = getUser();
    if (current) {
      if (authForm && authStatus) {
        authForm.style.display = 'none';
        authStatus.style.display = 'block';
        userName && (userName.textContent = current.name || 'Гость');
        userPhone && (userPhone.textContent = current.phone || '');
        userBookings && (userBookings.textContent = String(current.bookingsCount || 0));
        userDiscount && (userDiscount.textContent = `${calcDiscount(current.bookingsCount||0)}%`);
      }
    } else {
      if (authForm && authStatus) {
        authForm.style.display = 'block';
        authStatus.style.display = 'none';
      }
    }

    logoutBtn && logoutBtn.addEventListener('click', logout);
    headerLogoutBtn && headerLogoutBtn.addEventListener('click', logout);
    headerLogoutBtnMobile && headerLogoutBtnMobile.addEventListener('click', logout);

    authForm && authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(authForm);
      const name = fd.get('name');
      const phone = fd.get('phone');
      const password = fd.get('password');
      
      if (!name || !phone || !password) {
        showNotification('Пожалуйста, заполните все обязательные поля.', 'error');
        return;
      }
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
      const existingUser = users.find(u => u.phone === phone);
      
      if (existingUser) {
        showNotification('Пользователь с таким телефоном уже существует. Войдите в аккаунт.', 'error');
        return;
      }
      
      const user = {
        name: name,
        phone: phone,
        email: fd.get('email') || '',
        password: password,
        bookingsCount: 0,
        discount: 0
      };
      
      // Save to users list but don't log in automatically
      await upsertUserToSheets(user);
      
      // Don't clear form - preserve values for login
      showNotification('Регистрация успешна! Теперь войдите в аккаунт.', 'success');
    });

    loginBtn && loginBtn.addEventListener('click', async () => {
      // Check if user exists first
      const fd = new FormData(authForm);
      const phone = fd.get('phone');
      const password = fd.get('password');
      
      if (!phone || !password) {
        showNotification('Пожалуйста, заполните все поля.', 'error');
        return;
      }
      
      // Get existing users
      const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
      const existingUser = users.find(u => u.phone === phone && u.password === password);
      
      if (existingUser) {
        saveUserToLocal(existingUser);
        
        // If admin, redirect to database page
        if (existingUser.password === 'admin123') {
          window.location.href = 'admin-database.html';
        } else {
          // Redirect to home page
          window.location.href = '../index.html';
        }
      } else {
        showNotification('Пользователь не найден. Сначала зарегистрируйтесь.', 'error');
        // Don't clear form - preserve values for retry
      }
    });

    // Attach user info to booking form if exists
    document.addEventListener('click', (e) => {
      if (e.target.matches('.booking-btn, .booking-btn *')) {
        const user = getUser();
        if (user) {
          const nameInput = document.querySelector('#bookingForm input[name="name"]');
          const phoneInput = document.querySelector('#bookingForm input[name="phone"]');
          if (nameInput && !nameInput.value) nameInput.value = user.name || '';
          if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
        }
      }
    });
  });

  // Password visibility toggle function
  function togglePasswordVisibility() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('passwordToggle');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      passwordInput.type = 'password';
      toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  }

  // Make togglePasswordVisibility globally available
  window.togglePasswordVisibility = togglePasswordVisibility;

  // Password validation function
  function validatePassword(password) {
    const requirements = {
      length: password.length >= 8 && password.length <= 64,
      digit: /\d/.test(password),
      specialChars: /^[a-zA-Z0-9~!?@#$%^&*_\-+()\[\]{}></\\|"'.:,]+$/.test(password)
    };
    return requirements;
  }

  // Add real-time password validation
  document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
      passwordInput.addEventListener('input', function() {
        const password = this.value;
        const validation = validatePassword(password);
        
        // Remove existing validation messages
        const existingMessage = document.querySelector('.password-validation-message');
        if (existingMessage) {
          existingMessage.remove();
        }
        
        if (password.length > 0) {
          const message = document.createElement('div');
          message.className = 'password-validation-message';
          message.style.cssText = 'grid-column: 2; font-size: 0.8rem; margin-top: -0.5rem; margin-bottom: 1rem;';
          
          let messageText = 'Проверка пароля: ';
          let isValid = true;
          
          if (!validation.length) {
            messageText += '❌ Длина должна быть 8-64 символа. ';
            isValid = false;
          } else {
            messageText += '✅ Длина подходит. ';
          }
          
          if (!validation.digit) {
            messageText += '❌ Нужна хотя бы 1 цифра. ';
            isValid = false;
          } else {
            messageText += '✅ Цифра найдена. ';
          }
          
          if (!validation.specialChars) {
            messageText += '❌ Недопустимые символы. ';
            isValid = false;
          } else {
            messageText += '✅ Символы корректны. ';
          }
          
          message.innerHTML = messageText;
          message.style.color = isValid ? '#4CAF50' : '#f44336';
          
          // Insert after password requirements
          const requirements = document.querySelector('.password-requirements');
          if (requirements) {
            requirements.parentNode.insertBefore(message, requirements.nextSibling);
          }
        }
      });
    }
  });
})();


