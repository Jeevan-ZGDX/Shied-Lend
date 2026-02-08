// Centralized demo data store for cross-page persistence

export interface DemoDeposit {
    depositId: string;
    user: string;
    asset: string;
    amount: number;
    timestamp: number;
    txHash: string;
    status: 'active' | 'borrowed_against' | 'withdrawn';
}

export interface DemoLoan {
    loanId: string;
    depositId: string;
    user: string;
    collateralAsset: string;
    collateralAmount: number;
    loanAsset: string;
    loanAmount: number;
    healthFactor: number;
    timestamp: number;
    txHash: string;
    status: 'active' | 'repaid' | 'liquidated';
}

class DemoDataStore {

    // Deposits
    saveDeposit(deposit: DemoDeposit) {
        const deposits = this.getAllDeposits();
        deposits.push(deposit);
        localStorage.setItem('demo_deposits', JSON.stringify(deposits));
        this.notifyUpdate('deposits');
        console.log('💾 Saved deposit:', deposit);
    }

    getAllDeposits(): DemoDeposit[] {
        const data = localStorage.getItem('demo_deposits');
        return data ? JSON.parse(data) : [];
    }

    getUserDeposits(userAddress: string): DemoDeposit[] {
        return this.getAllDeposits().filter(d => d.user === userAddress);
    }

    getDepositById(depositId: string): DemoDeposit | null {
        return this.getAllDeposits().find(d => d.depositId === depositId) || null;
    }

    updateDepositStatus(depositId: string, status: DemoDeposit['status']) {
        const deposits = this.getAllDeposits();
        const index = deposits.findIndex(d => d.depositId === depositId);
        if (index >= 0) {
            deposits[index].status = status;
            localStorage.setItem('demo_deposits', JSON.stringify(deposits));
            this.notifyUpdate('deposits');
            console.log('💾 Updated deposit status:', depositId, status);
        }
    }

    // Loans
    saveLoan(loan: DemoLoan) {
        const loans = this.getAllLoans();
        loans.push(loan);
        localStorage.setItem('demo_loans', JSON.stringify(loans));
        this.notifyUpdate('loans');
        console.log('💾 Saved loan:', loan);
    }

    getAllLoans(): DemoLoan[] {
        const data = localStorage.getItem('demo_loans');
        return data ? JSON.parse(data) : [];
    }

    getUserLoans(userAddress: string): DemoLoan[] {
        return this.getAllLoans().filter(l => l.user === userAddress);
    }

    getLoanById(loanId: string): DemoLoan | null {
        return this.getAllLoans().find(l => l.loanId === loanId) || null;
    }

    updateLoanStatus(loanId: string, status: DemoLoan['status']) {
        const loans = this.getAllLoans();
        const index = loans.findIndex(l => l.loanId === loanId);
        if (index >= 0) {
            loans[index].status = status;
            localStorage.setItem('demo_loans', JSON.stringify(loans));
            this.notifyUpdate('loans');
            console.log('💾 Updated loan status:', loanId, status);
        }
    }

    updateLoanHealth(loanId: string, healthFactor: number) {
        const loans = this.getAllLoans();
        const index = loans.findIndex(l => l.loanId === loanId);
        if (index >= 0) {
            loans[index].healthFactor = healthFactor;
            localStorage.setItem('demo_loans', JSON.stringify(loans));
            this.notifyUpdate('loans');
        }
    }

    // Protocol Stats
    getProtocolStats() {
        const deposits = this.getAllDeposits();
        const loans = this.getAllLoans();

        const totalValueLocked = deposits
            .filter(d => d.status === 'active' || d.status === 'borrowed_against')
            .reduce((sum, d) => sum + (d.amount * 98.50), 0); // Assuming BENJI @ $98.50

        const activeLoans = loans.filter(l => l.status === 'active').length;

        const totalBorrowed = loans
            .filter(l => l.status === 'active')
            .reduce((sum, l) => sum + l.loanAmount, 0);

        return {
            totalValueLocked,
            activeLoans,
            totalBorrowed,
            privacyScore: 97
        };
    }

    // Notifications (for real-time updates)
    private listeners: { [key: string]: Function[] } = {};

    subscribe(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    unsubscribe(event: string, callback: Function) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    private notifyUpdate(event: string) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb());
        }
    }

    // Clear all data (for testing)
    clearAll() {
        localStorage.removeItem('demo_deposits');
        localStorage.removeItem('demo_loans');
        this.notifyUpdate('deposits');
        this.notifyUpdate('loans');
        console.log('🗑️ Cleared all demo data');
    }
}

export const demoStore = new DemoDataStore();
