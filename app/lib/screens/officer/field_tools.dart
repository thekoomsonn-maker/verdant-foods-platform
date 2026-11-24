import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/models.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/ui.dart';

void _queue(BuildContext context, String title, String note, String icon, String msg) {
  final s = AppScope.read(context);
  s.update(() => s.officerQueue.insert(0, QueueItem(title, note, icon, s.online ? SyncState.sending : SyncState.saved)));
  toast(context, msg);
  context.go('/officer');
}

/// 39 · Officer: map a plot. Tap the photo at each corner to draw the boundary.
class MapPlotScreen extends StatefulWidget {
  const MapPlotScreen({super.key});
  @override
  State<MapPlotScreen> createState() => _MapPlotScreenState();
}

class _MapPlotScreenState extends State<MapPlotScreen> {
  // Corners as fractions of the image, so the shape survives any screen size.
  final pts = <Offset>[const Offset(.18, .26), const Offset(.72, .22), const Offset(.80, .50), const Offset(.30, .56)];
  static const metresPerUnit = 260.0; // width of the photo on the ground, roughly

  double get hectares {
    var a = 0.0;
    for (var i = 0; i < pts.length; i++) {
      final p = pts[i], q = pts[(i + 1) % pts.length];
      a += p.dx * q.dy - q.dx * p.dy;
    }
    return a.abs() / 2 * metresPerUnit * metresPerUnit * 1.6 / 10000;
  }

  double get walked {
    var d = 0.0;
    for (var i = 1; i < pts.length; i++) {
      d += (pts[i] - pts[i - 1]).distance;
    }
    return d * metresPerUnit * 1.3;
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: VC.night,
        body: LayoutBuilder(builder: (context, box) {
          final size = Size(box.maxWidth, box.maxHeight);
          return Stack(fit: StackFit.expand, children: [
            Positioned.fill(child: Image.asset('assets/images/photos/hero-aerial.jpg', fit: BoxFit.cover)),
            Positioned.fill(
              child: GestureDetector(
                onTapUp: (d) {
                  if (d.localPosition.dy > size.height - 230) return;
                  HapticFeedback.selectionClick();
                  setState(() => pts.add(Offset(d.localPosition.dx / size.width, d.localPosition.dy / size.height)));
                },
                child: CustomPaint(painter: _PlotPainter(pts, size)),
              ),
            ),
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Row(children: [
                  RoundIcon(LucideIcons.x, label: context.t('Close'), onTap: () => context.pop()),
                  const SizedBox(width: 10),
                  Expanded(child: Container(height: 44, alignment: Alignment.center, decoration: BoxDecoration(color: VC.night.withValues(alpha: .85), borderRadius: BorderRadius.circular(99)), child: Text(context.t('Walk the edge. Tap at each corner.'), style: VT.label.copyWith(color: VC.white)))),
                ]),
              ),
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 16,
              child: SafeArea(
                top: false,
                child: VCard(
                  radius: 22,
                  child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
                    Row(children: [Expanded(child: Text('${context.t('Plot A')} · Amina Seidu', style: VT.bodyStrong.copyWith(fontSize: 17))), const Tag('GPS ± 3 m', Tone.success)]),
                    const SizedBox(height: 12),
                    Row(children: [
                      Expanded(child: _Box('${pts.length}', 'corners')),
                      const SizedBox(width: 8),
                      Expanded(child: _Box('${hectares.toStringAsFixed(1)} ha', 'so far')),
                      const SizedBox(width: 8),
                      Expanded(child: _Box('${walked.round()} m', 'walked')),
                    ]),
                    const SizedBox(height: 12),
                    Row(children: [
                      Expanded(child: VButton('Add corner', kind: BtnKind.lime, icon: LucideIcons.mapPin, onTap: () => setState(() {
                        final r = math.Random();
                        pts.add(Offset(.25 + r.nextDouble() * .5, .2 + r.nextDouble() * .35));
                      }))),
                      const SizedBox(width: 10),
                      Expanded(child: VButton('Finish', icon: LucideIcons.check, onTap: pts.length >= 3 ? () => _queue(context, 'Plot map · Amina Seidu', '${hectares.toStringAsFixed(1)} ha · ${pts.length} corners', 'sprout', 'Plot saved. It sends when you have signal.') : null)),
                    ]),
                  ]),
                ),
              ),
            ),
          ]);
        }),
      );
}

class _Box extends StatelessWidget {
  const _Box(this.v, this.l);
  final String v;
  final String l;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(12)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          FittedBox(fit: BoxFit.scaleDown, child: Text(v, style: VT.heading.copyWith(color: VC.deep))),
          Text(context.t(l), style: VT.small),
        ]),
      );
}

class _PlotPainter extends CustomPainter {
  _PlotPainter(this.pts, this.size);
  final List<Offset> pts;
  final Size size;

