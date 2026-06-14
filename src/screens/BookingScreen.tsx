import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CenterCard } from '../components/booking/CenterCard';
import { TimeSlotPicker } from '../components/booking/TimeSlotPicker';
import { Button } from '../components/common/Button';
import { SectionHeader } from '../components/common/SectionHeader';
import { mockCenters } from '../data/mockCenters';
import { DonationCenter, DonationType, RootTabParamList, TimeSlot } from '../types';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';

type Step = 'center' | 'type' | 'date' | 'time' | 'confirm';
type BookingNavigation = BottomTabNavigationProp<RootTabParamList>;

const DONATION_TYPES: { type: DonationType; icon: keyof typeof Ionicons.glyphMap; desc: string; color: string }[] = [
  { type: 'Sangue Intero', icon: 'water', desc: 'Donazione completa • 450 ml • ogni 90gg', color: Colors.primary },
  { type: 'Plasma', icon: 'flask', desc: 'Solo plasma • 600 ml • ogni 14 giorni', color: '#2980B9' },
  { type: 'Piastrine', icon: 'ellipse', desc: 'Solo piastrine • ogni 30 giorni', color: '#8E44AD' },
];

const generateSlots = (): TimeSlot[] => {
  const times = ['07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30'];
  const unavailable = ['08:00', '09:30', '10:30'];
  return times.map((t, i) => ({ id: `slot_${i}`, time: t, available: !unavailable.includes(t) }));
};

const generateDates = (): { date: Date; label: string; dayNum: string; dayName: string }[] => {
  const result = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) {
      result.push({
        date: d,
        label: [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, '0'),
          String(d.getDate()).padStart(2, '0'),
        ].join('-'),
        dayNum: d.getDate().toString(),
        dayName: d.toLocaleDateString('it-IT', { weekday: 'short' }).toUpperCase(),
      });
    }
  }
  return result;
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'center', label: 'Centro' },
  { key: 'type', label: 'Tipo' },
  { key: 'date', label: 'Data' },
  { key: 'time', label: 'Orario' },
  { key: 'confirm', label: 'Conferma' },
];

