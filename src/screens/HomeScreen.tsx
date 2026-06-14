import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BloodTypeCard } from '../components/home/BloodTypeCard';
import { NextAppointmentCard } from '../components/home/NextAppointmentCard';
import { StatsRow } from '../components/home/StatsRow';
import { EmergencyBanner } from '../components/home/EmergencyBanner';
import { SectionHeader } from '../components/common/SectionHeader';
import { mockUser } from '../data/mockUser';
import { mockUpcomingBooking } from '../data/mockDonations';
import { RootTabParamList } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

type HomeNavigation = BottomTabNavigationProp<RootTabParamList>;

const QUICK_ACTIONS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  tab: keyof RootTabParamList;
}[] = [
  { icon: 'calendar-outline' as const, label: 'Prenota', color: Colors.primary, bg: Colors.primarySoft, tab: 'Prenota' },
  { icon: 'document-text-outline' as const, label: 'Documenti', color: '#2980B9', bg: '#D6EAF8', tab: 'Documenti' },
  { icon: 'person-outline' as const, label: 'Profilo', color: '#27AE60', bg: '#D5F5E3', tab: 'Profilo' },
  { icon: 'information-circle-outline' as const, label: 'Requisiti', color: '#8E44AD', bg: '#E8DAEF', tab: 'Home' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigation>();
  const lifesSaved = Math.floor(mockUser.totalDonations * 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>


      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Avis Donazione Torino</Text>
          <Text style={styles.topBarSub}>Centro Donazioni Sangue</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <BloodTypeCard
          bloodType={mockUser.bloodType}
          donorLevel={mockUser.donorLevel}
          totalDonations={mockUser.totalDonations}
          firstName={mockUser.firstName}
        />

        <View style={styles.section}>
          <StatsRow
            totalDonations={mockUser.totalDonations}
            lifesSaved={lifesSaved}
            nextEligibleDate={mockUser.nextEligibleDate}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Prossimo Appuntamento" />
          <NextAppointmentCard
            booking={mockUpcomingBooking}
            onPress={() => navigation.navigate('Prenota')}
            onBook={() => navigation.navigate('Prenota')}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Accesso Rapido" />
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(action.tab)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <EmergencyBanner
            bloodType={mockUser.bloodType}
            onPress={() => navigation.navigate('Prenota')}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Lo sapevi che..." />
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color={Colors.accent} style={{ marginBottom: 6 }} />
            <Text style={styles.tipText}>
              Una singola donazione di sangue intero (450 ml) può salvare fino a{' '}
              <Text style={styles.tipBold}>3 vite</Text>. Il tuo sangue tipo{' '}
              <Text style={styles.tipBold}>{mockUser.bloodType}</Text> è particolarmente
              prezioso per i pazienti in attesa di trasfusione.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  topBarSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  topBarRight: { flexDirection: 'row', gap: Spacing.sm },
  notifBtn: { position: 'relative', padding: 4 },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  scroll: { paddingBottom: Spacing.xxl, gap: Spacing.lg },
  section: { paddingHorizontal: Spacing.md },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tipCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  tipText: { fontSize: 14, color: Colors.text, lineHeight: 21 },
  tipBold: { fontWeight: '700', color: Colors.text },
});
