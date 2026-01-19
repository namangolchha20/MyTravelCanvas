class TripPlanner {
    constructor() {
        this.trips = JSON.parse(localStorage.getItem('trips')) || [];
        this.currentTripId = null;
        this.packingTemplates = this.getPackingTemplates();
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';

        // Quote rotation variables
        this.travelQuotes = [
            "Not all who wander are lost - J.R.R. Tolkien",
            "Collect moments, not things.",
            "Live with no excuses and travel with no regrets - Oscar Wilde",
            "Travel is the only thing you buy that makes you richer.",
            "Travel far enough, you meet yourself - David Mitchell",
            "Good planning makes great memories.",
            "The world is a book, and those who do not travel read only one page - Saint Augustine",
            "Your journey, perfectly planned."
        ];
        this.quoteIndex = 0;

        // Activity deletion tracking
        this.activityToDeleteId = null;

        this.init();
    }

    init() {
        // DOM Elements
        this.elements = {
            tripsContainer: document.getElementById('trips-container'),
            tripDetailsSection: document.getElementById('trip-details-section'),
            tripsSection: document.getElementById('trips-section'),
            tripDetailsTitle: document.getElementById('trip-details-title'),
            daysContainer: document.getElementById('days-container'),
            addTripBtn: document.getElementById('add-trip-btn'),
            backToTripsBtn: document.getElementById('back-to-trips'),
            addTripModal: document.getElementById('add-trip-modal'),
            addActivityBtn: document.getElementById('add-activity-btn'),
            addActivityModal: document.getElementById('add-activity-modal'),
            addCustomItemBtn: document.getElementById('add-custom-item-btn'),
            addCustomItemModal: document.getElementById('add-custom-item-modal'),
            budgetInput: document.getElementById('budget-input'),
            setBudgetBtn: document.getElementById('set-budget-btn'),
            expenseCategory: document.getElementById('expense-category'),
            expenseAmount: document.getElementById('expense-amount'),
            expenseDay: document.getElementById('expense-day'),
            addExpenseBtn: document.getElementById('add-expense-btn'),
            expensesContainer: document.getElementById('expenses-container'),
            packingLists: document.getElementById('packing-lists'),
            tabs: document.querySelectorAll('.tab-btn'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            closeBtns: document.querySelectorAll('.close-btn, .close-modal'),
            modals: document.querySelectorAll('.modal'),
            forms: document.querySelectorAll('form'),
            deleteTripModal: document.getElementById('delete-trip-modal'),
            confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
            deleteActivityModal: document.getElementById('delete-activity-modal'),
            confirmDeleteActivityBtn: document.getElementById('confirm-delete-activity-btn'),
            themeToggleBtn: document.getElementById('theme-toggle-btn'),
            quoteDisplay: document.getElementById('quote-display')
        };

        // Event Listeners
        this.setupEventListeners();

        // Load trips on startup
        this.renderTrips();

        // Set min date to today
        this.setMinDates();

        // Initialize dark mode
        this.initDarkMode();

        // Start quote rotation
        this.startQuoteRotation();
    }

    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('start-date').min = today;
        document.getElementById('end-date').min = today;
    }

    initDarkMode() {
        const themeIcon = this.elements.themeToggleBtn.querySelector('i');
        const themeText = this.elements.themeToggleBtn.querySelector('span');

        // Apply saved theme
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        }

        // Theme toggle event
        this.elements.themeToggleBtn.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle('dark-mode');

            if (this.isDarkMode) {
                themeIcon.className = 'fas fa-sun';
                themeText.textContent = 'Light Mode';
            } else {
                themeIcon.className = 'fas fa-moon';
                themeText.textContent = 'Dark Mode';
            }

            localStorage.setItem('darkMode', this.isDarkMode);
        });
    }

    startQuoteRotation() {
        // Show first quote immediately
        this.rotateQuote();

        // Rotate quote every 5 seconds
        setInterval(() => this.rotateQuote(), 5000);
    }

    rotateQuote() {
        if (this.elements.quoteDisplay) {
            // Add fade effect
            this.elements.quoteDisplay.style.opacity = '0';

            setTimeout(() => {
                this.elements.quoteDisplay.textContent = this.travelQuotes[this.quoteIndex];
                this.elements.quoteDisplay.style.opacity = '1';

                // Move to next quote
                this.quoteIndex = (this.quoteIndex + 1) % this.travelQuotes.length;
            });
        }
    }

    setupEventListeners() {
        // Add Trip Button
        this.elements.addTripBtn.addEventListener('click', () => this.showModal('add-trip-modal'));

        // Back to Trips Button
        this.elements.backToTripsBtn.addEventListener('click', () => this.showTripsList());

        // Add Activity Button
        this.elements.addActivityBtn.addEventListener('click', () => this.showModal('add-activity-modal'));

        // Add Custom Item Button
        this.elements.addCustomItemBtn.addEventListener('click', () => this.showModal('add-custom-item-modal'));

        // Set Budget Button
        this.elements.setBudgetBtn.addEventListener('click', () => this.setTripBudget());

        // Add Expense Button
        this.elements.addExpenseBtn.addEventListener('click', () => this.addExpense());

        // Tab Switching
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Close Modals
        this.elements.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Close modals on outside click
        this.elements.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAllModals();
            });
        });

        // Form Submissions
        document.getElementById('trip-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTrip();
        });

        document.getElementById('activity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addActivity();
        });

        document.getElementById('custom-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomItem();
        });

        // Enter key for expense amount
        this.elements.expenseAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addExpense();
            }
        });

        // Confirm Delete Trip Button
        this.elements.confirmDeleteBtn.addEventListener('click', () => {
            this.deleteCurrentTrip();
        });

        // Confirm Delete Activity Button
        this.elements.confirmDeleteActivityBtn.addEventListener('click', () => {
            this.deleteActivityConfirmed();
        });

        // Activity completion, reordering, and deletion
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('completed-checkbox')) {
                this.toggleActivityCompletion(e.target);
            }

            if (e.target.closest('.move-up')) {
                this.moveActivity(e.target.closest('.activity-item'), 'up');
            }

            if (e.target.closest('.move-down')) {
                this.moveActivity(e.target.closest('.activity-item'), 'down');
            }

            // Delete activity button - updated to show modal
            if (e.target.closest('.delete-activity-btn')) {
                const deleteBtn = e.target.closest('.delete-activity-btn');
                const activityId = deleteBtn.dataset.id;
                this.showDeleteActivityConfirmation(activityId);
            }

            // Delete trip button (added dynamically)
            if (e.target.id === 'delete-trip-btn' || e.target.closest('#delete-trip-btn')) {
                this.showDeleteConfirmation();
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');

        if (modalId === 'add-activity-modal' && this.currentTripId) {
            this.populateActivityDays();
        }
    }

    closeAllModals() {
        this.elements.modals.forEach(modal => modal.classList.remove('active'));
        document.querySelectorAll('form').forEach(form => form.reset());
        this.activityToDeleteId = null;
    }

    switchTab(tabName) {
        // Update active tab button
        this.elements.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Show active tab pane
        this.elements.tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        // Refresh data for specific tabs
        if (tabName === 'summary' && this.currentTripId) {
            this.updateSummary();
        }
    }

    // Trip Management
    createTrip() {
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const tripType = document.getElementById('trip-type').value;

        // Validate dates
        if (new Date(startDate) > new Date(endDate)) {
            alert('End date must be after start date');
            return;
        }

        const trip = {
            id: Date.now().toString(),
            destination,
            startDate,
            endDate,
            type: tripType,
            days: this.generateDays(startDate, endDate),
            budget: {
                total: 0,
                expenses: []
            },
            packingList: this.generatePackingList(tripType, startDate, endDate)
        };

        this.trips.push(trip);
        this.saveTrips();
        this.renderTrips();
        this.closeAllModals();

        // Show success notification
        this.showNotification('🎉 Trip created successfully!');
    }

    generateDays(startDate, endDate) {
        const days = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);

            days.push({
                dayNumber: i + 1,
                date: currentDate.toISOString().split('T')[0],
                activities: []
            });
        }

        return days;
    }

    getPackingTemplates() {
        return {
            beach: {
                clothes: ['Swimwear', 'Beach cover-up', 'Flip flops', 'Sunglasses', 'Hat', 'Light clothing', 'Sarong'],
                accessories: ['Sunscreen SPF 50+', 'Beach towel', 'Waterproof phone case', 'Beach bag', 'Snorkel gear'],
                toiletries: ['Aloe vera gel', 'Lip balm', 'After-sun lotion', 'Insect repellent'],
                electronics: ['Waterproof camera', 'Portable speaker', 'Power bank', 'E-reader'],
                documents: ['Passport', 'Hotel reservation', 'Travel insurance', 'Boarding passes']
            },
            winter: {
                clothes: ['Thermal underwear', 'Winter coat', 'Wool sweaters', 'Winter boots', 'Gloves', 'Scarf', 'Beanie', 'Thick socks'],
                accessories: ['Hand warmers', 'Lip balm', 'Moisturizer', 'Ski goggles', 'Snow gloves'],
                toiletries: ['Cold cream', 'Lip care', 'Hand cream', 'Face moisturizer'],
                electronics: ['Portable charger', 'Camera', 'Phone with waterproof case'],
                documents: ['Passport/Visa', 'Hotel reservation', 'Travel insurance', 'Ski pass']
            },
            city: {
                clothes: ['Comfortable walking shoes', 'Jeans', 'T-shirts', 'Jacket', 'Dress clothes', 'Light sweater'],
                accessories: ['City map/Guidebook', 'Backpack', 'Water bottle', 'Umbrella'],
                toiletries: ['Basic toiletries', 'Hand sanitizer', 'Wet wipes', 'Personal medication'],
                electronics: ['Phone charger', 'Camera', 'Power bank', 'Universal adapter'],
                documents: ['ID/Passport', 'Hotel reservation', 'City passes', 'Emergency contacts']
            },
            business: {
                clothes: ['Business suit', 'Dress shirts', 'Dress shoes', 'Tie', 'Formal wear', 'Blazer'],
                accessories: ['Briefcase', 'Business cards', 'Notebook', 'Pen', 'Laptop bag'],
                toiletries: ['Grooming kit', 'Deodorant', 'Perfume/Cologne', 'Hair products'],
                electronics: ['Laptop', 'Charger', 'Phone', 'Headphones', 'Presentation remote'],
                documents: ['Business documents', 'ID/Passport', 'Hotel reservation', 'Conference tickets']
            },
            mountain: {
                clothes: ['Hiking boots', 'Quick-dry clothes', 'Rain jacket', 'Hat', 'Hiking socks', 'Fleece jacket'],
                accessories: ['Hiking backpack', 'Water bottle', 'Multi-tool', 'Headlamp', 'Trekking poles'],
                toiletries: ['First aid kit', 'Sunscreen', 'Insect repellent', 'Blister pads'],
                electronics: ['GPS device', 'Camera', 'Power bank', 'Satellite phone'],
                documents: ['ID', 'Maps', 'Permits', 'Emergency contacts', 'Mountain guide contact']
            },
            forest: {
                clothes: ['Hiking pants', 'Long sleeve shirts', 'Waterproof jacket', 'Hiking boots', 'Hat'],
                accessories: ['Backpack', 'Water filter', 'Compass', 'Binoculars', 'Pocket knife'],
                toiletries: ['First aid kit', 'Bug spray', 'Sunscreen', 'Hand sanitizer'],
                electronics: ['Camera', 'Power bank', 'Flashlight', 'Portable charger'],
                documents: ['ID', 'Forest permits', 'Maps', 'Emergency contacts']
            }
        };
    }

    generatePackingList(tripType, startDate, endDate) {
        const template = this.packingTemplates[tripType] || this.packingTemplates.city;
        const list = [];

        // Add template items
        Object.entries(template).forEach(([category, items]) => {
            items.forEach(item => {
                list.push({
                    id: Date.now().toString() + Math.random(),
                    name: item,
                    category: category,
                    packed: false,
                    isCustom: false
                });
            });
        });

        // Add essentials that apply to all trips
        const essentials = ['Phone charger', 'Wallet with cash/cards', 'Keys', 'Medications', 'Passport/ID'];
        essentials.forEach(item => {
            list.push({
                id: Date.now().toString() + Math.random(),
                name: item,
                category: 'essentials',
                packed: false,
                isCustom: false
            });
        });

        return list;
    }

    saveTrips() {
        localStorage.setItem('trips', JSON.stringify(this.trips));
    }

    renderTrips() {
        this.elements.tripsContainer.innerHTML = '';

        this.trips.forEach(trip => {
            const tripElement = this.createTripElement(trip);
            this.elements.tripsContainer.appendChild(tripElement);
        });
    }

    deletePackingItem(itemId) {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        // Find item index
        const itemIndex = trip.packingList.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        // Remove item
        trip.packingList.splice(itemIndex, 1);
        this.saveTrips();
        this.renderPackingList(trip);
        this.updateSummary();
        
        // Show notification
        this.showNotification('🧳 Packing item deleted');
    }

    createTripElement(trip) {
        const element = document.createElement('div');
        element.className = 'trip-card';
        element.dataset.id = trip.id;
        element.dataset.type = trip.type;

        // Calculate stats
        const activitiesCount = trip.days.reduce((sum, day) => sum + day.activities.length, 0);
        const totalSpent = trip.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const packedItems = trip.packingList.filter(item => item.packed).length;
        const packingProgress = trip.packingList.length > 0
            ? Math.round((packedItems / trip.packingList.length) * 100)
            : 0;

        element.innerHTML = `
            <div class="trip-card-header">
                <h3 class="trip-destination">${trip.destination}</h3>
                <span class="trip-type ${trip.type}">${this.getTripTypeLabel(trip.type)}</span>
            </div>
            <div class="trip-dates">
                <i class="fas fa-calendar"></i>
                ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
            </div>
            <div class="trip-stats">
                <div class="stat">
                    <div class="stat-value">${trip.days.length}</div>
                    <div class="stat-label">Days</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${activitiesCount}</div>
                    <div class="stat-label">Activities</div>
                </div>
                <div class="stat">
                    <div class="stat-value">₹${totalSpent}</div>
                    <div class="stat-label">Spent</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${packingProgress}%</div>
                    <div class="stat-label">Packed</div>
                </div>
            </div>
        `;

        element.addEventListener('click', () => this.openTripDetails(trip.id));
        return element;
    }

    getTripTypeLabel(type) {
        const labels = {
            beach: 'Beach',
            winter: 'Winter',
            city: 'City',
            business: 'Business',
            mountain: 'Mountain',
            forest: 'Forest'
        };
        return labels[type] || type;
    }

    openTripDetails(tripId) {
        this.currentTripId = tripId;
        const trip = this.trips.find(t => t.id === tripId);

        if (!trip) return;

        // Update UI
        this.elements.tripsSection.style.display = 'none';
        this.elements.tripDetailsSection.style.display = 'block';
        this.elements.tripDetailsTitle.textContent = `${trip.destination} Trip`;

        // Add delete button if not already there
        if (!document.getElementById('delete-trip-btn')) {
            this.addDeleteButton();
        }

        // Load trip details
        this.renderTripDetails(trip);
    }

    addDeleteButton() {
        const deleteBtn = document.createElement('button');
        deleteBtn.id = 'delete-trip-btn';
        deleteBtn.className = 'delete-trip-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete This Trip';

        // Insert after the back button
        const backBtn = this.elements.backToTripsBtn;
        backBtn.parentNode.insertBefore(deleteBtn, backBtn.nextSibling);
    }

    showTripsList() {
        this.currentTripId = null;
        this.elements.tripsSection.style.display = 'block';
        this.elements.tripDetailsSection.style.display = 'none';

        // Remove delete button
        const deleteBtn = document.getElementById('delete-trip-btn');
        if (deleteBtn) {
            deleteBtn.remove();
        }
    }

    renderTripDetails(trip) {
        this.renderItinerary(trip);
        this.renderBudget(trip);
        this.renderPackingList(trip);
        this.updateSummary();
        this.populateExpenseDays(trip);
    }

    showDeleteConfirmation() {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        const modal = document.getElementById('delete-trip-modal');
        const tripInfo = document.getElementById('trip-to-delete-info');

        tripInfo.innerHTML = `
            <div>
                <h4>${trip.destination}</h4>
                <p><i class="fas fa-calendar"></i> ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}</p>
                <p><span class="trip-type ${trip.type}">${this.getTripTypeLabel(trip.type)}</span></p>
                <p>${trip.days.length} days • ${trip.days.reduce((sum, day) => sum + day.activities.length, 0)} activities</p>
            </div>
        `;

        modal.classList.add('active');
    }

    showDeleteActivityConfirmation(activityId) {
        this.activityToDeleteId = activityId;
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        // Find the activity
        let activity = null;
        for (const day of trip.days) {
            const foundActivity = day.activities.find(a => a.id === activityId);
            if (foundActivity) {
                activity = foundActivity;
                break;
            }
        }

        if (!activity) return;

        const modal = document.getElementById('delete-activity-modal');
        const activityInfo = document.getElementById('activity-to-delete-info');

        // Format time to AM/PM format
        const time = activity.time;
        const [hours, minutes] = time.split(':');
        let formattedTime = time;
        if (hours && minutes) {
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            formattedTime = `${hour12}:${minutes} ${ampm}`;
        }

        activityInfo.innerHTML = `
            <div>
                <h4>${activity.title}</h4>
                <p><i class="fas fa-clock"></i> ${formattedTime} • Day ${activity.dayNumber}</p>
                ${activity.notes ? `<p><i class="fas fa-sticky-note"></i> ${activity.notes}</p>` : ''}
                <p><i class="fas fa-${activity.completed ? 'check-circle success' : 'clock'}"></i> 
                   ${activity.completed ? 'Completed' : 'Not completed'}</p>
            </div>
        `;

        modal.classList.add('active');
    }

    deleteActivityConfirmed() {
        if (!this.activityToDeleteId) return;

        const activityId = this.activityToDeleteId;
        const trip = this.trips.find(t => t.id === this.currentTripId);

        if (!trip) {
            this.closeAllModals();
            return;
        }

        // Find and remove the activity
        let activityRemoved = false;
        let activityTitle = '';

        for (const day of trip.days) {
            const activityIndex = day.activities.findIndex(a => a.id === activityId);
            if (activityIndex !== -1) {
                activityTitle = day.activities[activityIndex].title;
                day.activities.splice(activityIndex, 1);
                activityRemoved = true;
                break;
            }
        }

        if (activityRemoved) {
            this.saveTrips();
            this.renderItinerary(trip);
            this.updateSummary();
            this.closeAllModals();
            this.showNotification(`🗑️ Activity "${activityTitle}" deleted successfully`);
        }

        this.activityToDeleteId = null;
    }

    deleteCurrentTrip() {
        const tripIndex = this.trips.findIndex(t => t.id === this.currentTripId);
        if (tripIndex === -1) return;

        // Remove trip from array
        const deletedTrip = this.trips.splice(tripIndex, 1)[0];
        this.saveTrips();

        // Close modal and show trips list
        this.closeAllModals();
        this.showTripsList();
        this.renderTrips();

        // Show confirmation message
        this.showNotification(`🗑️ Trip to ${deletedTrip.destination} deleted successfully`);
    }

    // Itinerary Management
    renderItinerary(trip) {
        this.elements.daysContainer.innerHTML = '';

        if (trip.days.length === 0) {
            this.elements.daysContainer.innerHTML = `
                <div class="empty-text">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No days planned yet. Add some activities!</p>
                </div>
            `;
            return;
        }

        trip.days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day-card';
            dayElement.innerHTML = `
                <div class="day-header">
                    <h3 class="day-title">Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                    <span class="day-date">${new Date(day.date).toLocaleDateString()}</span>
                </div>
                <div class="activities-list" data-day="${day.dayNumber}">
                    ${day.activities.length > 0
                    ? day.activities.map(activity => this.createActivityElement(activity)).join('')
                    : '<p class="empty-text">No activities planned for this day</p>'
                }
                </div>
            `;
            this.elements.daysContainer.appendChild(dayElement);
        });
    }

    createActivityElement(activity) {
        const iconClass = this.getActivityIcon(activity.title, activity.time);

        return `
            <div class="activity-item" data-id="${activity.id}">
                <span class="activity-time">${activity.time}</span>
                <div class="activity-details">
                    <div class="activity-title">
                        <i class="fas ${iconClass}"></i> ${activity.title}
                    </div>
                    ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
                </div>
                <div class="activity-actions">
                    <input type="checkbox" class="completed-checkbox" ${activity.completed ? 'checked' : ''} 
                           title="Mark as completed">
                    <button class="reorder-btn move-up" title="Move up"><i class="fas fa-arrow-up"></i></button>
                    <button class="reorder-btn move-down" title="Move down"><i class="fas fa-arrow-down"></i></button>
                    <button class="delete-activity-btn" title="Delete activity" data-id="${activity.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getActivityIcon(title, time = "") {
        const titleLower = title.toLowerCase();

        // Food & Dining
        if (/(restaurant|cafe|dinner|lunch|breakfast|brunch|food|eat|dine|meal)/.test(titleLower)) {
            return 'fa-utensils';
        }
        // Sightseeing
        else if (/(museum|gallery|landmark|monument|castle|palace|temple|church|tour|visit)/.test(titleLower)) {
            return 'fa-landmark';
        }
        // Shopping
        else if (/(shop|mall|market|store|boutique|buy|purchase)/.test(titleLower)) {
            return 'fa-shopping-bag';
        }
        // Transportation
        else if (/(airport|flight|train|station|bus|taxi|car|drive|transport)/.test(titleLower)) {
            return 'fa-car';
        }
        // Accommodation
        else if (/(hotel|check-in|check-out|hostel|lodging|accommodation)/.test(titleLower)) {
            return 'fa-bed';
        }
        // Outdoor
        else if (/(park|hike|walk|beach|mountain|trail|garden|trek)/.test(titleLower)) {
            return 'fa-tree';
        }
        // Entertainment
        else if (/(movie|cinema|theater|show|concert|opera|performance)/.test(titleLower)) {
            return 'fa-ticket-alt';
        }
        // Relaxation
        else if (/(spa|massage|pool|sauna|relax|yoga|meditation)/.test(titleLower)) {
            return 'fa-spa';
        }
        // Default based on time
        else {
            const hour = time ? parseInt(time.split(':')[0]) : 12;
            if (hour < 12) return 'fa-sun';
            if (hour < 18) return 'fa-sun';
            return 'fa-moon';
        }
    }

    toggleActivityCompletion(checkbox) {
        const activityItem = checkbox.closest('.activity-item');
        const activityId = activityItem.dataset.id;
        const trip = this.trips.find(t => t.id === this.currentTripId);

        if (!trip) return;

        // Find the activity in all days
        for (const day of trip.days) {
            const activity = day.activities.find(a => a.id === activityId);
            if (activity) {
                activity.completed = checkbox.checked;
                this.saveTrips();

                // Visual feedback
                if (activity.completed) {
                    activityItem.style.opacity = '0.7';
                    activityItem.querySelector('.activity-title').style.textDecoration = 'line-through';
                    activityItem.style.borderLeftColor = '#4CAF50';
                } else {
                    activityItem.style.opacity = '1';
                    activityItem.querySelector('.activity-title').style.textDecoration = 'none';
                    activityItem.style.borderLeftColor = 'transparent';
                }
                break;
            }
        }
    }

    moveActivity(activityItem, direction) {
        const activityId = activityItem.dataset.id;
        const trip = this.trips.find(t => t.id === this.currentTripId);

        if (!trip) return;

        // Find the day and activity
        for (const day of trip.days) {
            const activityIndex = day.activities.findIndex(a => a.id === activityId);
            if (activityIndex !== -1) {
                if (direction === 'up' && activityIndex > 0) {
                    // Swap with previous activity
                    [day.activities[activityIndex - 1], day.activities[activityIndex]] =
                        [day.activities[activityIndex], day.activities[activityIndex - 1]];
                } else if (direction === 'down' && activityIndex < day.activities.length - 1) {
                    // Swap with next activity
                    [day.activities[activityIndex], day.activities[activityIndex + 1]] =
                        [day.activities[activityIndex + 1], day.activities[activityIndex]];
                } else {
                    return; // Can't move further
                }

                this.saveTrips();
                this.renderItinerary(trip);
                break;
            }
        }
    }

    populateActivityDays() {
        const select = document.getElementById('activity-day');
        select.innerHTML = '';

        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        trip.days.forEach(day => {
            const option = document.createElement('option');
            option.value = day.dayNumber;
            option.textContent = `Day ${day.dayNumber} - ${new Date(day.date).toLocaleDateString()}`;
            select.appendChild(option);
        });
    }

    addActivity() {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        const dayNumber = parseInt(document.getElementById('activity-day').value);
        const title = document.getElementById('activity-title').value;
        const time = document.getElementById('activity-time').value;
        const notes = document.getElementById('activity-notes').value;

        if (!title.trim()) {
            alert('Please enter an activity title');
            return;
        }

        const activity = {
            id: Date.now().toString(),
            dayNumber: dayNumber,
            title: title,
            time: time,
            notes: notes,
            completed: false
        };

        const day = trip.days.find(d => d.dayNumber === dayNumber);
        if (day) {
            day.activities.push(activity);
            day.activities.sort((a, b) => a.time.localeCompare(b.time));
            this.saveTrips();
            this.renderItinerary(trip);
            this.closeAllModals();

            // Show success notification
            this.showNotification('🎯 Activity added successfully!');
        }
    }

    // Budget Management
    renderBudget(trip) {
        const totalSpent = trip.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = Math.max(0, trip.budget.total - totalSpent);
        const percentage = trip.budget.total > 0 ? Math.round((totalSpent / trip.budget.total) * 100) : 0;

        // Update overview
        document.getElementById('total-budget').textContent = `₹${trip.budget.total.toLocaleString()}`;
        document.getElementById('total-spent').textContent = `₹${totalSpent.toLocaleString()}`;
        document.getElementById('remaining-budget').textContent = `₹${remaining.toLocaleString()}`;
        document.getElementById('budget-percentage').textContent = `${percentage}%`;

        // Add warning class if over budget
        const remainingElement = document.getElementById('remaining-budget');
        const percentageElement = document.getElementById('budget-percentage');

        if (remaining < 0) {
            remainingElement.style.color = 'var(--danger)';
            percentageElement.style.color = 'var(--danger)';
        } else if (percentage > 80) {
            remainingElement.style.color = 'var(--warning)';
            percentageElement.style.color = 'var(--warning)';
        } else {
            remainingElement.style.color = 'var(--success)';
            percentageElement.style.color = 'var(--warning)';
        }

        // Update budget input
        this.elements.budgetInput.value = trip.budget.total || '';

        // Render expenses
        this.renderExpenses(trip);
    }

    setTripBudget() {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        const budget = parseFloat(this.elements.budgetInput.value);
        if (isNaN(budget) || budget < 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        trip.budget.total = budget;
        this.saveTrips();
        this.renderBudget(trip);
        this.updateSummary();

        // Show success notification
        this.showNotification('💰 Budget updated successfully!');
    }

    populateExpenseDays(trip) {
        const select = this.elements.expenseDay;
        select.innerHTML = '<option value="0">All Days</option>';

        trip.days.forEach(day => {
            const option = document.createElement('option');
            option.value = day.dayNumber;
            option.textContent = `Day ${day.dayNumber}`;
            select.appendChild(option);
        });
    }

    addExpense() {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        const category = this.elements.expenseCategory.value;
        const amount = parseFloat(this.elements.expenseAmount.value);
        const day = parseInt(this.elements.expenseDay.value);
        const description = document.getElementById('expense-description').value;

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const expense = {
            id: Date.now().toString(),
            category: category,
            amount: amount,
            day: day,
            description: description || '',
            date: new Date().toISOString().split('T')[0]
        };

        trip.budget.expenses.push(expense);
        this.saveTrips();
        this.renderBudget(trip);
        this.updateSummary();

        // Clear form and show success
        this.elements.expenseAmount.value = '';
        document.getElementById('expense-description').value = '';
        this.showNotification('💸 Expense added successfully!');

        // Check if over budget
        const totalSpent = trip.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        if (trip.budget.total > 0 && totalSpent > trip.budget.total) {
            this.showNotification('⚠️ You have exceeded your budget!');
        }
    }

    renderExpenses(trip) {
        const container = this.elements.expensesContainer;

        if (trip.budget.expenses.length === 0) {
            container.innerHTML = '<p class="empty-text">No expenses added yet</p>';
            return;
        }

        // Sort by date (newest first)
        const expenses = [...trip.budget.expenses].reverse();

        container.innerHTML = expenses.map(expense => {
            const dayText = expense.day > 0 ? `Day ${expense.day}` : 'General';
            const description = expense.description ? `<div class="expense-description">${expense.description}</div>` : '';
            return `
                <div class="expense-item" data-id="${expense.id}">
                    <div class="expense-info">
                        <div class="expense-details">
                            <span class="expense-category ${expense.category}">${this.getCategoryLabel(expense.category)}</span>
                            <span class="expense-day">${dayText}</span>
                        </div>
                        ${description}
                    </div>
                    <div class="expense-actions">
                        <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                        <button class="expense-delete-btn" onclick="tripPlanner.deleteExpense('${expense.id}')" title="Delete expense">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    deleteExpense(expenseId) {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        // Find expense index
        const expenseIndex = trip.budget.expenses.findIndex(expense => expense.id === expenseId);
        if (expenseIndex === -1) return;

        // Remove expense
        trip.budget.expenses.splice(expenseIndex, 1);
        this.saveTrips();
        this.renderBudget(trip);
        this.updateSummary();
        
        // Show notification
        this.showNotification('💰 Expense deleted');
    }

    getCategoryLabel(category) {
        const labels = {
            food: 'Food & Dining',
            stay: 'Accommodation',
            transport: 'Transport',
            shopping: 'Shopping',
            activities: 'Activities',
            other: 'Other'
        };
        return labels[category] || category;
    }

    // Packing List Management
    renderPackingList(trip) {
        const container = this.elements.packingLists;
        const packedItems = trip.packingList.filter(item => item.packed).length;
        const totalItems = trip.packingList.length;
        const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

        // Update progress
        document.getElementById('packing-progress-fill').style.width = `${progress}%`;
        document.getElementById('packing-progress-text').textContent = `${progress}% Complete`;

        // Group items by category
        const categories = {};
        trip.packingList.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        // Render categories
        container.innerHTML = Object.entries(categories).map(([category, items]) => {
            const categoryLabel = this.getCategoryLabel(category);
            const packedInCategory = items.filter(item => item.packed).length;
            const categoryProgress = items.length > 0 ? Math.round((packedInCategory / items.length) * 100) : 0;

            return `
            <div class="packing-category">
                <div class="category-header">
                    <h4 class="category-title">
                        <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                        ${categoryLabel} (${packedInCategory}/${items.length})
                    </h4>
                    <span class="category-progress">${categoryProgress}%</span>
                </div>
                <div class="packing-items">
                    ${items.map(item => `
                        <div class="packing-item ${item.packed ? 'checked' : ''}" data-id="${item.id}">
                            <input type="checkbox" 
                               id="item-${item.id}" 
                               ${item.packed ? 'checked' : ''}
                               onchange="tripPlanner.togglePackedItem('${item.id}')">
                            <label for="item-${item.id}">
                                ${item.name}
                                ${item.isCustom ? ' <i class="fas fa-user-plus" style="font-size: 0.8em; color: var(--gray);" title="Custom item"></i>' : ''}
                            </label>
                            <button class="packing-item-delete-btn" onclick="tripPlanner.deletePackingItem('${item.id}')" title="Delete item">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('');
    }

    getCategoryIcon(category) {
        const icons = {
            clothes: 'tshirt',
            accessories: 'glasses',
            toiletries: 'pump-soap',
            electronics: 'mobile-alt',
            documents: 'passport',
            essentials: 'star',
            other: 'cube'
        };
        return icons[category] || 'cube';
    }

    togglePackedItem(itemId) {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        const item = trip.packingList.find(i => i.id === itemId);
        if (item) {
            item.packed = !item.packed;
            this.saveTrips();
            this.renderPackingList(trip);
            this.updateSummary();
        }
    }

    addCustomItem() {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        const name = document.getElementById('custom-item-name').value;
        const category = document.getElementById('custom-item-category').value;

        if (!name.trim()) {
            alert('Please enter an item name');
            return;
        }

        const item = {
            id: Date.now().toString(),
            name: name,
            category: category,
            packed: false,
            isCustom: true
        };

        trip.packingList.push(item);
        this.saveTrips();
        this.renderPackingList(trip);
        this.updateSummary();
        this.closeAllModals();

        // Show success notification
        this.showNotification('🎒 Custom item added successfully!');
    }

    // Summary Management
    updateSummary() {
        const trip = this.trips.find(t => t.id === this.currentTripId);
        if (!trip) return;

        // Calculate stats
        const daysCount = trip.days.length;
        const activitiesCount = trip.days.reduce((sum, day) => sum + day.activities.length, 0);
        const totalSpent = trip.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const budgetPercentage = trip.budget.total > 0
            ? Math.round((totalSpent / trip.budget.total) * 100)
            : 0;

        const packedItems = trip.packingList.filter(item => item.packed).length;
        const packingPercentage = trip.packingList.length > 0
            ? Math.round((packedItems / trip.packingList.length) * 100)
            : 0;

        // Update summary cards
        document.getElementById('summary-days').textContent = `${daysCount} days`;
        document.getElementById('summary-activities').textContent = activitiesCount;
        document.getElementById('summary-budget').textContent = `${budgetPercentage}%`;
        document.getElementById('summary-packing').textContent = `${packingPercentage}%`;

        // Update trip info
        const infoList = document.getElementById('trip-info-list');
        infoList.innerHTML = `
            <li><span>Destination:</span><span>${trip.destination}</span></li>
            <li><span>Trip Type:</span><span>${this.getTripTypeLabel(trip.type)}</span></li>
            <li><span>Duration:</span><span>${daysCount} days</span></li>
            <li><span>Activities Planned:</span><span>${activitiesCount}</span></li>
            <li><span>Total Budget:</span><span>₹${trip.budget.total.toLocaleString()}</span></li>
            <li><span>Total Spent:</span><span>₹${totalSpent.toLocaleString()}</span></li>
            <li><span>Remaining:</span><span>₹${Math.max(0, trip.budget.total - totalSpent).toLocaleString()}</span></li>
            <li><span>Packing Progress:</span><span>${packedItems}/${trip.packingList.length} items</span></li>
        `;

        // Update budget bars
        this.updateBudgetBars(trip);
    }

    updateBudgetBars(trip) {
        const container = document.getElementById('budget-bars');
        const categories = {};

        // Group expenses by category
        trip.budget.expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += expense.amount;
        });

        const totalSpent = trip.budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);

        if (totalSpent === 0) {
            container.innerHTML = '<p class="empty-text">No expenses yet to show breakdown</p>';
            return;
        }

        container.innerHTML = Object.entries(categories).map(([category, amount]) => {
            const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

            return `
                <div class="budget-bar">
                    <div class="bar-label">
                        <span>${this.getCategoryLabel(category)}</span>
                        <span>₹${amount.toFixed(2)} (${percentage}%)</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%; background: ${this.getCategoryColor(category)}"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getCategoryColor(category) {
        const colors = {
            food: '#f72585',
            stay: '#4361ee',
            transport: '#4cc9f0',
            shopping: '#7209b7',
            activities: '#f8961e',
            other: '#2a9d8f'
        };
        return colors[category] || '#6c757d';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            background: '#4CAF50',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
const tripPlanner = new TripPlanner();

window.tripPlanner = tripPlanner;
