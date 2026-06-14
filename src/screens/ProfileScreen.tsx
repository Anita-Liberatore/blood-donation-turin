import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/common/Avatar';
import { Card } from '../components/common/Card';
import { DonorBadge } from '../components/profile/DonorBadge';
import { DonationTimeline } from '../components/profile/DonationTimeline';
import { SectionHeader } from '../components/common/SectionHeader';
import { useUser } from '../hooks/useUser';
import { mockDonations } from '../data/mockDonations';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
}> = ({ icon, label, value, iconColor = Colors.primary, iconBg = Colors.primarySoft }) => (
  <View style={info.row}>
    <View style={[info.iconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={info.text}>
      <Text style={info.label}>{label}</Text>
      <Text style={info.value}>{value}</Text>
    </View>
  </View>
);

export const ProfileScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAllDonations, setShowAllDonations] = useState(false);

  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: Spacing.sm, color: Colors.textSecondary }}>Caricamento...</Text>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.primary} />
        <Text style={{ marginTop: Spacing.sm, color: Colors.textSecondary }}>{error ?? 'Utente non trovato'}</Text>
      </SafeAreaView>
    );
  }
  const typeCount = mockDonations.reduce<Record<string, number>>((acc, d) => {
    acc[d.donationType] = (acc[d.donationType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <Avatar
              initials={user.avatarInitials}
              size={72}
              backgroundColor="rgba(255,255,255,0.25)"
            />
            <View style={styles.heroText}>
              <Text style={styles.heroName}>{user.firstName} {user.lastName}</Text>
              <View style={styles.heroBloodRow}>
                <Ionicons name="water" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroBlood}>Gruppo {user.bloodType}</Text>
              </View>
              <Text style={styles.heroSince}>
                Donatore dal {new Date(user.registrationDate).getFullYear()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.typeGrid}>
          {Object.entries(typeCount).map(([type, count]) => (
            <View key={type} style={styles.typeItem}>
              <Text style={styles.typeCount}>{count}</Text>
              <Text style={styles.typeLabel}>{type}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <DonorBadge level={user.donorLevel} totalDonations={user.totalDonations} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Dati Personali" />
          <Card>
            <InfoRow icon="person-outline" label="Nome completo" value={`${user.firstName} ${user.lastName}`} />
            <InfoRow icon="card-outline" label="Codice Fiscale" value={user.codiceFiscale} iconColor={Colors.info} iconBg={Colors.infoLight} />
            <InfoRow icon="calendar-outline" label="Data di nascita" value={formatDate(user.dateOfBirth)} iconColor="#8E44AD" iconBg="#E8DAEF" />
            <InfoRow icon="mail-outline" label="Email" value={user.email} iconColor={Colors.success} iconBg={Colors.successLight} />
            <InfoRow icon="call-outline" label="Telefono" value={user.phone} iconColor={Colors.warning} iconBg={Colors.warningLight} />
            <InfoRow icon="location-outline" label="Città" value={user.city} iconColor={Colors.info} iconBg={Colors.infoLight} />
            <InfoRow icon="barbell-outline" label="Peso" value={`${user.weight} kg`} iconColor={Colors.success} iconBg={Colors.successLight} />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Storico donazioni"
            actionLabel={showAllDonations ? 'Mostra meno' : 'Vedi tutte'}
            onAction={() => setShowAllDonations(!showAllDonations)}
          />
          <Card>
            <DonationTimeline
              donations={mockDonations}
              limit={showAllDonations ? mockDonations.length : 5}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Impostazioni" />
          <Card>
            <View style={setting.row}>
              <View style={setting.left}>
                <View style={[setting.icon, { backgroundColor: Colors.primarySoft }]}>
                  <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={setting.label}>Notifiche promemoria</Text>
                  <Text style={setting.sub}>Ricevi avvisi per le donazioni</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                activeOpacity={0.8}
                style={[toggle.track, notificationsEnabled && toggle.trackOn]}
              >
                <View style={[toggle.thumb, notificationsEnabled && toggle.thumbOn]} />
              </TouchableOpacity>
            </View>
            {[
              { icon: 'shield-outline' as const, label: 'Privacy e dati', sub: 'Gestisci i tuoi dati', color: Colors.success, bg: Colors.successLight },
              { icon: 'help-circle-outline' as const, label: 'Supporto', sub: 'FAQ e assistenza', color: Colors.info, bg: Colors.infoLight },
              { icon: 'document-text-outline' as const, label: 'Termini di servizio', sub: 'Leggi i termini', color: '#8E44AD', bg: '#E8DAEF' },
            ].map((item) => (
              <TouchableOpacity key={item.label} activeOpacity={0.7} style={[setting.row, setting.rowLast]}>
                <View style={setting.left}>
                  <View style={[setting.icon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View>
                    <Text style={setting.label}>{item.label}</Text>
                    <Text style={setting.sub}>{item.sub}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
          <Text style={styles.logoutText}>Esci dall'account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>BloodDonate Torino v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },
  heroGradient: { padding: Spacing.lg, paddingBottom: Spacing.xl, backgroundColor: Colors.primary },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroText: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  heroBloodRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroBlood: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  heroSince: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  typeItem: { flex: 1, alignItems: 'center' },
  typeCount: { fontSize: 22, fontWeight: '800', color: Colors.text },
  typeLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  version: { textAlign: 'center', fontSize: 11, color: Colors.textLight, marginBottom: Spacing.md },
});

const info = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { fontSize: 11, color: Colors.textLight, fontWeight: '600', letterSpacing: 0.3 },
  value: { fontSize: 14, color: Colors.text, fontWeight: '500', marginTop: 1 },
});

const setting = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowLast: {},
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  icon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  sub: { fontSize: 12, color: Colors.textLight, marginTop: 1 },
});

const toggle = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackOn: { backgroundColor: Colors.primary },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbOn: { alignSelf: 'flex-end' },
});