  @override
  void paint(Canvas canvas, Size _) {
    if (pts.isEmpty) return;
    final p = [for (final o in pts) Offset(o.dx * size.width, o.dy * size.height)];
    final path = Path()..addPolygon(p, true);
    canvas.drawPath(path, Paint()..color = VC.lime.withValues(alpha: .18));
    canvas.drawPath(path, Paint()
      ..color = VC.lime
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5);
    for (var i = 0; i < p.length; i++) {
      final last = i == p.length - 1;
      canvas.drawCircle(p[i], last ? 11 : 7, Paint()..color = VC.white);
      canvas.drawCircle(p[i], last ? 8 : 5, Paint()..color = last ? VC.deep : VC.leafLight);
    }
  }

  @override
  bool shouldRepaint(covariant _PlotPainter old) => true;
}

/// 40 · Officer: scan at handover
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});
  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  late final AnimationController a = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600))..repeat(reverse: true);
  bool found = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      HapticFeedback.mediumImpact();
      setState(() => found = true);
    });
  }

  @override
  void dispose() {
    a.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => VPage(
        background: VC.night,
        header: const VHeader('Scan at handover', dark: true, trailingText: 'Tolon point'),
        bottom: [VButton('Confirm handover', kind: BtnKind.lime, icon: LucideIcons.check, onTap: found ? () => _queue(context, 'Handover · VF-B-1180', '239 kg · Tolon point', 'scale', 'Handover confirmed') : null)],
        children: [
          SizedBox(
            height: 260,
            child: Center(
              child: SizedBox(
                width: 170,
                height: 210,
                child: Stack(children: [
                  const Positioned.fill(child: CustomPaint(painter: _CornersPainter())),
                  AnimatedBuilder(animation: a, builder: (_, _) => Positioned(left: 6, right: 6, top: 20 + a.value * 165, child: Container(height: 2, decoration: BoxDecoration(color: VC.lime, boxShadow: [BoxShadow(color: VC.lime.withValues(alpha: .6), blurRadius: 10)])))),
                ]),
              ),
            ),
          ),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 350),
            child: !found
                ? Text(context.t('Point the camera at the crate label'), key: const ValueKey(0), textAlign: TextAlign.center, style: VT.body.copyWith(color: VC.white.withValues(alpha: .75)))
                : VCard(
                    key: const ValueKey(1),
                    radius: 20,
                    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      Row(children: [Expanded(child: Text('VF-B-1180 · ${context.t('Tomatoes')}', style: VT.bodyStrong.copyWith(fontSize: 17))), const Tag('Found', Tone.success)]),
                      const SizedBox(height: 4),
                      Text('Amina Seidu · ${context.t('Plot A')} · ${context.t('picked {}', ['07:40'])}', style: VT.small),
                      const SizedBox(height: 12),
                      Row(children: [Expanded(child: _Weigh('Farmer logged', '240 kg')), const SizedBox(width: 8), Expanded(child: _Weigh('Scale now', '239 kg'))]),
                      const SizedBox(height: 10),
                      const Notice('Within 2%. Weights match.', tone: Tone.success, icon: LucideIcons.circleCheck),
                    ]),
                  ),
          ),
        ],
      );
}

class _Weigh extends StatelessWidget {
  const _Weigh(this.l, this.v, {this.color = VC.ink});
  final String l;
  final String v;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(12)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(context.t(l), style: VT.small), Text(v, style: VT.heading.copyWith(fontSize: 21, color: color))]),
      );
}

class _CornersPainter extends CustomPainter {
  const _CornersPainter();
  @override
  void paint(Canvas c, Size s) {
    final p = Paint()
      ..color = VC.lime
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    const l = 36.0;
    for (final (x, y, dx, dy) in [(0.0, 0.0, 1.0, 1.0), (s.width, 0.0, -1.0, 1.0), (0.0, s.height, 1.0, -1.0), (s.width, s.height, -1.0, -1.0)]) {
      c.drawLine(Offset(x, y), Offset(x + l * dx, y), p);
      c.drawLine(Offset(x, y), Offset(x, y + l * dy), p);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

/// 41 · Officer: combine batches
class MergeScreen extends StatefulWidget {
  const MergeScreen({super.key});
  @override
  State<MergeScreen> createState() => _MergeScreenState();
}

class _MergeScreenState extends State<MergeScreen> {
  int tab = 0;
  final batches = [('VF-B-1180', 240, 'Amina Seidu · Plot A', true), ('VF-B-1181', 160, 'Fati Alhassan · Plot C', true), ('VF-B-1184', 90, 'Kumbungu · pepper', false)];
  late final on = batches.map((b) => b.$4).toList();
  @override
  Widget build(BuildContext context) {
    final total = [for (var i = 0; i < batches.length; i++) if (on[i]) batches[i].$2].fold(0, (a, b) => a + b);
    final farms = on.where((x) => x).length;
    return VPage(
      header: const VHeader('Combine batches', trailingText: 'Tamale'),
      gap: 10,
      bottom: [VButton(tab == 0 ? 'Combine and print label' : 'Split and print labels', icon: LucideIcons.qrCode, onTap: farms >= (tab == 0 ? 2 : 1) ? () => _queue(context, 'New batch · VF-B-1182', '$total kg · $farms farms', 'sprout', 'Label sent to the printer') : null)],
      children: [
        PillTabs(items: const ['Combine', 'Split'], selected: tab, onSelect: (i) => setState(() => tab = i)),
        Text(context.t(tab == 0 ? 'Pick the batches going into one crate lot. Each keeps its own farm record.' : 'Pick the batch to split into smaller lots. Each keeps its farm record.'), style: VT.small),
        for (final (i, b) in batches.indexed)
          CheckRow(leading: const IconChip(LucideIcons.sprout, size: 42, bg: VC.white), title: '${b.$1} · ${b.$2} kg', sub: b.$3, on: on[i], highlight: true, onTap: () => setState(() => on[i] = !on[i])),
        AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(color: VC.deep, borderRadius: BorderRadius.circular(20)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [Expanded(child: Text(context.t('New batch'), style: VT.label.copyWith(color: VC.white, fontWeight: FontWeight.w400))), Tag(context.t('{} farms', [farms]), Tone.info)]),
            const SizedBox(height: 8),
            Text('VF-B-1182', style: VT.title.copyWith(color: VC.lime, fontSize: 28)),
            const SizedBox(height: 6),
            Text('$total kg · ${context.t('tomatoes')} · ${context.t('grade A')}', style: VT.body.copyWith(color: VC.white.withValues(alpha: .85))),
          ]),
        ),
      ],
    );
  }
}

