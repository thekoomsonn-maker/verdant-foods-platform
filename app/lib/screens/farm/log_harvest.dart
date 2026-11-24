import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/seed.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/ui.dart';

/// 10 · Log harvest: choose crop
class ChooseCropScreen extends StatelessWidget {
  const ChooseCropScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final d = s.draft;
    return VPage(
      header: const Column(children: [VHeader('Log a harvest', trailingText: '1 of 3'), StepBar(1, 3)]),
      bottom: [VButton('Next', icon: LucideIcons.chevronRight, onTap: () => context.push('/log/amount'))],
      children: [
        Text(context.t('What did you harvest?'), style: VT.title),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: .98,
          children: [
            for (final (i, c) in Seed.crops.indexed)
              Rise(
                index: i,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(color: d.crop.id == c.id ? VC.deep : VC.white, borderRadius: BorderRadius.circular(16)),
                  child: Material(
                    type: MaterialType.transparency,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        HapticFeedback.selectionClick();
                        s.update(() {
                          d.crop = c;
                          d.price = (c.marketLow + c.marketHigh) / 2 - .25;
                        });
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(8),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(10), child: SizedBox(width: double.infinity, child: Image.asset(c.image, fit: BoxFit.cover, cacheWidth: 360)))),
                          const SizedBox(height: 8),
                          Text(context.t(c.name), style: VT.bodyStrong.copyWith(fontSize: 17, fontWeight: FontWeight.w500, color: d.crop.id == c.id ? VC.white : VC.ink)),
                        ]),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/// 11 · Log harvest: amount
class AmountScreen extends StatelessWidget {
  const AmountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final d = s.draft;
    void setKg(int v) => s.update(() => d.kg = v.clamp(0, 99999));
    return VPage(
      header: const Column(children: [VHeader('Log a harvest', trailingText: '2 of 3'), StepBar(2, 3)]),
      bottom: [VButton('Next', icon: LucideIcons.chevronRight, onTap: d.kg > 0 ? () => context.push('/log/photo') : null)],
      gap: 14,
      children: [
        Text(context.t('How much {}?', [context.t(d.crop.name).toLowerCase()]), style: VT.title),
        VCard(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
          child: Column(children: [
            Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 160),
                transitionBuilder: (c, a) => FadeTransition(opacity: a, child: ScaleTransition(scale: Tween(begin: .92, end: 1.0).animate(a), child: c)),
                child: Text('${d.kg}', key: ValueKey(d.kg), style: VT.display.copyWith(fontSize: 60)),
              ),
              const SizedBox(width: 6),
              Text('kg', style: VT.heading.copyWith(color: VC.muted, fontWeight: FontWeight.w500)),
            ]),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: VButton('- 10 kg', kind: BtnKind.soft, onTap: d.kg >= 10 ? () => setKg(d.kg - 10) : null)),
              const SizedBox(width: 10),
              Expanded(child: VButton('+ 10 kg', kind: BtnKind.soft, onTap: () => setKg(d.kg + 10))),
            ]),
          ]),
        ),
        const SectionLabel('Or count crates'),
        VCard(
          padding: const EdgeInsets.all(14),
          child: Row(children: [
            const IconChip(LucideIcons.package, size: 40),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(context.t('Crates of {} kg', [d.crop.crateKg]), style: VT.bodyStrong.copyWith(fontSize: 17, fontWeight: FontWeight.w500)),
                Text(context.t('{} crates is {} kg', [d.crates, d.crates * d.crop.crateKg]), style: VT.small),
              ]),
            ),
            Counter(value: d.crates, min: 0, onChanged: (v) => setKg(v * d.crop.crateKg)),
          ]),
        ),
        const SectionLabel('Quality'),
        Wrap(spacing: 8, children: [
          for (final g in ['Grade A', 'Grade B', 'Mixed']) Pill(g, on: d.grade == g, onTap: () => s.update(() => d.grade = g)),
        ]),
      ],
    );
  }
}

