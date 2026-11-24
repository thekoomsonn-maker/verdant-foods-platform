import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../i18n/i18n.dart';
import '../theme/tokens.dart';

class NavItem {
  const NavItem(this.label, this.icon, this.path);
  final String label;
  final IconData icon;
  final String path;
}

/// The three spaces of the app, each with four tabs and a green "+" in the middle.
enum Space {
  farm([NavItem('Home', LucideIcons.house, '/farm'), NavItem('Harvests', LucideIcons.leaf, '/farm/harvests'), NavItem('Orders', LucideIcons.package, '/farm/orders'), NavItem('Money', LucideIcons.wallet, '/farm/money')]),
  group([NavItem('Home', LucideIcons.house, '/group'), NavItem('Members', LucideIcons.users, '/group/members'), NavItem('Loans', LucideIcons.handCoins, '/group/loans'), NavItem('Records', LucideIcons.fileText, '/group/records')]),
  officer([NavItem('Today', LucideIcons.house, '/officer'), NavItem('Farms', LucideIcons.tractor, '/officer/farms'), NavItem('Farmers', LucideIcons.users, '/officer/farmers'), NavItem('Sync', LucideIcons.refreshCw, '/officer/sync')]);

  const Space(this.items);
  final List<NavItem> items;
}

class SpaceShell extends StatelessWidget {
  const SpaceShell({super.key, required this.space, required this.location, required this.child, required this.onPlus});
  final Space space;
  final String location;
  final Widget child;
  final void Function(BuildContext) onPlus;

  @override
  Widget build(BuildContext context) {
    final items = space.items;
    final current = items.lastIndexWhere((i) => location == i.path || location.startsWith('${i.path}/'));
    return Scaffold(
      backgroundColor: VC.paper,
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(color: VC.white, boxShadow: [BoxShadow(color: Color(0x0F01261F), blurRadius: 16, offset: Offset(0, -2))]),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 76,
            child: Row(children: [
              for (var i = 0; i < 2; i++) Expanded(child: _Tab(items[i], on: i == current)),
              Expanded(
                child: Center(
                  child: Semantics(
                    button: true,
                    label: context.t(space == Space.group ? 'Start meeting' : 'Log a harvest'),
                    child: Material(
                      color: VC.deep,
                      shape: const CircleBorder(),
                      elevation: 3,
                      shadowColor: VC.deep.withValues(alpha: .4),
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: () {
                          HapticFeedback.mediumImpact();
                          onPlus(context);
                        },
                        child: const SizedBox(width: 58, height: 58, child: Icon(LucideIcons.plus, color: VC.white, size: 28)),
                      ),
                    ),
                  ),
                ),
              ),
              for (var i = 2; i < 4; i++) Expanded(child: _Tab(items[i], on: i == current)),
            ]),
          ),
        ),
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab(this.item, {required this.on});
  final NavItem item;
  final bool on;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          context.go(item.path);
        },
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            curve: Curves.easeOutCubic,
            width: on ? 54 : 32,
            height: 30,
            decoration: BoxDecoration(color: on ? VC.lime : Colors.transparent, borderRadius: BorderRadius.circular(VR.pill)),
            child: Icon(item.icon, size: 21, color: on ? VC.deep : VC.muted),
          ),
          const SizedBox(height: 3),
          Text(context.t(item.label), style: VT.small.copyWith(fontSize: 12.5, color: on ? VC.deep : VC.muted, fontWeight: on ? FontWeight.w600 : FontWeight.w500)),
        ]),
      );
}