/// 42 · Officer: weight does not match
class WeightCheckScreen extends StatefulWidget {
  const WeightCheckScreen({super.key});
  @override
  State<WeightCheckScreen> createState() => _WeightCheckScreenState();
}

class _WeightCheckScreenState extends State<WeightCheckScreen> {
  int pick = 2;
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Weight check', trailingText: 'VF-B-1190'),
        gap: 10,
        bottom: [VButton('Hold batch and report', icon: LucideIcons.circleAlert, onTap: () => _queue(context, 'Weight report · VF-B-1190', '120 kg missing', 'scale', 'Batch held. Operations will call the farmer.'))],
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: VC.dangerBg, borderRadius: BorderRadius.circular(20)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [const Icon(LucideIcons.circleAlert, color: VC.danger, size: 24), const SizedBox(width: 10), Text(context.t('{} missing', ['120 kg']), style: VT.title.copyWith(color: VC.danger))]),
              const SizedBox(height: 12),
              Row(children: [Expanded(child: _Weigh('Left farm', '520 kg')), const SizedBox(width: 8), Expanded(child: _Weigh('Here now', '400 kg', color: VC.danger))]),
            ]),
          ),
          const SectionLabel('What happened?'),
          for (final (i, (t, s)) in [('Some went bad', 'Thrown away on the way'), ('Scale problem', 'Weigh again'), ('Not sure', 'Ops will call the farmer')].indexed)
            CheckRow(title: t, sub: s, on: pick == i, highlight: true, onTap: () => setState(() => pick = i)),
          RowTile(leading: const IconChip(LucideIcons.camera, size: 42), title: 'Add a photo of the crates', trailing: const Icon(LucideIcons.chevronRight, size: 20, color: VC.muted), onTap: () => toast(context, 'Camera opens here on the phone')),
        ],
      );
}

/// 43 · Officer: check spray records
class SprayRecordsScreen extends StatelessWidget {
  const SprayRecordsScreen({super.key});
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Spray records', trailingText: 'Nyankpala'),
        gap: 10,
        bottom: [
          VButton('Store photo', kind: BtnKind.soft, icon: LucideIcons.camera, compact: true, onTap: () => toast(context, 'Take a photo of the farm store')),
          VButton('Confirm', icon: LucideIcons.check, compact: true, onTap: () => _queue(context, 'Spray check · Nyankpala', '3 records checked', 'sprout', 'Spray records confirmed')),
        ],
        children: [
          ClipRRect(borderRadius: BorderRadius.circular(18), child: Image.asset('assets/images/photos/soil.jpg', height: 120, width: double.infinity, fit: BoxFit.cover)),
          Notice(context.t('{} safe from {}', [context.t('Plot A'), '10 Oct']), sub: context.t('Last spray {} · {}-day gap', ['26 Sep', 14]), tone: Tone.success, icon: LucideIcons.shieldCheck),
          RowTile(title: '${context.t('Copper fungicide')} · 26 Sep', subtitle: 'Label photo and store match', trailing: const Tag('Matches', Tone.success)),
          RowTile(title: '${context.t('Neem spray')} · 20 Sep', subtitle: 'Farmer log only', trailing: const Tag('Check', Tone.warning)),
          RowTile(title: '${context.t('Compost')} · 24 Sep', subtitle: context.t('{} bags', [2]), trailing: const Tag('Matches', Tone.success)),
        ],
      );
}
