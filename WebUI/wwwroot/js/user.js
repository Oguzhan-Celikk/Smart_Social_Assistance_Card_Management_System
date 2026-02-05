// User Dashboard functionality
class UserDashboard {
    constructor() {
    this.apiBaseUrl = 'http://localhost:5032/api';
        this.currentUser = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.init();
    }

    init() {
        if (!this.checkAuthentication()) {
            return;
        }

        this.setupEventListeners();
        // Load profile and dashboard first, then proactively load cards and transactions
        this.loadUserData()
            .finally(() => {
                // Preload data for tabs so they don't get stuck on "Yükleniyor..."
                this.loadCards();
                this.loadTransactions();
            });
    }

    checkAuthentication() {
        const token = document.getElementById('jwtToken')?.value || localStorage.getItem('userToken');
        if (!token) {
            window.location.href = '/Login';
            return false;
        }
        return true;
    }

    setupEventListeners() {
        // Tab switching (Bootstrap tabs)
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const href = e.target.getAttribute('href') || e.target.dataset.bsTarget;
                const target = (href || '').replace('#', '');
                if (target) this.handleTabChange(target);
                // keep URL hash in sync
                if (href && href.startsWith('#')) {
                    history.replaceState(null, '', href);
                }
            });
            // Fallback: ensure click activates and loads content even if bootstrap event doesn't fire
            tab.addEventListener('click', (e) => {
                const href = e.currentTarget.getAttribute('href') || e.currentTarget.dataset.bsTarget;
                const target = (href || '').replace('#', '');
                if (!target) return;
                // Activate tab via Bootstrap if available
                if (window.bootstrap) {
                    const tabObj = new bootstrap.Tab(e.currentTarget);
                    tabObj.show();
                }
                this.handleTabChange(target);
            });
        });

        // Initialize from hash
        const hash = (location.hash || '#profile');
        const initialTab = document.querySelector(`a[data-bs-toggle="tab"][href="${hash}"]`);
        if (initialTab) {
            if (window.bootstrap) {
                new bootstrap.Tab(initialTab).show();
            }
            this.handleTabChange(hash.replace('#',''));
        }

        // Card filter
        const cardFilter = document.getElementById('cardFilter');
        if (cardFilter) {
            cardFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.loadTransactions();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => { e.preventDefault(); this.logout(); });
        }
    }

    handleTabChange(target) {
        switch (target) {
            case 'cards':
                this.loadCards();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
        }
    }

    async loadUserData() {
        try {
            // Get profile using /api/user/profile
            const response = await this.apiCall('/user/profile', 'GET');
            if (!response.ok) return;

            const profile = await response.json();
            this.currentUser = profile;
            // Also fetch citizen details mapped by Citizen_ID
            const citizenRes = await this.apiCall('/user/citizen', 'GET');
            const citizen = citizenRes.ok ? await citizenRes.json() : {};

            this.displayUserProfile({
                fullName: citizen.fullName ?? citizen.FullName,
                national_ID: profile.national_ID ?? profile.National_ID,
                gender: citizen.gender ?? citizen.Gender,
                birthDate: citizen.birthDate ?? citizen.BirthDate,
                city: citizen.city ?? citizen.City,
                phoneNumber: citizen.phoneNumber ?? citizen.PhoneNumber,
                email: citizen.email ?? citizen.Email,
                isActive: (citizen.isActive ?? citizen.IsActive)
            });
            await this.loadDashboardStats();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    displayUserProfile(user) {
    document.getElementById('userName').textContent = user.fullName || 'Kullanıcı';

        const profileInfo = document.getElementById('profileInfo');
        profileInfo.innerHTML = `
            <div class="row">
                <div class="col-sm-6"><strong>Ad Soyad:</strong></div>
                <div class="col-sm-6">${user.fullName || '-'}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>TC Kimlik No:</strong></div>
                <div class="col-sm-6">${user.national_ID || '-'}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>Cinsiyet:</strong></div>
                <div class="col-sm-6">${this.getGenderText(user.gender)}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>Doğum Tarihi:</strong></div>
                <div class="col-sm-6">${this.formatDate(user.birthDate)}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>Şehir:</strong></div>
                <div class="col-sm-6">${user.city || '-'}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>Telefon:</strong></div>
                <div class="col-sm-6">${user.phoneNumber || '-'}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>E-posta:</strong></div>
                <div class="col-sm-6">${user.email || '-'}</div>
            </div>
            <hr>
            <div class="row">
                <div class="col-sm-6"><strong>Durum:</strong></div>
                <div class="col-sm-6">
                    <span class="${user.isActive ? 'status-active' : 'status-inactive'}">
                        <i class="fas ${user.isActive ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                </div>
            </div>
        `;
    }

    async loadDashboardStats() {
        try {
            const res = await this.apiCall('/user/cards', 'GET');
            if (!res.ok) return;
            const cards = await res.json();
            const totalBalance = cards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
            const activeCards = cards.filter(card => card.status_ === 'Active').length;

            document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance);
            document.getElementById('activeCards').textContent = activeCards;
            this.populateCardFilter(cards);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    async loadCards() {
        try {
            const response = await this.apiCall('/user/cards', 'GET');

            if (response.ok) {
                const cards = await response.json();
                this.displayCards(cards);
            } else {
                this.showTableError('cardsTable', 'Kartlar yüklenemedi.', 7);
            }
        } catch (error) {
            console.error('Error loading cards:', error);
            this.showTableError('cardsTable', 'Bağlantı hatası.', 7);
        }
    }

    displayCards(cards) {
        const tbody = document.getElementById('cardsTable');

        if (cards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Kayıtlı kart bulunmamaktadır.</td></tr>';
            return;
        }

        tbody.innerHTML = cards.map(card => {
            const rawStatus = card.status_ ?? card.status; // fallback alternative alan
            return `
            <tr>
                <td><strong>${card.cardNumber}</strong></td>
                <td>${this.formatDate(card.issueDate)}</td>
                <td>${this.formatDate(card.expiryDate)}</td>
                <td><strong>${this.formatCurrency(card.currentBalance)}</strong></td>
                <td>${this.formatCurrency(card.monthlyLimit)}</td>
                <td>
                    <span class="badge ${this.getStatusClass(rawStatus)}">
                        ${this.translateStatus(rawStatus)}
                    </span>
                </td>
                <td>${card.lastUsedDate ? this.formatDate(card.lastUsedDate) : 'Hiç kullanılmamış'}</td>
            </tr>`;
        }).join('');
    }

    async loadTransactions(page = 1) {
        try {
            const cardFilter = document.getElementById('cardFilter')?.value || '';
            const response = await this.apiCall('/user/transactions', 'GET');

            if (response.ok) {
                let transactions = await response.json();
                if (cardFilter) {
                    transactions = transactions.filter(t => String(t.card_ID) === String(cardFilter));
                }
                const { items, totalPages } = this.paginate(transactions, page, this.pageSize);
                this.displayTransactions(items);
                this.displayPagination(page, totalPages);
            } else {
                this.showTableError('transactionsTable', 'İşlemler yüklenemedi.', 9);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showTableError('transactionsTable', 'Bağlantı hatası.', 9);
        }
    }

    displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsTable');

        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">İşlem geçmişi bulunmamaktadır.</td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${this.formatDateTime(transaction.transactionDate)}</td>
                <td>${transaction.card_ID || '-'}</td>
                <td><strong>${this.formatCurrency(transaction.amount)}</strong></td>
        <td>${this.translateTransactionType(transaction.transactionType)}</td>
                <td>${transaction.city || '-'}</td>
                <td>${this.formatCurrency(transaction.previousBalance)}</td>
                <td>${this.formatCurrency(transaction.newBalance)}</td>
                <td>
                    <span class="badge ${this.getStatusClass(transaction.status)}">
            ${this.translateStatus(transaction.status)}
                    </span>
                </td>
                <td>
                    ${transaction.isFraudSuspected ?
            '<span class="badge bg-warning"><i class="fas fa-exclamation-triangle"></i> Şüpheli</span>' :
            '<span class="badge bg-success"><i class="fas fa-check"></i> Güvenli</span>'
        }
                </td>
            </tr>
        `).join('');
    }

    paginate(items, page, pageSize) {
        const total = items?.length || 0;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        return { items: (items || []).slice(start, start + pageSize), totalPages };
    }

    // Utility methods
    async apiCall(endpoint, method = 'GET', body = null) {
        const token = document.getElementById('jwtToken')?.value || localStorage.getItem('userToken');
        const config = {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        return fetch(`${this.apiBaseUrl}${endpoint}`, config);
    }

    formatCurrency(amount) {
        return `₺${(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    }

    formatDate(dateString) {
        return dateString ? new Date(dateString).toLocaleDateString('tr-TR') : '-';
    }

    formatDateTime(dateString) {
        return dateString ? new Date(dateString).toLocaleString('tr-TR') : '-';
    }

    getGenderText(gender) {
        if (gender == null) return '-';
        // Handle char(1) (possibly space-padded) and longer strings
        let raw = String(gender).trim();
        if (raw.length > 1) raw = raw[0];
        const g = raw.toLowerCase();
        const erkekVals = ['m','male','erkek','e','bay','man','1','true'];
        const kadinVals = ['f','female','kadin','kadın','k','bayan','woman','0','false'];
        if (erkekVals.includes(g)) return 'Erkek';
        if (kadinVals.includes(g)) return 'Kadın';
        // If full words provided differently, try startsWith
        if (g.startsWith('erk')) return 'Erkek';
        if (g.startsWith('kad')) return 'Kadın';
        return '-';
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'success':
            case 'completed':
                return 'bg-success';
            case 'inactive':
            case 'expired':
            case 'failed':
                return 'bg-danger';
            case 'pending':
            case 'processing':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    }

    // English -> Turkish status text
    translateStatus(status) {
        if (!status) return 'Bilinmiyor';
        const map = {
            'active': 'Aktif',
            'inactive': 'Pasif',
            'enabled': 'Aktif',
            'disabled': 'Pasif',
            'expired': 'Süresi Dolmuş',
            'pending': 'Beklemede',
            'pending approval': 'Onay Bekliyor',
            'on hold': 'Beklemede',
            'processing': 'İşleniyor',
            'failed': 'Başarısız',
            'success': 'Başarılı',
            'successful': 'Başarılı',
            'completed': 'Tamamlandı',
            'blocked': 'Blokeli',
            'locked': 'Kilitli',
            'cancelled': 'İptal Edildi',
            'canceled': 'İptal Edildi',
            'reversed': 'Tersine Çevrildi',
            'refunded': 'İade Edildi',
            'suspended': 'Askıya Alındı',
            'approved': 'Onaylandı',
            'declined': 'Reddedildi',
            'denied': 'Reddedildi',
            'error': 'Hata',
            'processing error': 'İşleme Hatası'
        };
        const raw = String(status).trim().toLowerCase();
        if (map[raw]) return map[raw];
        // Normalize by collapsing separators
        const collapsed = raw.replace(/[\s_-]+/g, ' '); // for keys that have spaces
        if (map[collapsed]) return map[collapsed];
        const nospace = raw.replace(/[\s_-]+/g, '');
        // Try variants for e.g. pendingapproval
        const variantMap = {
            'pendingapproval': 'Onay Bekliyor',
            'onhold': 'Beklemede'
        };
        if (variantMap[nospace]) return variantMap[nospace];
        return status; // fallback original if unknown
    }

    // English -> Turkish transaction type text
    translateTransactionType(type) {
        if (!type) return '-';
        const map = {
            'purchase': 'Satın Alma',
            'payment': 'Ödeme',
            'topup': 'Bakiye Yükleme',
            'top-up': 'Bakiye Yükleme',
            'top up': 'Bakiye Yükleme',
            'reload': 'Bakiye Yükleme',
            'refund': 'İade',
            'reverse': 'Ters İşlem',
            'reversal': 'Ters İşlem',
            'transfer': 'Transfer',
            'withdrawal': 'Para Çekme',
            'cashout': 'Para Çekme',
            'deposit': 'Para Yatırma',
            'fee': 'Ücret',
            'commission': 'Komisyon',
            'adjustment': 'Düzeltme',
            'correction': 'Düzeltme',
            'chargeback': 'Ters İbraz',
            'authorization': 'Yetkilendirme',
            'auth': 'Yetkilendirme'
        };
        const raw = String(type).trim().toLowerCase();
        if (map[raw]) return map[raw];
        const collapsed = raw.replace(/[\s_-]+/g, ' ');
        if (map[collapsed]) return map[collapsed];
        const nospace = raw.replace(/[\s_-]+/g, '');
        const variantMap = {
            'topup': 'Bakiye Yükleme'
        };
        if (variantMap[nospace]) return variantMap[nospace];
        return type; // unknowns left as-is
    }

    populateCardFilter(cards) {
        const cardFilter = document.getElementById('cardFilter');
        if (cardFilter) {
            cardFilter.innerHTML = '<option value="">Tüm Kartlar</option>';
            cards.forEach(card => {
                cardFilter.innerHTML += `<option value="${card.card_ID}">${card.cardNumber}</option>`;
            });
        }
    }

    showTableError(tableId, message, colSpan) {
        document.getElementById(tableId).innerHTML =
            `<tr><td colspan="${colSpan}" class="text-center text-danger">${message}</td></tr>`;
    }

    displayPagination(currentPage, totalPages) {
        const pagination = document.getElementById('transactionPagination');
        if (!pagination) return;

        let html = '';

        // Previous button
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="userDashboard.loadTransactions(${currentPage - 1})">Önceki</a>
        </li>`;

        // Page numbers
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="userDashboard.loadTransactions(${i})">${i}</a>
            </li>`;
        }

        // Next button
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="userDashboard.loadTransactions(${currentPage + 1})">Sonraki</a>
        </li>`;

        pagination.innerHTML = html;
    }

    logout() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('citizenId');
        localStorage.removeItem('userName');
    window.location.href = '/Login/Logout';
    }
}

// Global instance
let userDashboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    userDashboard = new UserDashboard();
});