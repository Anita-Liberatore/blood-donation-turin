export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-';

export type DonorLevel = 'Base' | 'Periodico' | 'Benemerito' | "D'Oro";

export type DonationType = 'Sangue Intero' | 'Plasma' | 'Piastrine';

export type DocumentStatus = 'disponibile' | 'in_elaborazione' | 'archiviato';

export type BookingStatus = 'confermata' | 'in_attesa' | 'completata' | 'annullata';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: BloodType;
  donorLevel: DonorLevel;
  totalDonations: number;
  nextEligibleDate: string;
  codiceFiscale: string;
  email: string;
  city: string;
  phone: string;
  dateOfBirth: string;
  weight: number;
  registrationDate: string;
  avatarInitials: string;
}

export interface DonationCenter {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  phone: string;
  openingHours: string;
  availableTypes: DonationType[];
  rating: number;
  distance?: string;
  color: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  centerId: string;
  centerName: string;
  centerAddress: string;
  date: string;
  time: string;
  donationType: DonationType;
  status: BookingStatus;
  notes?: string;
}

export interface Donation {
  id: string;
  date: string;
  centerId: string;
  centerName: string;
  donationType: DonationType;
  volume: string;
  documentId?: string;
}

export interface MedicalDocument {
  id: string;
  donationId: string;
  title: string;
  date: string;
  type: 'Esami Emocromo' | 'Analisi Completa' | 'Certificato Idoneità' | 'Referto Sacca';
  status: DocumentStatus;
  results: ExamResult[];
  centerName: string;
  doctorName: string;
}

export interface ExamResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normale' | 'alto' | 'basso';
}

export type RootTabParamList = {
  Home: undefined;
  Prenota: undefined;
  Documenti: undefined;
  Profilo: undefined;
};

export type BookingStackParamList = {
  SelectCenter: undefined;
  SelectDate: { centerId: string; donationType: DonationType };
  Confirmation: { centerId: string; date: string; time: string; donationType: DonationType };
  BookingSuccess: { booking: Booking };
};

export type DocumentsStackParamList = {
  DocumentsList: undefined;
  DocumentDetail: { documentId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  DonationHistory: undefined;
  EditProfile: undefined;
};
