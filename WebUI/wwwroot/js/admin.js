// Admin Dashboard functionality
class AdminDashboard {
    constructor() {
    // Backend API base
    this.apiBaseUrl = 'http://localhost:5032/api';
        this.currentSection = 'dashboard';
        this.currentPage = 1;
        this.pageSize = 10;
        this.init();
    }

    init() {
        if (!this.checkAuthentication()) {
            return;
        }

        this.setupEventListeners();
        this.loadDashboard();
    }

    checkAuthentication() {
        // Prefer server-injected JWT/role (Razor view), fallback to localStorage for legacy
        const token = document.getElementById('jwtToken')?.value || localStorage.getItem('userToken');
        const role = document.getElementById('userRole')?.value || localStorage.getItem('userRole');

        if (!token) {
            window.location.href = '/Login';
            return false;
        }
        // Role enforcement is handled by server [Authorize]. Front-end proceeds.
        return true;
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

    // Search inputs (client-side filter)
    this.setupSearchHandlers();

        // Logout
        const logoutBtn = document.querySelector('[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
    }

    setupSearchHandlers() {
        const searchInputs = [
            { id: 'citizenSearch', handler: () => this.loadCitizens(1) },
            { id: 'cardSearch', handler: () => this.loadCards(1) },
            { id: 'vendorSearch', handler: () => this.loadVendors(1) }
        ];

        searchInputs.forEach(({ id, handler }) => {
            const input = document.getElementById(id);
            if (input) {
                let debounceTimer;
                input.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(handler, 500);
                });
            }
        });