/// 12 · Log harvest: photo and price
class PhotoPriceScreen extends StatelessWidget {
  const PhotoPriceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final d = s.draft;
    return VPage(
      header: const Column(children: [VHeader('Log a harvest', trailingText: '3 of 3'), StepBar(3, 3)]),
      bottom: [VButton('Save harvest', icon: LucideIcons.check, onTap: () {
        s.saveHarvest();
        context.go('/log/saved');
      })],
      gap: 14,
      children: [
        Text(context.t('Add a photo'), style: VT.title),
        ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Stack(children: [
            Image.asset('assets/images/photos/hands-tomato.jpg', height: 200, width: double.infinity, fit: BoxFit.cover),
            Positioned(
              left: 12,
              bottom: 12,
              child: Material(
                color: VC.white,
                borderRadius: BorderRadius.circular(99),
                child: InkWell(
                  borderRadius: BorderRadius.circular(99),
                  onTap: () => toast(context, 'Camera opens here on the phone'),
                  child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.camera, size: 17), const SizedBox(width: 6), Text(context.t('Take again'), style: VT.label)])),
                ),
              ),
            ),
          ]),
        ),
        const SectionLabel('Your price'),
        VCard(
          child: Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
                  Text(cedi(d.price, decimals: true), style: VT.title.copyWith(color: VC.deep, fontSize: 28)),
                  const SizedBox(width: 6),
                  Text(context.t('a kg'), style: VT.label.copyWith(color: VC.muted)),
                ]),
                const SizedBox(height: 4),
                Text(context.t('Market price this week: {} to {}', [cedi(d.crop.marketLow, decimals: true), d.crop.marketHigh.toStringAsFixed(2)]), style: VT.small),
              ]),
            ),
            Column(children: [
              RoundIcon(LucideIcons.plus, size: 36, onTap: () => s.update(() => d.price += .5)),
              const SizedBox(height: 6),
              RoundIcon(LucideIcons.minus, size: 36, onTap: () => s.update(() => d.price = (d.price - .5).clamp(.5, 999))),
            ]),
          ]),
        ),
        VCard(
          color: VC.mist,
          child: Column(children: [
            KV('Crop', context.t(d.crop.name)),
            KV('Amount', '${kg(d.kg)} · ${context.t(d.grade)}'),
            KV('You could earn', cedi(d.kg * d.price), strong: true, valueColor: VC.leaf),
          ]),
        ),
      ],
    );
  }
}

/// 13 · Harvest saved
class HarvestSavedScreen extends StatelessWidget {
  const HarvestSavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final h = s.harvests.first;
    return VPage(
      background: VC.deep,
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 16),
      bottom: [
        VButton('Log another harvest', kind: BtnKind.lime, icon: LucideIcons.plus, onTap: () {
          s.startHarvest();
          context.go('/log/crop');
        }),
        VButton('Go home', kind: BtnKind.white, onTap: () => context.go('/farm')),
      ],
      gap: 16,
      children: [
        Center(
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: const Duration(milliseconds: 700),
            curve: Curves.elasticOut,
            builder: (_, v, c) => Transform.scale(scale: v, child: c),
            child: Container(width: 88, height: 88, decoration: const BoxDecoration(color: VC.lime, shape: BoxShape.circle), child: const Icon(LucideIcons.check, size: 42, color: VC.deep)),
          ),
        ),
        Rise(index: 1, child: Text(context.t('Harvest saved'), textAlign: TextAlign.center, style: VT.display.copyWith(color: VC.white))),
        Rise(index: 2, child: Text(context.t(s.online ? 'Buyers can now see your {}. We will tell you when someone makes an offer.' : 'Saved on your phone. Buyers will see your {} as soon as you have signal.', [context.t(h.crop.name).toLowerCase()]), textAlign: TextAlign.center, style: VT.body.copyWith(color: VC.white.withValues(alpha: .85), fontSize: 17))),
        Rise(
          index: 3,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 16),
            decoration: BoxDecoration(color: VC.forest, borderRadius: BorderRadius.circular(18)),
            child: Column(children: [
              Text(context.t('Trace number'), style: VT.label.copyWith(color: VC.white.withValues(alpha: .85), fontWeight: FontWeight.w400)),
              const SizedBox(height: 6),
              Text(h.trace, style: VT.title.copyWith(color: VC.white, fontSize: 28, fontWeight: FontWeight.w500, letterSpacing: .5)),
              const SizedBox(height: 6),
              Text(context.t('Write this on your crates'), style: VT.small.copyWith(color: VC.lime)),
            ]),
          ),
        ),
      ],
    );
  }
}
