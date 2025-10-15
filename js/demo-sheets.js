// Demo Google Sheets Simulator - Works locally without Google account
class DemoSheets {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
        this.users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        this.initDemoUI();
    }

    initDemoUI() {
        // Demo panel is no longer needed since we have a proper admin database page
    }

    showBookings() {
        const container = document.getElementById('demoData');
        if (!container) return;

        if (this.bookings.length === 0) {
            container.innerHTML = '<p>Бронирований пока нет</p>';
            return;
        }

        let html = '<h4>📅 Бронирования:</h4><table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: var(--light-gray);"><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Дата</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Время</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Имя</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Телефон</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Тип</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Гости</th></tr>';
        
        this.bookings.forEach(booking => {
            const date = new Date(booking.timestamp).toLocaleDateString('ru-RU');
            html += `<tr><td style="padding: 0.5rem; border: 1px solid var(--gray);">${date}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${booking.time}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${booking.name}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${booking.phone}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${booking.tableType === 'vip' ? 'VIP' : 'Обычный'}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${booking.guests}</td></tr>`;
        });
        
        html += '</table>';
        container.innerHTML = html;
    }

    showUsers() {
        const container = document.getElementById('demoData');
        if (!container) return;

        if (this.users.length === 0) {
            container.innerHTML = '<p>Пользователей пока нет</p>';
            return;
        }

        let html = '<h4>👥 Пользователи:</h4><table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: var(--light-gray);"><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Имя</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Телефон</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Бронирований</th><th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray);">Скидка</th></tr>';
        
        this.users.forEach(user => {
            html += `<tr><td style="padding: 0.5rem; border: 1px solid var(--gray);">${user.name}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${user.phone}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${user.bookingsCount || 0}</td><td style="padding: 0.5rem; border: 1px solid var(--gray);">${user.discount || 0}%</td></tr>`;
        });
        
        html += '</table>';
        container.innerHTML = html;
    }

    clearAll() {
        this.bookings = [];
        this.users = [];
        localStorage.removeItem('demo_bookings');
        localStorage.removeItem('demo_users');
        document.getElementById('demoData').innerHTML = '<p>Все данные очищены</p>';
    }

    // Simulate Google Sheets API
    async handleBooking(data) {
        // Calculate and add discount to booking data
        if (data.userPhone) {
            const user = this.users.find(u => u.phone === data.userPhone);
            if (user) {
                user.bookingsCount = (user.bookingsCount || 0) + 1;
                
                // Calculate discount
                if (user.bookingsCount >= 10) user.discount = 10;
                else if (user.bookingsCount >= 5) user.discount = 5;
                else user.discount = 0;
                
                // Add discount to booking data
                data.discount = user.discount;
                
                localStorage.setItem('demo_users', JSON.stringify(this.users));
            }
        }
        
        this.bookings.push(data);
        localStorage.setItem('demo_bookings', JSON.stringify(this.bookings));
        
        return { success: true, message: 'Бронирование сохранено!' };
    }

    async handleUserUpsert(data) {
        const existingIndex = this.users.findIndex(u => u.phone === data.phone);
        
        if (existingIndex >= 0) {
            this.users[existingIndex] = { ...this.users[existingIndex], ...data };
        } else {
            this.users.push(data);
        }
        
        localStorage.setItem('demo_users', JSON.stringify(this.users));
        return { success: true, message: 'Пользователь сохранен!' };
    }


}

// Initialize demo sheets
let demoSheets;
document.addEventListener('DOMContentLoaded', () => {
    demoSheets = new DemoSheets();
});
