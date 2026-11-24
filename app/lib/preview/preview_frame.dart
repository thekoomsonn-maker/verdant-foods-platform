import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../data/app_state.dart';
import '../data/seed.dart';
import '../i18n/i18n.dart';
import '../theme/tokens.dart';

/// Browser preview only: on a wide screen the app sits in a phone-sized frame with a
/// panel to jump between spaces and try offline. On a phone it fills the screen.
class PreviewFrame extends StatelessWidget {
  const PreviewFrame({super.key, required this.router, required this.child});
  final GoRouter router;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    if (mq.size.width < 760 || mq.size.height < 640) return child;
    const phone = Size(390, 844);
    final scale = ((mq.size.height - 48) / phone.height).clamp(.6, 1.0);
    return Material(
      color: VC.mist,
      child: Row(children: [
        Expanded(child: _Panel(router: router)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 48),
          child: Center(
            child: SizedBox(
              width: phone.width * scale,
              height: phone.height * scale,
              child: FittedBox(
                child: Container(
                  width: phone.width + 20,
                  height: phone.height + 20,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: VC.night, borderRadius: BorderRadius.circular(54), boxShadow: const [BoxShadow(color: Color(0x2201261F), blurRadius: 60, offset: Offset(0, 24))]),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(44),
                    child: MediaQuery(
                      data: mq.copyWith(size: phone, padding: const EdgeInsets.only(top: 24), viewPadding: const EdgeInsets.only(top: 24)),
                      child: child,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        const Spacer(),
      ]),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.router});
  final GoRouter router;

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    Widget link(String label, String path) => Padding(
          padding: const EdgeInsets.only(bottom: 2),
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: () => router.go(path),
            child: Padding(padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8), child: Row(children: [Expanded(child: Text(label, style: VT.label.copyWith(fontWeight: FontWeight.w500))), const Icon(LucideIcons.arrowUpRight, size: 15, color: VC.leaf)])),
          ),
        );
    Widget group(String title, List<Widget> links) => Padding(
          padding: const EdgeInsets.only(bottom: 18),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Padding(padding: const EdgeInsets.only(left: 8, bottom: 4), child: Text(title.toUpperCase(), style: VT.small.copyWith(letterSpacing: 1, fontWeight: FontWeight.w600, color: VC.leaf))), ...links]),
        );
    return Align(
      alignment: Alignment.centerRight,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: ListView(padding: const EdgeInsets.fromLTRB(24, 40, 24, 40), shrinkWrap: true, children: [
          Image.asset('assets/brand/logo-green.png', height: 36, alignment: Alignment.centerLeft),
          const SizedBox(height: 14),
          Text('App preview', style: VT.title.copyWith(color: VC.deep)),
          const SizedBox(height: 4),
          Text('For farmers, savings groups and field officers. Sample data only.', style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
          const SizedBox(height: 22),
          group('Getting started', [link('Welcome and language', '/start'), link('Sign in with phone', '/start/phone')]),
          group('Farmer', [link('Farm home', '/farm'), link('Log a harvest', '/log/crop'), link('Offer to buy', '/farm/offer/o1'), link('Hand over', '/farm/handover'), link('Log a spray', '/farm/spray'), link('My farm and sync', '/farm/profile')]),
          group('Savings group', [link('Group home', '/group'), link('Run a meeting', '/meeting/attendance'), link('Give a new loan', '/group/loan/new')]),
          group('Field officer', [link('Today', '/officer'), link('Map a plot', '/officer/map'), link('Scan at handover', '/officer/scan'), link('Combine batches', '/officer/merge'), link('Weight check', '/officer/weight')]),
          const Divider(height: 24),
          SwitchListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 8), dense: true, title: Text('No signal', style: VT.label), value: !s.online, activeTrackColor: VC.deep, onChanged: (v) => s.setOnline(!v)),
          SwitchListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 8), dense: true, title: Text('New farmer, nothing logged', style: VT.label), value: s.harvests.isEmpty, activeTrackColor: VC.deep, onChanged: (v) => s.update(() => s.harvests = v ? [] : Seed.harvests())),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: DropdownButton<String>(
              value: s.lang,
              isExpanded: true,
              underline: const SizedBox(),
              style: VT.label,
              items: [for (final l in Lang.all) DropdownMenuItem(value: l.code, enabled: !l.soon, child: Text(l.soon ? '${l.name} (soon)' : l.name))],
              onChanged: (v) => v == null ? null : s.setLang(v),
            ),
          ),
          TextButton.icon(onPressed: () {
            s.resetDemo();
            router.go('/start');
          }, icon: const Icon(LucideIcons.rotateCcw, size: 16, color: VC.deep), label: Text('Start again', style: VT.label.copyWith(color: VC.deep))),
        ]),
      ),
    );
  }
}
