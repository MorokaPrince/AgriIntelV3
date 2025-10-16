import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  translate: (key: string, fallback: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'landing.tabs.home': 'Home',
    'landing.tabs.features': 'Features',
    'landing.tabs.solutions': 'Solutions',
    'landing.tabs.pricing': 'Pricing',
    'landing.tabs.about': 'About',
    'landing.tabs.contact': 'Contact',

    // About
    'about.title': 'About AgriIntel',
    'about.subtitle': 'We\'re on a mission to empower African farmers with technology that transforms livestock management.',

    // Pricing
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Choose the plan that fits your farm size and needs. All plans include our core features with no hidden fees.',
    'pricing.guarantee.title': '30-Day Money-Back Guarantee',
    'pricing.guarantee.description': 'Try AgriIntel risk-free for 30 days. If you\'re not completely satisfied, we\'ll refund your money, no questions asked.',

    // Common
    'nav.dashboard': 'Dashboard',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.signout': 'Sign Out',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.contact': 'Contact',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Welcome to your AgriIntel dashboard',
    'dashboard.totalAnimals': 'Total Animals',
    'dashboard.healthAlerts': 'Health Alerts',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.weatherAlerts': 'Weather Alerts',
    'dashboard.activeFarms': 'Active Farms',
    'dashboard.totalUsers': 'Total Users',

    // Animals
    'animals.title': 'Animal Management',
    'animals.subtitle': 'Track and manage your livestock',
    'animals.add': 'Add Animal',
    'animals.edit': 'Edit Animal',
    'animals.delete': 'Delete Animal',
    'animals.search': 'Search animals...',
    'animals.filter': 'Filter animals',
    'animals.export': 'Export Data',

    // Health
    'health.title': 'Health Records',
    'health.subtitle': 'Monitor animal health and veterinary care',
    'health.add': 'Add Health Record',
    'health.edit': 'Edit Record',
    'health.delete': 'Delete Record',
    'health.search': 'Search records...',

    // Financial
    'financial.title': 'Financial Management',
    'financial.subtitle': 'Track income, expenses, and profitability',
    'financial.add': 'Add Transaction',
    'financial.edit': 'Edit Transaction',
    'financial.delete': 'Delete Transaction',

    // Weather
    'weather.title': 'Weather Information',
    'weather.subtitle': 'Current conditions and forecasts',
    'weather.current': 'Current Weather',
    'weather.forecast': '7-Day Forecast',
    'weather.alerts': 'Weather Alerts',

    // Common Actions
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.delete': 'Delete',
    'actions.edit': 'Edit',
    'actions.view': 'View',
    'actions.add': 'Add',
    'actions.search': 'Search',
    'actions.filter': 'Filter',
    'actions.export': 'Export',
    'actions.import': 'Import',
    'actions.refresh': 'Refresh',
    'actions.loading': 'Loading...',

    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'status.draft': 'Draft',

    // Messages
    'message.success': 'Operation completed successfully',
    'message.error': 'An error occurred',
    'message.loading': 'Loading...',
    'message.noData': 'No data available',
    'message.confirmDelete': 'Are you sure you want to delete this item?',

    // Form Labels
    'form.name': 'Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.address': 'Address',
    'form.description': 'Description',
    'form.date': 'Date',
    'form.type': 'Type',
    'form.category': 'Category',
    'form.amount': 'Amount',
    'form.currency': 'Currency',
    'form.notes': 'Notes',
    'form.required': 'Required',
    'form.optional': 'Optional',

    // Animal Fields
    'animal.rfidTag': 'RFID Tag',
    'animal.name': 'Animal Name',
    'animal.species': 'Species',
    'animal.breed': 'Breed',
    'animal.age': 'Age',
    'animal.weight': 'Weight',
    'animal.color': 'Color',
    'animal.gender': 'Gender',
    'animal.status': 'Status',
    'animal.location': 'Location',
    'animal.birthDate': 'Birth Date',
    'animal.purchaseDate': 'Purchase Date',
    'animal.purchasePrice': 'Purchase Price',

    // Health Fields
    'health.diagnosis': 'Diagnosis',
    'health.treatment': 'Treatment',
    'health.medication': 'Medication',
    'health.veterinarian': 'Veterinarian',
    'health.date': 'Date',
    'health.severity': 'Severity',
    'health.notes': 'Notes',

    // Financial Fields
    'financial.transactionType': 'Transaction Type',
    'financial.income': 'Income',
    'financial.expense': 'Expense',
    'financial.transfer': 'Transfer',
    'financial.amount': 'Amount',
    'financial.description': 'Description',
    'financial.reference': 'Reference',
    'financial.date': 'Date',
    'financial.category': 'Category',
    'financial.paymentMethod': 'Payment Method',
  },
  af: {
    // Afrikaans translations
    'landing.tabs.home': 'Tuis',
    'landing.tabs.features': 'Funksies',
    'landing.tabs.solutions': 'Oplossings',
    'landing.tabs.pricing': 'Pryse',
    'landing.tabs.about': 'Oor Ons',
    'landing.tabs.contact': 'Kontak',

    'about.title': 'Oor AgriIntel',
    'about.subtitle': 'Ons is op \'n missie om Afrika-boere te bemagtig met tegnologie wat vee-bestuur transformeer.',

    'pricing.title': 'Eenvoudige, Deursigtige Pryse',
    'pricing.subtitle': 'Kies die plan wat by jou plaasgrootte en behoeftes pas. Alle planne sluit ons kernfunksies in sonder verborge kostes.',

    'dashboard.title': 'Beheerpaneel',
    'dashboard.subtitle': 'Welkom by jou AgriIntel beheerpaneel',
    'dashboard.totalAnimals': 'Totale Diere',
    'dashboard.healthAlerts': 'Gesondheidswaarskuwings',
    'dashboard.totalRevenue': 'Totale Inkomste',
    'dashboard.weatherAlerts': 'Weerwaarskuwings',
    'dashboard.activeFarms': 'Aktiewe Plase',
    'dashboard.totalUsers': 'Totale Gebruikers',

    'animals.title': 'Dierbestuur',
    'animals.subtitle': 'Volg en bestuur jou vee',
    'animals.add': 'Voeg Dier By',
    'animals.edit': 'Wysig Dier',
    'animals.delete': 'Verwyder Dier',
    'animals.search': 'Soek diere...',
    'animals.filter': 'Filtreer diere',
    'animals.export': 'Voer Data Uit',

    'health.title': 'Gesondheidsrekords',
    'health.subtitle': 'Monitor dierergesondheid en veeartsenykundige sorg',
    'health.add': 'Voeg Gesondheidsrekord By',
    'health.edit': 'Wysig Rekord',
    'health.delete': 'Verwyder Rekord',
    'health.search': 'Soek rekords...',

    'financial.title': 'Finansiële Bestuur',
    'financial.subtitle': 'Volg inkomste, uitgawes en winsgewendheid',
    'financial.add': 'Voeg Transaksie By',
    'financial.edit': 'Wysig Transaksie',
    'financial.delete': 'Verwyder Transaksie',

    'actions.save': 'Stoor',
    'actions.cancel': 'Kanselleer',
    'actions.delete': 'Verwyder',
    'actions.edit': 'Wysig',
    'actions.view': 'Bekyk',
    'actions.add': 'Voeg By',
    'actions.search': 'Soek',
    'actions.filter': 'Filtreer',
    'actions.export': 'Voer Uit',
    'actions.import': 'Voer In',
    'actions.refresh': 'Verfris',
    'actions.loading': 'Laai...',

    'status.active': 'Aktief',
    'status.inactive': 'Onaktief',
    'status.pending': 'Hangende',
    'status.completed': 'Voltooid',
    'status.cancelled': 'Gekanselleer',
    'status.draft': 'Konsep',

    'message.success': 'Operasie suksesvol voltooid',
    'message.error': 'n Fout het voorgekom',
    'message.loading': 'Laai...',
    'message.noData': 'Geen data beskikbaar nie',
    'message.confirmDelete': 'Is jy seker jy wil hierdie item verwyder?',

    'form.name': 'Naam',
    'form.email': 'E-pos',
    'form.phone': 'Telefoon',
    'form.address': 'Adres',
    'form.description': 'Beskrywing',
    'form.date': 'Datum',
    'form.type': 'Tipe',
    'form.category': 'Kategorie',
    'form.amount': 'Bedrag',
    'form.currency': 'Geldeenheid',
    'form.notes': 'Notas',
    'form.required': 'Vereis',
    'form.optional': 'Opsioneel',

    'animal.rfidTag': 'RFID Etiket',
    'animal.name': 'Dier Naam',
    'animal.species': 'Spesie',
    'animal.breed': 'Ras',
    'animal.age': 'Ouderdom',
    'animal.weight': 'Gewig',
    'animal.color': 'Kleur',
    'animal.gender': 'Geslag',
    'animal.status': 'Status',
    'animal.location': 'Ligging',
    'animal.birthDate': 'Geboortedatum',
    'animal.purchaseDate': 'Aankoopdatum',
    'animal.purchasePrice': 'Aankoopprys',

    'health.diagnosis': 'Diagnose',
    'health.treatment': 'Behandeling',
    'health.medication': 'Medikasie',
    'health.veterinarian': 'Veearts',
    'health.date': 'Datum',
    'health.severity': 'Ernstigheid',
    'health.notes': 'Notas',

    'financial.transactionType': 'Transaksie Tipe',
    'financial.income': 'Inkomste',
    'financial.expense': 'Uitgawe',
    'financial.transfer': 'Oordrag',
    'financial.amount': 'Bedrag',
    'financial.description': 'Beskrywing',
    'financial.reference': 'Verwysing',
    'financial.date': 'Datum',
    'financial.category': 'Kategorie',
    'financial.paymentMethod': 'Betalingsmetode',
  },
  // Add more languages as needed
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      setLanguage: (language: string) => set({ currentLanguage: language }),
      translate: (key: string, fallback: string) => {
        const { currentLanguage } = get();
        return translations[currentLanguage]?.[key] || fallback;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);