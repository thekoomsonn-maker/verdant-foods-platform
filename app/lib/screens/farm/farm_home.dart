import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/models.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/ui.dart';

/// 09 · Farm home, plus its first-day (06) and offline (07) states.
class FarmHomeScreen extends StatelessWidget {
  const FarmHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final pending = s.pending;
    if (s.harvests.isEmpty) return const _FirstDay();
    if (!s.online) return _Offline(pending.length);
    final offer = s.offers.where((o) => o.state == OfferState.open).firstOrNull;
    return VPage(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      header: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Row(children: [
          GestureDetector(
            onTap: () => context.push('/farm/profile'),
            child: const CircleAvatar(radius: 23, backgroundImage: AssetImage('assets/images/photos/farmer-amina.jpg')),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/farm/profile'),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(context.t('{}, {}', [context.t(_greeting()), s.farmerName.split(' ').first]), style: VT.heading.copyWith(fontSize: 21), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text('${s.farmName} · ${s.place}', style: VT.small),
              ]),
            ),
          ),
          RoundIcon(LucideIcons.bell, badge: true, label: context.t('Notifications'), onTap: () => context.push('/farm/notifications')),
        ]),
      ),
      children: [
        Rise(
          child: pending.isEmpty
              ? const Notice('All your records are saved', tone: Tone.success, icon: LucideIcons.circleCheck)
              : GestureDetector(onTap: () => context.push('/farm/sync'), child: Notice(context.t('Sending {} records to Verdant…', [pending.length]), tone: Tone.info, icon: LucideIcons.refreshCw)),
        ),
        Rise(index: 1, child: MoneyCard(label: 'Money coming to you', amount: cedi(s.moneyComing), note: 'Paid by MoMo on Friday, 17 Oct', onTap: () => context.go('/farm/money'))),
        if (offer != null)
          Rise(
            index: 2,
            child: VCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Row(children: [
                  Expanded(child: Text(context.t('New offer to buy'), style: VT.bodyStrong.copyWith(fontSize: 17))),
                  Tag(context.t('Reply in {} h', [48]), Tone.warning),
                ]),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(14)),
                  child: Row(children: [
                    CropThumb(offer.crop.image, size: 52),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('${context.t(offer.crop.name)} · ${kg(offer.kg)}', style: VT.bodyStrong.copyWith(fontSize: 17)),
                        Text('${cedi(offer.theirPrice, decimals: true)} ${context.t('a kg')} · ${offer.buyer}', style: VT.small),
                      ]),
                    ),
                  ]),
                ),
                const SizedBox(height: 12),
                VButton('See offer', onTap: () => context.push('/farm/offer/${offer.id}')),
              ]),
            ),
          ),
        Rise(index: 3, child: const SectionLabel('Recent harvests', big: true)),
        for (final (i, h) in s.harvests.take(4).indexed) Rise(index: 4 + i, child: HarvestRow(h)),
      ],
    );
  }

  static String _greeting() {
    final h = DateTime.now().hour;
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
}

class HarvestRow extends StatelessWidget {
  const HarvestRow(this.h, {super.key});
  final Harvest h;

  @override
  Widget build(BuildContext context) {
    final (label, tone) = switch (h.sync) {
      SyncState.saved => ('Saved on phone', Tone.warning),
      SyncState.sending => ('Sending', Tone.info),
      SyncState.failed => ('Could not send', Tone.danger),
      SyncState.sent => switch (h.status) {
          HarvestStatus.waiting => ('Waiting', Tone.info),
          HarvestStatus.sold => ('Sold', Tone.success),
          HarvestStatus.collected => ('Collected', Tone.success),
        },
    };
    return RowTile(
      leading: CropThumb(h.crop.image, size: 50),
      title: '${context.t(h.crop.name)} · ${kg(h.kg)}',
      subtitle: '${context.t(h.when)} · ${h.trace}',
      trailing: Tag(label, tone),
      onTap: () => context.push('/farm/harvest/${h.id}'),
    );
  }
}

/// 06 · First day, nothing logged yet
class _FirstDay extends StatelessWidget {
  const _FirstDay();
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Home', back: false),
        children: [
          const SizedBox(height: 24),
          Center(child: Rise(child: Container(width: 120, height: 120, decoration: const BoxDecoration(color: VC.mint, shape: BoxShape.circle), child: const Icon(LucideIcons.sprout, size: 46, color: VC.leaf)))),
          const SizedBox(height: 8),
          Rise(index: 1, child: Text(context.t('No harvests yet'), textAlign: TextAlign.center, style: VT.title.copyWith(color: VC.deep))),
          Rise(index: 2, child: Text(context.t('When you pick your first crop, tap the green button to log it. It takes less than a minute.'), textAlign: TextAlign.center, style: VT.body.copyWith(color: VC.muted))),
          const SizedBox(height: 8),
          Rise(
            index: 3,
            child: VCard(
              color: VC.mist,
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(context.t('Your field officer'), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
                const SizedBox(height: 6),
                Text('Issah Mahama · 024 318 7720', style: VT.bodyStrong.copyWith(color: VC.deep, fontSize: 17)),
                const SizedBox(height: 4),
                Text(context.t('Call or WhatsApp if you need help.'), style: VT.small),
              ]),
            ),
          ),
        ],
      );
}

/// 07 · No signal
class _Offline extends StatelessWidget {
  const _Offline(this.waiting);
  final int waiting;
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Home', back: false),
        children: [
          const Notice('You are offline. You can keep working.', dark: true, icon: LucideIcons.wifiOff),
          if (waiting > 0) Notice(context.t('{} records saved on your phone. They send when you are online.', [waiting]), tone: Tone.warning, icon: LucideIcons.cloudUpload),
          const _Info('What still works offline', 'Log harvests · record meetings · see your orders and money as last updated'),
          const _Info('Needs signal', 'New bids · payout updates · photos upload'),
          const SectionLabel('Recent harvests', big: true),
          for (final h in AppScope.of(context).harvests.take(3)) HarvestRow(h),
        ],
      );
}

class _Info extends StatelessWidget {
  const _Info(this.title, this.body);
  final String title;
  final String body;
  @override
  Widget build(BuildContext context) => VCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(context.t(title), style: VT.bodyStrong.copyWith(fontSize: 17)),
          const SizedBox(height: 4),
          Text(context.t(body), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
        ]),
      );
}