export const BookingScreen: React.FC = () => {
  const navigation = useNavigation<BookingNavigation>();
  const [step, setStep] = useState<Step>('center');
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [selectedType, setSelectedType] = useState<DonationType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const dates = generateDates();
  const slots = generateSlots();

  const currentStepIdx = STEPS.findIndex((s) => s.key === step);

  const canProceed = () => {
    if (step === 'center') return !!selectedCenter;
    if (step === 'type') return !!selectedType;
    if (step === 'date') return !!selectedDate;
    if (step === 'time') return !!selectedSlot;
    return true;
  };

  const nextStep = () => {
    const order: Step[] = ['center', 'type', 'date', 'time', 'confirm'];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  };

  const prevStep = () => {
    const order: Step[] = ['center', 'type', 'date', 'time', 'confirm'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  const confirmBooking = () => {
    setShowSuccess(true);
  };

  const resetFlow = () => {
    setStep('center');
    setSelectedCenter(null);
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setShowSuccess(false);
  };

  const selectedSlotTime = slots.find((s) => s.id === selectedSlot)?.time;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prenota Donazione</Text>
        <Text style={styles.headerSub}>Torino e provincia</Text>
      </View>

      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                i < currentStepIdx && styles.stepDotDone,
                i === currentStepIdx && styles.stepDotActive,
              ]}>
                {i < currentStepIdx
                  ? <Ionicons name="checkmark" size={12} color={Colors.white} />
                  : <Text style={[styles.stepNum, i === currentStepIdx && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i === currentStepIdx && styles.stepLabelActive]}>
                {s.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < currentStepIdx && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {step === 'center' && (
          <View>
            <SectionHeader title="Scegli il centro di raccolta" />
            {mockCenters.map((c) => (
              <CenterCard
                key={c.id}
                center={c}
                selected={selectedCenter?.id === c.id}
                onPress={() => setSelectedCenter(c)}
              />
            ))}
          </View>
        )}

        {step === 'type' && (
          <View style={styles.typeContainer}>
            <SectionHeader title="Tipo di donazione" />
            {DONATION_TYPES.filter((dt) =>
              selectedCenter?.availableTypes.includes(dt.type)
            ).map((dt) => (
              <TouchableOpacity
                key={dt.type}
                activeOpacity={0.85}
                onPress={() => setSelectedType(dt.type)}
                style={[styles.typeCard, selectedType === dt.type && { borderColor: dt.color, backgroundColor: dt.color + '08' }]}
              >
                <View style={[styles.typeIcon, { backgroundColor: dt.color + '20' }]}>
                  <Ionicons name={dt.icon} size={26} color={dt.color} />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>{dt.type}</Text>
                  <Text style={styles.typeDesc}>{dt.desc}</Text>
                </View>
                {selectedType === dt.type && (
                  <Ionicons name="checkmark-circle" size={24} color={dt.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'date' && (
          <View>
            <SectionHeader title="Scegli la data" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d.label}
                  onPress={() => setSelectedDate(d.label)}
                  style={[styles.dateCard, selectedDate === d.label && styles.dateCardSelected]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDayName, selectedDate === d.label && styles.dateTextSelected]}>
                    {d.dayName}
                  </Text>
                  <Text style={[styles.dateDayNum, selectedDate === d.label && styles.dateTextSelected]}>
                    {d.dayNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedDate && (
              <View style={styles.selectedDateInfo}>
                <Ionicons name="calendar" size={16} color={Colors.primary} />
                <Text style={styles.selectedDateText}>
                  {new Date(selectedDate).toLocaleDateString('it-IT', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {step === 'time' && (
          <View>
            <SectionHeader title="Scegli l'orario" />
            <TimeSlotPicker
              slots={slots}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
            />
          </View>
        )}

        {step === 'confirm' && selectedCenter && selectedType && selectedDate && selectedSlotTime && (
          <View style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
              <Text style={styles.confirmTitle}>Riepilogo prenotazione</Text>
            </View>
            {[
              { icon: 'business-outline' as const, label: 'Centro', value: selectedCenter.name },
              { icon: 'location-outline' as const, label: 'Indirizzo', value: `${selectedCenter.address}, ${selectedCenter.city}` },
              { icon: 'water-outline' as const, label: 'Tipo', value: selectedType },
              { icon: 'calendar-outline' as const, label: 'Data', value: new Date(selectedDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
              { icon: 'time-outline' as const, label: 'Orario', value: `Ore ${selectedSlotTime}` },
            ].map((row) => (
              <View key={row.label} style={styles.confirmRow}>
                <View style={styles.confirmIcon}>
                  <Ionicons name={row.icon} size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.confirmLabel}>{row.label}</Text>
                  <Text style={styles.confirmValue}>{row.value}</Text>
                </View>
              </View>
            ))}
            <View style={styles.reminderBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
              <Text style={styles.reminderText}>
                Porta documento di identità e tessera sanitaria. Non assumere alcolici nelle 24h precedenti.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step !== 'center' && (
          <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        <Button
          label={step === 'confirm' ? 'Conferma Prenotazione' : 'Continua'}
          onPress={step === 'confirm' ? confirmBooking : nextStep}
          fullWidth
          disabled={!canProceed()}
          style={styles.nextBtn}
        />
      </View>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color={Colors.white} />
            </View>
            <Text style={styles.successTitle}>Prenotazione Confermata!</Text>
            <Text style={styles.successText}>
              Il tuo appuntamento è stato registrato. Riceverai una notifica di promemoria 24h prima.
            </Text>
            <Button label="Torna alla Home" onPress={() => { resetFlow(); navigation.navigate('Home'); }} fullWidth style={{ marginTop: Spacing.md }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotDone: { backgroundColor: Colors.success },
  stepNum: { fontSize: 12, fontWeight: '700', color: Colors.textLight },
  stepNumActive: { color: Colors.white },
  stepLabel: { fontSize: 10, color: Colors.textLight, fontWeight: '500' },
  stepLabelActive: { color: Colors.primary, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginBottom: 14, marginHorizontal: 3 },
  stepLineDone: { backgroundColor: Colors.success },
  scroll: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: 28,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  nextBtn: { flex: 1, height: 48 },
  typeContainer: { gap: Spacing.sm },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
    gap: Spacing.sm,
  },
  typeIcon: { width: 52, height: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  typeInfo: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  typeDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  dateScroll: { marginBottom: Spacing.md },
  dateCard: {
    width: 56,
    height: 70,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  dateCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateDayName: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  dateDayNum: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 2 },
  dateTextSelected: { color: Colors.white },
  selectedDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySoft,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  selectedDateText: { fontSize: 14, fontWeight: '600', color: Colors.primary, textTransform: 'capitalize' },
  confirmCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmHeader: { alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.sm },
  confirmTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  confirmIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: { fontSize: 11, color: Colors.textLight, fontWeight: '600', letterSpacing: 0.3 },
  confirmValue: { fontSize: 14, color: Colors.text, fontWeight: '600', textTransform: 'capitalize', marginTop: 1 },
  reminderBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
  reminderText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', width: '100%' },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  successTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  successText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
});
