// Booking system with Google Sheets integration
class BookingSystem {
    constructor() {
        this.totalTables = 10;
        this.totalVipRooms = 1;
        this.bookings = [];
        
        // Google Apps Script Web App URL (replace with your actual URL)
        this.googleSheetsURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        
        this.initializeModal();
        this.bindEvents();
    }

    initializeModal() {
        const modalHTML = `
            <div class="booking-modal-overlay" id="bookingModal">
                <div class="booking-modal">
                    <h2>Забронировать столик</h2>
                    <button class="booking-modal-close" id="closeBookingModal">
                        <img src="img/cross.svg" alt="close">
                    </button>
                    
                    <form id="bookingForm" class="booking-form">
                        <div class="booking-field">
                            <label>Имя *</label>
                            <input type="text" name="name" required class="input">
                        </div>
                        
                        <div class="booking-field">
                            <label>Телефон *</label>
                            <div class="phone-input-container">
                                <input type="tel" name="phone" required class="input phone-input" value="+375">
                                <span class="phone-placeholder">(29) 000-00-00</span>
                            </div>
                        </div>
                        
                        <div class="booking-field">
                            <label>Дата *</label>
                            <input type="date" name="date" required class="input">
                        </div>
                        
                        <div class="booking-field">
                            <label>Время *</label>
                            <select name="time" required class="input">
                                <option value="">Выберите время</option>
                                <option value="16:00">16:00</option>
                                <option value="17:00">17:00</option>
                                <option value="18:00">18:00</option>
                                <option value="19:00">19:00</option>
                                <option value="20:00">20:00</option>
                                <option value="21:00">21:00</option>
                                <option value="22:00">22:00</option>
                                <option value="23:00">23:00</option>
                                <option value="00:00">00:00</option>
                                <option value="01:00">01:00</option>
                                <option value="02:00">02:00</option>
                            </select>
                        </div>
                        
                        <div class="booking-field">
                            <label>Количество гостей *</label>
                            <select name="guests" required class="input">
                                <option value="">Выберите количество</option>
                                <option value="1">1 гость</option>
                                <option value="2">2 гостя</option>
                                <option value="3">3 гостя</option>
                                <option value="4">4 гостя</option>
                                <option value="5">5 гостей</option>
                                <option value="6">6 гостей</option>
                                <option value="7">7 гостей</option>
                                <option value="8">8 гостей</option>
                            </select>
                        </div>
                        
                        <div class="booking-field">
                            <label>Тип бронирования *</label>
                            <select name="tableType" required class="input">
                                <option value="">Выберите тип</option>
                                <option value="regular">Обычный столик</option>
                                <option value="vip">VIP-комната с караоке</option>
                            </select>
                        </div>
                        
                        <div class="booking-field">
                            <label>Комментарий</label>
                            <textarea name="comment" class="input" rows="3" placeholder="Особые пожелания..."></textarea>
                        </div>
                        
                        <button type="submit" class="button primary booking-submit">
                            Забронировать
                        </button>
                    </form>
                    
                    <div class="booking-success" id="bookingSuccess" style="display: none;">
                        <h3>Бронирование успешно!</h3>
                        <p>Мы свяжемся с вами в ближайшее время для подтверждения.</p>
                        <button class="button primary" id="closeSuccessModal">Закрыть</button>
                    </div>
                    
                    <div class="booking-error" id="bookingError" style="display: none;">
                        <h3>Упс! Мест нет</h3>
                        <p id="errorMessage">На выбранное время все столики заняты. Попробуйте другое время или дату.</p>
                        <button class="button primary" id="closeErrorModal">Понятно</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        // Open booking modal - require login first
        document.addEventListener('click', (e) => {
            if (e.target.matches('.booking-btn, .booking-btn *')) {
                e.preventDefault();
                this.checkLoginAndBook();
            }
        });

        // Close modal events
        document.getElementById('closeBookingModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('closeSuccessModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('closeErrorModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Close on overlay click
        document.getElementById('bookingModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // Handle form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmission(e.target);
        });

        // Set minimum date to today
        const dateInput = document.querySelector('input[name="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    checkLoginAndBook() {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('thefirst_user') || 'null');
        
        if (!user) {
            // Show login required message
            this.showLoginRequired();
        } else {
            this.openModal();
        }
    }

    showLoginRequired() {
        // Show popup warning first
        const warningHTML = `
            <div class="login-warning-overlay" id="loginWarningModal">
                <div class="login-warning-modal">
                    <h3>Требуется авторизация</h3>
                    <p>Для бронирования необходимо войти в аккаунт или зарегистрироваться</p>
                    <div class="warning-buttons">
                        <button class="button primary" id="goToLogin">Войти в аккаунт</button>
                        <button class="button" id="closeWarning">Отмена</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', warningHTML);
        
        // Add event listeners
        document.getElementById('goToLogin').addEventListener('click', () => {
            const loginPath = window.location.pathname.includes('pages/') ? 'login.html' : 'pages/login.html';
            window.location.href = loginPath;
        });
        
        document.getElementById('closeWarning').addEventListener('click', () => {
            document.getElementById('loginWarningModal').remove();
        });
        
        // Close on overlay click
        document.getElementById('loginWarningModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.getElementById('loginWarningModal').remove();
            }
        });
    }

    openModal() {
        document.getElementById('bookingModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add phone formatting when modal opens
        setTimeout(() => {
            this.addPhoneFormatting();
        }, 100);
    }

    closeModal() {
        document.getElementById('bookingModal').classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form and views
        setTimeout(() => {
            document.getElementById('bookingForm').reset();
            document.getElementById('bookingForm').style.display = 'block';
            document.getElementById('bookingSuccess').style.display = 'none';
            document.getElementById('bookingError').style.display = 'none';
        }, 300);
    }

    async handleBookingSubmission(form) {
        const formData = new FormData(form);
        const bookingData = Object.fromEntries(formData);
        
        // Enrich with user info from local account (if present)
        try {
            const rawUser = localStorage.getItem('thefirst_user');
            if (rawUser) {
                const user = JSON.parse(rawUser);
                bookingData.userName = user.name || '';
                bookingData.userPhone = user.phone || '';
                bookingData.userEmail = user.email || '';
            }
        } catch(_) {}
        
        // Add timestamp
        bookingData.timestamp = new Date().toISOString();
        
        // Show loading state
        const submitBtn = form.querySelector('.booking-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Бронирую...';
        submitBtn.disabled = true;

        try {
            // Check availability
            const isAvailable = await this.checkAvailability(bookingData);
            
            if (!isAvailable.available) {
                this.showError(isAvailable.message);
                return;
            }

                    // Submit to demo sheets (works locally)
        const response = await demoSheets.handleBooking(bookingData);

            // Increase local bookings counter for discount program
            try {
                const rawUser = localStorage.getItem('thefirst_user');
                if (rawUser) {
                    const user = JSON.parse(rawUser);
                    user.bookingsCount = (user.bookingsCount || 0) + 1;
                    localStorage.setItem('thefirst_user', JSON.stringify(user));
                }
            } catch(_) {}

            // Show success
            this.showSuccess();

        } catch (error) {
            console.error('Booking error:', error);
            this.showError('Произошла ошибка. Попробуйте позже или позвоните нам.');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async checkAvailability(bookingData) {
        // Simulate availability check
        // In real implementation, this would check against existing bookings
        
        const { tableType, date, time } = bookingData;
        
        // For demo purposes, randomly make some slots unavailable
        const isWeekend = new Date(date).getDay() >= 5;
        const isPeakHours = ['19:00', '20:00', '21:00'].includes(time);
        
        if (tableType === 'vip') {
            // VIP room has only 1 slot
            if (isWeekend && isPeakHours && Math.random() > 0.3) {
                return {
                    available: false,
                    message: 'VIP-комната на это время уже забронирована. Попробуйте другое время.'
                };
            }
        } else {
            // Regular tables (10 total)
            if (isWeekend && isPeakHours && Math.random() > 0.2) {
                return {
                    available: false,
                    message: 'Все столики на это время заняты. Попробуйте другое время или забронируйте VIP-комнату.'
                };
            }
        }

        return { available: true };
    }

    showSuccess() {
        document.getElementById('bookingForm').style.display = 'none';
        document.getElementById('bookingSuccess').style.display = 'block';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('bookingForm').style.display = 'none';
        document.getElementById('bookingError').style.display = 'block';
    }

    // Phone number formatting function
    formatPhoneNumber(input) {
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

    // Update placeholder visibility based on input content
    updatePlaceholderVisibility(input) {
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

    // Add phone formatting to booking form
    addPhoneFormatting() {
        const phoneInput = document.querySelector('#bookingForm input[name="phone"]');
        if (phoneInput) {
            // Ensure +375 is pre-filled
            if (!phoneInput.value || phoneInput.value === '') {
                phoneInput.value = '+375';
            }
            
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
                this.updatePlaceholderVisibility(e.target);
            });
            
            phoneInput.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.formatPhoneNumber(e.target);
                    this.updatePlaceholderVisibility(e.target);
                }, 0);
            });

            // Prevent deletion of +375 prefix
            phoneInput.addEventListener('keydown', (e) => {
                if ((e.keyCode === 8 || e.keyCode === 46) && phoneInput.value === '+375') {
                    e.preventDefault();
                }
            });

            // Initialize placeholder visibility
            this.updatePlaceholderVisibility(phoneInput);
        }
    }

}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
});