        // Operations (Transactions): update immediately on any criteria change
        const txSearch = document.getElementById('transactionSearch');
        if (txSearch) {
            txSearch.addEventListener('input', () => this.loadTransactions(1));
        }
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadTransactions(1));
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    showSection(section) {
        // Hide all sections
        document.querySelectorAll('[id^="section-"]').forEach(el => {
            el.style.display = 'none';
        });

        // Show selected section
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
            sectionElement.style.display = 'block';
        }

        // Update active menu item
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            citizens: 'Vatandaşlar',
            cards: 'Kartlar',
            transactions: 'İşlemler',
            alerts: 'Uyarılar',
            vendors: 'Satıcılar',
            cardtypes: 'Kart Türleri',
            rules: 'Kurallar',
            reports: 'Raporlar',
            users: 'Kullanıcılar',
            flags: 'İhlal Bayrakları',
            balancehistories: 'Bakiye Geçmişi',
            monthlycredits: 'Aylık Krediler',
            monthlyviolations: 'Aylık İhlaller',
            segments: 'Segmentler',
            monthlycardspending: 'Aylık Kart Harcamaları',
            monthlyvendorspending: 'Aylık Satıcı Harcamaları'
        };

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[section] || section;
        }

        this.currentSection = section;
        this.currentPage = 1;

        // Load section data
        this.loadSectionData(section);
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'citizens':
                this.loadCitizens();
                break;
            case 'cards':
                this.loadCards();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'alerts':
                this.loadAlerts();
                break;
            case 'vendors':
                this.loadVendors();
                break;
            case 'cardtypes':
                this.loadCardTypes();
                break;
            case 'rules':
                this.loadRules();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'flags':
                this.loadFlags();
                break;
            case 'balancehistories':
                this.loadBalanceHistories();
                break;
            case 'monthlycredits':
                this.loadMonthlyCredits();
                break;
            case 'monthlyviolations':
                this.loadMonthlyViolations();
                break;
            case 'segments':
                this.loadSegments();
                break;
            case 'monthlycardspending':
                this.loadMonthlyCardSpending();
                break;
            case 'monthlyvendorspending':
                this.loadMonthlyVendorsSpending();
                break;
        }
    }

    async loadDashboard() {
        try {
            // Fetch core collections in parallel then compute stats and recents
            const [citizensRes, cardsRes, txRes, alertsRes] = await Promise.all([
                this.apiCall('/admin/citizens'),
                this.apiCall('/admin/cards'),
                this.apiCall('/admin/transactions'),
                this.apiCall('/admin/alerts')
            ]);

            const [citizens, cards, transactions, alerts] = await Promise.all([
                citizensRes.ok ? citizensRes.json() : [],
                cardsRes.ok ? cardsRes.json() : [],
                txRes.ok ? txRes.json() : [],
                alertsRes.ok ? alertsRes.json() : []
            ]);

            this.updateDashboardStats({
                totalCitizens: (citizens || []).length,
                totalCards: (cards || []).length,
                totalTransactions: (transactions || []).length,
                totalAlerts: (alerts || []).length
            });

            // Recent 5 by date
            const recentTx = [...(transactions || [])]
                .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
                .slice(0, 5);
            this.displayRecentTransactions(recentTx);

            const recentAlerts = [...(alerts || [])]
                .sort((a, b) => new Date(b.alertDate) - new Date(a.alertDate))
                .slice(0, 5);
            this.displayRecentAlerts(recentAlerts);

        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalCitizens').textContent = stats.totalCitizens || 0;
        document.getElementById('totalCards').textContent = stats.totalCards || 0;
        document.getElementById('totalTransactions').textContent = stats.totalTransactions || 0;
        document.getElementById('totalAlerts').textContent = stats.totalAlerts || 0;
    }

    async loadRecentTransactions() {
        // Not used anymore; handled in loadDashboard by computing from all transactions
    }

    displayRecentTransactions(transactions) {
        const container = document.getElementById('recentTransactions');

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-muted">Henüz işlem bulunmamaktadır.</p>';
            return;
        }

    container.innerHTML = transactions.map(transaction => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>${this.formatCurrency(transaction.amount)}</strong>
                    <small class="d-block text-muted">${transaction.card_ID}</small>
                </div>
                <div class="text-end">
                    <small class="text-muted">${this.formatDate(transaction.transactionDate)}</small>
                    <span class="badge ${this.getStatusClass(transaction.status)} d-block">
            ${this.translateStatus(transaction.status)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async loadRecentAlerts() {
        // Not used anymore; handled in loadDashboard by computing from all alerts
    }

    displayRecentAlerts(alerts) {
        const container = document.getElementById('recentAlerts');

        if (alerts.length === 0) {
            container.innerHTML = '<p class="text-muted">Henüz uyarı bulunmamaktadır.</p>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>${alert.alertType || 'Genel Uyarı'}</strong>
                    <small class="d-block text-muted">${alert.message || 'Açıklama yok'}</small>
                </div>
                <div class="text-end">
                    <small class="text-muted">${this.formatDate(alert.alertDate)}</small>
                    <span class="badge ${alert.isSent ? 'bg-success' : 'bg-warning'} d-block">
                        ${alert.isSent ? 'Gönderildi' : 'Bekliyor'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async loadCitizens(page = 1) {
        try {
            const response = await this.apiCall('/admin/citizens', 'GET');

            if (response.ok) {
        let citizens = await response.json();
                const searchTerm = (document.getElementById('citizenSearch')?.value || '').toLowerCase();
                if (searchTerm) {
                    citizens = citizens.filter(c =>
            (c.fullName || '').toLowerCase().includes(searchTerm) ||
            (c.national_ID || '').toLowerCase().includes(searchTerm)
                    );
                }
                const { items, totalPages } = this.paginate(citizens, page, this.pageSize);
                this.displayCitizens(items);
                this.displayPagination('citizens', page, totalPages);
            } else {
                this.showTableError('citizensTable', 'Veriler yüklenemedi.', 10);
            }
        } catch (error) {
            console.error('Error loading citizens:', error);
            this.showTableError('citizensTable', 'Bağlantı hatası.', 10);
        }
    }

    displayCitizens(citizens) {
        const tbody = document.getElementById('citizensTable');

        if (!citizens || citizens.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">Vatandaş kaydı bulunmamaktadır.</td></tr>';
            return;
        }

        tbody.innerHTML = citizens.map(citizen => `
            <tr>
                <td>${citizen.citizen_ID}</td>
                <td>${citizen.fullName || '-'}</td>
                <td>${citizen.national_ID || '-'}</td>
                <td>${this.getGenderText(citizen.gender)}</td>
                <td>${this.formatDate(citizen.birthDate)}</td>
                <td>${citizen.city || '-'}</td>
                <td>${citizen.phoneNumber || '-'}</td>
                <td>${citizen.email || '-'}</td>
                <td>
                    <span class="badge ${citizen.isActive ? 'bg-success' : 'bg-danger'}">
                        ${citizen.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                </td>
                <td>${this.formatDateTime(citizen.createdAt)}</td>
            </tr>
        `).join('');
    }

    async loadCards(page = 1) {
        try {
            const response = await this.apiCall('/admin/cards', 'GET');
            if (response.ok) {
                let cards = await response.json();
                const term = (document.getElementById('cardSearch')?.value || '').toLowerCase();
                if (term) {
                    cards = cards.filter(c => (c.cardNumber || '').toLowerCase().includes(term));
                }
                const { items, totalPages } = this.paginate(cards, page, this.pageSize);
                this.displayCards(items);
                this.displayPagination('cards', page, totalPages);
            } else {
                this.showTableError('cardsTable', 'Veriler yüklenemedi.', 11);
            }
        } catch (e) {
            console.error('Error loading cards:', e);
            this.showTableError('cardsTable', 'Bağlantı hatası.', 11);
        }
    }

    displayCards(cards) {
        const tbody = document.getElementById('cardsTable');
        if (!cards || cards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center">Kart bulunamadı.</td></tr>';
            return;
        }
    tbody.innerHTML = cards.map(card => {
            const rawStatus = card.status_ ?? card.status;
            return `
            <tr>
        <td>${card.card_ID}</td>
        <td><strong>${card.cardNumber}</strong></td>
        <td>${card.citizen_ID || '-'}</td>
        <td>${this.formatDate(card.issueDate)}</td>
        <td>${this.formatDate(card.expiryDate)}</td>
        <td><strong>${this.formatCurrency(card.currentBalance)}</strong></td>
        <td>${this.formatCurrency(card.monthlyLimit)}</td>
        <td><span class="badge ${this.getStatusClass(rawStatus)}">${this.translateStatus(rawStatus)}</span></td>
        <td>${card.lastUsedDate ? this.formatDate(card.lastUsedDate) : '-'}</td>
        <td>${card.cardType_ID || '-'}</td>
    <td>${this.formatDateTime(card.createdAt)}</td>
            </tr>
        `;}).join('');
    }

    async loadTransactions(page = 1) {
        try {
            const response = await this.apiCall('/admin/transactions', 'GET');
            if (response.ok) {
                let tx = await response.json();
                // Optional filters
                const status = (document.getElementById('statusFilter')?.value || '').toLowerCase();
                const search = (document.getElementById('transactionSearch')?.value || '').toLowerCase();
                if (status) tx = tx.filter(t => (t.status || '').toLowerCase() === status);
                if (search) tx = tx.filter(t => String(t.card_ID || '').toLowerCase().includes(search));

                const { items, totalPages } = this.paginate(tx, page, this.pageSize);
                this.displayTransactions(items);
                this.displayPagination('transactions', page, totalPages);
            } else {
                this.showTableError('transactionsTable', 'Veriler yüklenemedi.', 15);
            }
        } catch (e) {
            console.error('Error loading transactions:', e);
            this.showTableError('transactionsTable', 'Bağlantı hatası.', 15);
        }
    }

    displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsTable');
        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="15" class="text-center">İşlem bulunamadı.</td></tr>';
            return;
        }
    tbody.innerHTML = transactions.map(t => `
            <tr>
        <td>${t.transaction_ID}</td>
        <td>${this.formatDateTime(t.transactionDate)}</td>
        <td>${t.card_ID}</td>
        <td>${t.vendor_ID || '-'}</td>
        <td><strong>${this.formatCurrency(t.amount)}</strong></td>
        <td>${this.translateTransactionType(t.transactionType)}</td>
        <td>${t.city || '-'}</td>
        <td>${this.formatCurrency(t.previousBalance)}</td>
        <td>${this.formatCurrency(t.newBalance)}</td>
        <td><span class="badge ${this.getStatusClass(t.status)}">${this.translateStatus(t.status)}</span></td>
        <td>${t.isFraudSuspected ? '<span class="badge bg-warning">Şüpheli</span>' : '<span class="badge bg-success">Güvenli</span>'}</td>
        <td>${this.formatDateTime(t.createdAt)}</td>
        <td>${t.ipAddress || '-'}</td>
        <td>${t.deviceInfo || '-'}</td>
    <td>${t.ruleViolations || '-'}</td>
            </tr>
        `).join('');
    }

    async loadAlerts(page = 1) {
        try {
            const res = await this.apiCall('/admin/alerts', 'GET');
            if (res.ok) {
                let alerts = await res.json();
                const { items, totalPages } = this.paginate(alerts, page, this.pageSize);
                this.displayAlerts(items);
                this.displayPagination('alerts', page, totalPages);
            } else {
                this.showTableError('alertsTable', 'Veriler yüklenemedi.', 6);
            }
        } catch (e) {
            console.error('Error loading alerts:', e);
            this.showTableError('alertsTable', 'Bağlantı hatası.', 6);
        }
    }

    displayAlerts(alerts) {
        const tbody = document.getElementById('alertsTable');
        if (!alerts || alerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Uyarı bulunamadı.</td></tr>';
            return;
        }
    tbody.innerHTML = alerts.map(a => `
            <tr>
        <td>${a.alert_ID}</td>
        <td>${this.formatDate(a.alertDate)}</td>
        <td>${a.citizen_ID}</td>
        <td>${a.alertType || '-'}</td>
        <td>${a.message || '-'}</td>
    <td>${a.isSent ? 'Evet' : 'Hayır'}</td>
            </tr>
        `).join('');
    }

    async loadVendors(page = 1) {
    try {
        const res = await this.apiCall('/admin/vendors', 'GET');
        if (res.ok) {
            let vendors = await res.json();

            // Arama terimini al
            const term = (document.getElementById('vendorSearch')?.value || '').toLowerCase();
            if (term) vendors = vendors.filter(v => (v.vendorName || '').toLowerCase().includes(term));

            // Sayfalama
            const { items, totalPages } = this.paginate(vendors, page, this.pageSize);

            // Vendor adlarının ilk harfini büyük yap
            items.forEach(v => {
                if (v.vendorName) {
                    v.vendorName = v.vendorName.charAt(0).toUpperCase() + v.vendorName.slice(1);
                }
            });

            // Listeyi göster
            this.displayVendors(items);
            this.displayPagination('vendors', page, totalPages);
        } else {
            this.showTableError('vendorsTable', 'Veriler yüklenemedi.', 6);
        }
    } catch (e) {
        console.error('Error loading vendors:', e);
        this.showTableError('vendorsTable', 'Bağlantı hatası.', 6);
    }
}


    displayVendors(vendors) {
        const tbody = document.getElementById('vendorsTable');
        if (!vendors || vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Satıcı bulunamadı.</td></tr>';
            return;
        }
        tbody.innerHTML = vendors.map(v => `
            <tr>
                <td>${v.vendor_ID}</td>
                <td>${v.vendorName || '-'}</td>
                <td>${v.category || '-'}</td>
                <td>${v.city || '-'}</td>
                <td>${v.address_ || '-'}</td>
                <td>${v.isActive ? 'Aktif' : 'Pasif'}</td>
            </tr>
        `).join('');
    }

    async loadUsers(page = 1) {
        try {
            const res = await this.apiCall('/admin/users', 'GET');
            if (!res.ok) {
                this.showTableError('usersTable', 'Veriler yüklenemedi.', 5);
                return;
            }
            const users = await res.json();
            const { items, totalPages } = this.paginate(users, page, this.pageSize);
            this.displayUsers(items);
            this.displayPagination('users', page, totalPages);
        } catch (e) {
            console.error('Error loading users:', e);
            this.showTableError('usersTable', 'Bağlantı hatası.', 5);
        }
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTable');
        if (!tbody) return;
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Kullanıcı bulunamadı.</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.user_ID}</td>
                <td>${u.national_ID}</td>
                <td>${u.role}</td>
                <td>${u.citizen_ID}</td>
                <td>${u.password || '-'}</td>
            </tr>
        `).join('');
    }

    async loadCardTypes(page = 1) {
        try {
            const res = await this.apiCall('/admin/cardtypes', 'GET');
            if (!res.ok) { this.showTableError('cardtypesTable', 'Veriler yüklenemedi.', 7); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayCardTypes(items);
            this.displayPagination('cardtypes', page, totalPages);
        } catch (e) {
            console.error('Error loading cardtypes:', e);
            this.showTableError('cardtypesTable', 'Bağlantı hatası.', 7);
        }
    }

    displayCardTypes(list) {
        const tbody = document.getElementById('cardtypesTable');
        if (!tbody) return;
        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Kayıt bulunamadı.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(ct => `
            <tr>
                <td>${ct.cardType_ID}</td>
                <td>${ct.typeName || '-'}</td>
                <td>${ct.description || '-'}</td>
                <td>${this.formatCurrency(ct.defaultMonthlyLimit)}</td>
                <td>${ct.allowedCategories || '-'}</td>
                <td>${ct.isActive ? 'Aktif' : 'Pasif'}</td>
                <td>${this.formatDateTime(ct.createdAt)}</td>
            </tr>
        `).join('');
    }

    async loadRules(page = 1) {
        try {
            const res = await this.apiCall('/admin/transactionrules', 'GET');
            if (!res.ok) { this.showTableError('rulesTable', 'Veriler yüklenemedi.', 10); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayRules(items);
            this.displayPagination('rules', page, totalPages);
        } catch (e) {
            console.error('Error loading rules:', e);
            this.showTableError('rulesTable', 'Bağlantı hatası.', 10);
        }
    }

    displayRules(list) {
        const tbody = document.getElementById('rulesTable');
        if (!tbody) return;
        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">Kural bulunamadı.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(r => `
            <tr>
                <td>${r.rule_ID}</td>
                <td>${r.ruleName || '-'}</td>
                <td>${r.description_ || '-'}</td>
                <td>${r.ruleType || '-'}</td>
                <td>${r.ruleValue || '-'}</td>
                <td>${r.severity || '-'}</td>
                <td>${r.isActive ? 'Aktif' : 'Pasif'}</td>
                <td>${this.formatDateTime(r.createdAt)}</td>
                <td>${r.ruleExpression || '-'}</td>
                <td>${r.appliesToCardType_ID || '-'}</td>
            </tr>
        `).join('');
    }

    // Flags
    async loadFlags(page = 1) {
        try {
            const res = await this.apiCall('/admin/flags', 'GET');
            if (!res.ok) { this.showTableError('flagsTable', 'Veriler yüklenemedi.', 8); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayFlags(items);
            this.displayPagination('flags', page, totalPages);
        } catch (e) {
            console.error('Error loading flags:', e);
            this.showTableError('flagsTable', 'Bağlantı hatası.', 8);
        }
    }
    displayFlags(list) {
        const tbody = document.getElementById('flagsTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(f => `
            <tr>
                <td>${f.flag_ID}</td>
                <td>${f.transaction_ID}</td>
                <td>${f.rule_ID}</td>
                <td>${f.card_ID}</td>
                <td>${this.formatDateTime(f.violationDate)}</td>
                <td>${f.violationDetail || '-'}</td>
                <td>${f.resolved ? 'Evet' : 'Hayır'}</td>
                <td>${this.translateSeverity(f.severity)}</td>
            </tr>
        `).join('');
    }

    // Balance histories
    async loadBalanceHistories(page = 1) {
        try {
            const res = await this.apiCall('/admin/balancehistories', 'GET');
            if (!res.ok) { this.showTableError('balancehistoriesTable', 'Veriler yüklenemedi.', 8); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayBalanceHistories(items);
            this.displayPagination('balancehistories', page, totalPages);
        } catch (e) {
            console.error('Error loading balance histories:', e);
            this.showTableError('balancehistoriesTable', 'Bağlantı hatası.', 8);
        }
    }
    displayBalanceHistories(list) {
        const tbody = document.getElementById('balancehistoriesTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(h => `
            <tr>
                <td>${h.history_ID}</td>
                <td>${h.card_ID}</td>
                <td>${h.citizen_ID}</td>
                <td>${h.cardNumber || '-'}</td>
                <td>${this.formatCurrency(h.oldBalance)}</td>
                <td>${this.formatDateTime(h.loggedAt)}</td>
                <td>${h.logMonth || '-'}</td>
                <td>${this.formatCurrency(h.newBalance)}</td>
            </tr>
        `).join('');
    }

    // Monthly credits
    async loadMonthlyCredits(page = 1) {
        try {
            const res = await this.apiCall('/admin/monthlycredits', 'GET');
            if (!res.ok) { this.showTableError('monthlycreditsTable', 'Veriler yüklenemedi.', 10); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayMonthlyCredits(items);
            this.displayPagination('monthlycredits', page, totalPages);
        } catch (e) {
            console.error('Error loading monthly credits:', e);
            this.showTableError('monthlycreditsTable', 'Bağlantı hatası.', 10);
        }
    }
    displayMonthlyCredits(list) {
        const tbody = document.getElementById('monthlycreditsTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="10" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(c => `
            <tr>
                <td>${c.credit_ID}</td>
                <td>${c.card_ID}</td>
                <td>${c.citizen_ID}</td>
                <td>${this.formatCurrency(c.limitAmount)}</td>
                <td>${this.formatCurrency(c.bonusAmount)}</td>
                <td>${this.formatCurrency(c.totalAmount)}</td>
                <td>${c.effectiveMonth}</td>
                <td>${c.effectiveYear}</td>
                <td>${c.isRegular ? 'Evet' : 'Hayır'}</td>
                <td>${this.formatDateTime(c.createdAt)}</td>
            </tr>
        `).join('');
    }

    // Monthly violations
    async loadMonthlyViolations(page = 1) {
        try {
            const res = await this.apiCall('/admin/monthlyviolations', 'GET');
            if (!res.ok) { this.showTableError('monthlyviolationsTable', 'Veriler yüklenemedi.', 6); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayMonthlyViolations(items);
            this.displayPagination('monthlyviolations', page, totalPages);
        } catch (e) {
            console.error('Error loading monthly violations:', e);
            this.showTableError('monthlyviolationsTable', 'Bağlantı hatası.', 6);
        }
    }
    displayMonthlyViolations(list) {
        const tbody = document.getElementById('monthlyviolationsTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(v => `
            <tr>
                <td>${v.citizen_ID}</td>
                <td>${v.year}</td>
                <td>${v.month}</td>
                <td>${v.violationCount}</td>
                <td>${this.formatDateTime(v.lastUpdated)}</td>
                <td>${v.card_ID}</td>
            </tr>
        `).join('');
    }

    // Segments
    async loadSegments(page = 1) {
        try {
            const res = await this.apiCall('/admin/segments', 'GET');
            if (!res.ok) { this.showTableError('segmentsTable', 'Veriler yüklenemedi.', 6); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displaySegments(items);
            this.displayPagination('segments', page, totalPages);
        } catch (e) {
            console.error('Error loading segments:', e);
            this.showTableError('segmentsTable', 'Bağlantı hatası.', 6);
        }
    }
    displaySegments(list) {
        const tbody = document.getElementById('segmentsTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(s => `
            <tr>
                <td>${s.segment_ID}</td>
                <td>${s.citizen_ID}</td>
                <td>${s.segmentName || '-'}</td>
                <td>${s.basedOnMonth}</td>
                <td>${s.basedOnYear}</td>
                <td>${this.formatDateTime(s.createdAt)}</td>
            </tr>
        `).join('');
    }

    // Monthly card spending
    async loadMonthlyCardSpending(page = 1) {
        try {
            const res = await this.apiCall('/admin/monthlycardspending', 'GET');
            if (!res.ok) { this.showTableError('monthlycardspendingTable', 'Veriler yüklenemedi.', 6); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayMonthlyCardSpending(items);
            this.displayPagination('monthlycardspending', page, totalPages);
        } catch (e) {
            console.error('Error loading monthly card spending:', e);
            this.showTableError('monthlycardspendingTable', 'Bağlantı hatası.', 6);
        }
    }
    displayMonthlyCardSpending(list) {
        const tbody = document.getElementById('monthlycardspendingTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(s => `
            <tr>
                <td>${s.cardSpending_ID}</td>
                <td>${s.reportMonth || '-'}</td>
                <td>${s.card_ID}</td>
                <td>${s.cardNumber || '-'}</td>
                <td>${this.formatCurrency(s.spendingAmount)}</td>
                <td>${s.note || '-'}</td>
            </tr>
        `).join('');
    }

    // Monthly vendor spending
    async loadMonthlyVendorsSpending(page = 1) {
        try {
            const res = await this.apiCall('/admin/monthlyvendorspending', 'GET');
            if (!res.ok) { this.showTableError('monthlyvendorspendingTable', 'Veriler yüklenemedi.', 7); return; }
            const list = await res.json();
            const { items, totalPages } = this.paginate(list, page, this.pageSize);
            this.displayMonthlyVendorsSpending(items);
            this.displayPagination('monthlyvendorspending', page, totalPages);
        } catch (e) {
            console.error('Error loading monthly vendor spending:', e);
            this.showTableError('monthlyvendorspendingTable', 'Bağlantı hatası.', 7);
        }
    }
    displayMonthlyVendorsSpending(list) {
        const tbody = document.getElementById('monthlyvendorspendingTable');
        if (!tbody) return;
        if (!list || list.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">Kayıt bulunamadı.</td></tr>'; return; }
        tbody.innerHTML = list.map(s => `
            <tr>
                <td>${s.vendorSpending_ID}</td>
                <td>${s.reportMonth || '-'}</td>
                <td>${s.card_ID}</td>
                <td>${s.vendor_ID}</td>
                <td>${s.cardNumber || '-'}</td>
                <td>${s.vendorName || '-'}</td>
                <td>${this.formatCurrency(s.spendingAmount)}</td>
            </tr>
        `).join('');
    }

    paginate(items, page, pageSize) {
        const total = items?.length || 0;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        return { items: (items || []).slice(start, start + pageSize), totalPages };
    }

    displayPagination(section, currentPage, totalPages) {
        const idMap = {
            citizens: 'citizensPagination',
            cards: 'cardsPagination',
            transactions: 'transactionsPagination',
            alerts: 'alertsPagination',
            vendors: 'vendorsPagination',
            users: 'usersPagination',
            cardtypes: 'cardtypesPagination',
            rules: 'rulesPagination',
            flags: 'flagsPagination',
            balancehistories: 'balancehistoriesPagination',
            monthlycredits: 'monthlycreditsPagination',
            monthlyviolations: 'monthlyviolationsPagination',
            segments: 'segmentsPagination',
            monthlycardspending: 'monthlycardspendingPagination',
            monthlyvendorspending: 'monthlyvendorspendingPagination'
        };
        const containerId = idMap[section];
        const pagination = document.getElementById(containerId);
        if (!pagination) return;

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        const loaderFunc = {
            citizens: (p) => `adminDashboard.loadCitizens(${p})`,
            cards: (p) => `adminDashboard.loadCards(${p})`,
            transactions: (p) => `adminDashboard.loadTransactions(${p})`,
            alerts: (p) => `adminDashboard.loadAlerts(${p})`,
            vendors: (p) => `adminDashboard.loadVendors(${p})`,
            users: (p) => `adminDashboard.loadUsers(${p})`,
            cardtypes: (p) => `adminDashboard.loadCardTypes(${p})`,
            rules: (p) => `adminDashboard.loadRules(${p})`,
            flags: (p) => `adminDashboard.loadFlags(${p})`,
            balancehistories: (p) => `adminDashboard.loadBalanceHistories(${p})`,
            monthlycredits: (p) => `adminDashboard.loadMonthlyCredits(${p})`,
            monthlyviolations: (p) => `adminDashboard.loadMonthlyViolations(${p})`,
            segments: (p) => `adminDashboard.loadSegments(${p})`,
            monthlycardspending: (p) => `adminDashboard.loadMonthlyCardSpending(${p})`,
            monthlyvendorspending: (p) => `adminDashboard.loadMonthlyVendorsSpending(${p})`
        }[section];

        const addPage = (p, text, disabled = false, active = false) => {
            html += `<li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}">` +
                `<a class="page-link" href="#" onclick="${loaderFunc(p)}">${text}</a>` +
                `</li>`;
        };

        addPage(Math.max(1, currentPage - 1), 'Önceki', currentPage === 1);
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            addPage(i, i, false, i === currentPage);
        }
        addPage(Math.min(totalPages, currentPage + 1), 'Sonraki', currentPage === totalPages);

        pagination.innerHTML = html;
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
    if (!gender) return '-';
    const g = gender.toString().trim().toLowerCase();
    // Desteklenen olası değerler: M, F, Male, Female, Erkek, Kadın, E, K
    if (['m', 'male', 'erkek', 'e'].includes(g)) return 'Erkek';
    if (['f', 'female', 'kadin', 'kadın', 'k'].includes(g)) return 'Kadın';
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

    // English -> Turkish status translation
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
        const collapsed = raw.replace(/[\s_-]+/g, ' ');
        if (map[collapsed]) return map[collapsed];
        const nospace = raw.replace(/[\s_-]+/g, '');
        const variant = { 'pendingapproval': 'Onay Bekliyor', 'onhold': 'Beklemede' };
        if (variant[nospace]) return variant[nospace];
        return status; // fallback original
    }

    // English -> Turkish transaction type translation
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
        const variant = { 'topup': 'Bakiye Yükleme' };
        if (variant[nospace]) return variant[nospace];
        return type;
    }

    // English -> Turkish severity (önem) translation
    translateSeverity(sev) {
        if (!sev) return '-';
        const map = {
            'low': 'Düşük',
            'medium': 'Orta',
            'med': 'Orta',
            'high': 'Yüksek',
            'critical': 'Kritik',
            'crit': 'Kritik',
            'info': 'Bilgi',
            'information': 'Bilgi',
            'warning': 'Uyarı',
            'warn': 'Uyarı',
            'urgent': 'Acil'
        };
        const raw = String(sev).trim().toLowerCase();
        if (map[raw]) return map[raw];
        const collapsed = raw.replace(/[\s_-]+/g, ' ');
        if (map[collapsed]) return map[collapsed];
        return sev; // bilinmeyen olduğu gibi bırak
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<p class="text-danger">${message}</p>`;
        }
    }

    showTableError(tableId, message, colSpan) {
        document.getElementById(tableId).innerHTML =
            `<tr><td colspan="${colSpan}" class="text-center text-danger">${message}</td></tr>`;
    }

    // CRUD operations (placeholders)
    addCitizen() {
        // Implementation for adding citizen
        console.log('Add citizen functionality');
    }

    editCitizen(citizenId) {
        // Implementation for editing citizen
        console.log('Edit citizen:', citizenId);
    }

    deleteCitizen(citizenId) {
        // Implementation for deleting citizen
        console.log('Delete citizen:', citizenId);
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
let adminDashboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
});

// Global functions for onclick handlers
function toggleSidebar() {
    if (adminDashboard) {
        adminDashboard.toggleSidebar();
    }
}

function logout() {
    if (adminDashboard) {
        adminDashboard.logout();
    }
}