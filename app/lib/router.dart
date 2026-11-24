import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'data/app_state.dart';
import 'i18n/i18n.dart';
import 'screens/farm/farm_home.dart';
import 'screens/farm/farm_screens.dart';
import 'screens/farm/log_harvest.dart';
import 'screens/group/group_screens.dart';
import 'screens/officer/field_tools.dart';
import 'screens/officer/officer_screens.dart';
import 'screens/start/start_screens.dart';
import 'theme/tokens.dart';
import 'widgets/space_shell.dart';
import 'widgets/ui.dart';

final rootKey = GlobalKey<NavigatorState>();

GoRouter buildRouter(AppState state) => GoRouter(
      navigatorKey: rootKey,
      initialLocation: state.onboarded ? '/farm' : '/start',
      routes: [
        GoRoute(path: '/', redirect: (_, _) => state.onboarded ? '/farm' : '/start'),

        // Getting started
        GoRoute(path: '/start', builder: (_, _) => const WelcomeScreen()),
        GoRoute(path: '/start/phone', builder: (_, _) => const PhoneScreen()),
        GoRoute(path: '/start/code', builder: (_, _) => const CodeScreen()),
        GoRoute(path: '/start/farm', builder: (_, _) => const FarmSetupScreen()),
        GoRoute(path: '/start/offline', builder: (_, _) => const OfflineIntroScreen()),

        // Farm space
        _shell(Space.farm, _farmPlus, {
          '/farm': const FarmHomeScreen(),
          '/farm/harvests': const HarvestsScreen(),
          '/farm/orders': const OrdersScreen(),
          '/farm/money': const MoneyScreen(),
        }),
        GoRoute(path: '/farm/profile', builder: (_, _) => const ProfileScreen()),
        GoRoute(path: '/farm/notifications', builder: (_, _) => const NotificationsScreen()),
        GoRoute(path: '/farm/offer/:id', builder: (_, s) => OfferScreen(s.pathParameters['id']!)),
        GoRoute(path: '/farm/harvest/:id', builder: (_, s) => HarvestDetailScreen(s.pathParameters['id']!)),
        GoRoute(path: '/farm/handover', builder: (_, _) => const HandoverScreen()),
        GoRoute(path: '/farm/sync', builder: (_, _) => const SendingScreen()),
        GoRoute(path: '/farm/spray', builder: (_, _) => const SprayScreen()),
        GoRoute(
          path: '/farm/spray/wait',
          builder: (_, s) {
            final q = s.uri.queryParameters;
            return NotSafeScreen(plot: q['plot'] ?? 'Plot A', days: int.tryParse(q['days'] ?? '') ?? 14, safe: q['safe'] ?? '10 Oct', product: q['product'] ?? 'Copper fungicide');
          },
        ),
        GoRoute(path: '/log/crop', builder: (_, _) => const ChooseCropScreen()),
        GoRoute(path: '/log/amount', builder: (_, _) => const AmountScreen()),
        GoRoute(path: '/log/photo', builder: (_, _) => const PhotoPriceScreen()),
        GoRoute(path: '/log/saved', builder: (_, _) => const HarvestSavedScreen()),

        // Savings group space
        _shell(Space.group, (c) => c.push('/meeting/attendance'), {
          '/group': const GroupHomeScreen(),
          '/group/members': const MembersScreen(),
          '/group/loans': const LoansScreen(),
          '/group/records': const RecordsScreen(),
        }),
        GoRoute(path: '/group/loan/new', builder: (_, _) => const NewLoanScreen()),
        GoRoute(path: '/meeting/attendance', builder: (_, _) => const AttendanceScreen()),
        GoRoute(path: '/meeting/savings', builder: (_, _) => const SavingsScreen()),
        GoRoute(path: '/meeting/loans', builder: (_, _) => const MeetingLoansScreen()),
        GoRoute(path: '/meeting/closed', builder: (_, _) => const MeetingClosedScreen()),

        // Field officer space
        _shell(Space.officer, showOfficerActions, {
          '/officer': const OfficerTodayScreen(),
          '/officer/farms': const FarmRecordScreen(),
          '/officer/farmers': const FarmersScreen(),
          '/officer/sync': const OfficerSyncScreen(),
        }),
        GoRoute(path: '/officer/check', builder: (_, _) => const FarmCheckScreen()),
        GoRoute(path: '/officer/log', builder: (_, _) => const OfficerLogScreen()),
        GoRoute(path: '/officer/register', builder: (_, _) => const RegisterFarmerScreen()),
        GoRoute(path: '/officer/map', builder: (_, _) => const MapPlotScreen()),
        GoRoute(path: '/officer/scan', builder: (_, _) => const ScanScreen()),
        GoRoute(path: '/officer/merge', builder: (_, _) => const MergeScreen()),
        GoRoute(path: '/officer/weight', builder: (_, _) => const WeightCheckScreen()),
        GoRoute(path: '/officer/spray', builder: (_, _) => const SprayRecordsScreen()),
      ],
    );

ShellRoute _shell(Space space, void Function(BuildContext) onPlus, Map<String, Widget> tabs) => ShellRoute(
      builder: (context, state, child) => SpaceShell(space: space, location: state.uri.path, onPlus: onPlus, child: child),
      routes: [
        for (final e in tabs.entries)
          GoRoute(
            path: e.key,
            pageBuilder: (_, s) => CustomTransitionPage(key: s.pageKey, child: e.value, transitionDuration: const Duration(milliseconds: 220), transitionsBuilder: (_, a, _, c) => FadeTransition(opacity: CurvedAnimation(parent: a, curve: Curves.easeOut), child: c)),
          ),
      ],
    );

/// The farmer's "+" : log a harvest or log a spray.
void _farmPlus(BuildContext context) {
  showModalBottomSheet(
    context: context,
    builder: (c) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(c.t('What do you want to log?'), style: VT.heading),
          const SizedBox(height: 12),
          RowTile(leading: const IconChip(LucideIcons.leaf, size: 44, bg: VC.lime), title: 'Log a harvest', subtitle: 'Crop, amount, photo and price', onTap: () {
            Navigator.pop(c);
            AppScope.read(context).startHarvest();
            context.push('/log/crop');
          }),
          const SizedBox(height: 8),
          RowTile(leading: const IconChip(LucideIcons.sprayCan, size: 44), title: 'Log a spray', subtitle: 'So no one picks before it is safe', onTap: () {
            Navigator.pop(c);
            context.push('/farm/spray');
          }),
        ]),
      ),
    ),
  );
}
