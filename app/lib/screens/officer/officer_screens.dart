import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/models.dart';
import '../../data/seed.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/language_sheet.dart';
import '../../widgets/ui.dart';

IconData officerIcon(String k) => switch (k) {
      'scale' => LucideIcons.scale,
      'users' => LucideIcons.users,
      'user-check' => LucideIcons.userCheck,
      _ => LucideIcons.sprout,
    };

/// The officer's "+" opens every field task.
void showOfficerActions(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (c) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(c.t('What are you doing?'), style: VT.heading),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 2.1,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              for (final (i, t, p) in [
                (LucideIcons.scale, 'Log a harvest', '/officer/log'),
                (LucideIcons.userPlus, 'Register a farmer', '/officer/register'),
                (LucideIcons.clipboardCheck, 'Farm check', '/officer/check'),
                (LucideIcons.map, 'Map a plot', '/officer/map'),
                (LucideIcons.scanLine, 'Scan at handover', '/officer/scan'),
                (LucideIcons.merge, 'Combine batches', '/officer/merge'),
                (LucideIcons.triangleAlert, 'Weight check', '/officer/weight'),
                (LucideIcons.sprayCan, 'Spray records', '/officer/spray'),
              ])
                VCard(
                  padding: const EdgeInsets.all(12),
                  onTap: () {
                    Navigator.pop(c);
                    context.push(p);
                  },
                  child: Row(children: [IconChip(i, size: 38), const SizedBox(width: 10), Expanded(child: Text(c.t(t), style: VT.label.copyWith(fontWeight: FontWeight.w600)))]),
                ),
            ],
          ),
        ]),
      ),
    ),
  );
}

/// 30 · Officer: today
class OfficerTodayScreen extends StatelessWidget {
  const OfficerTodayScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final toSend = s.officerQueue.where((q) => q.state != SyncState.sent).length;
    return VPage(
      header: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Row(children: [
          Expanded(
            child: GestureDetector(
              onTap: () => showSpaceSheet(context),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(context.t('Today, {}', ['Yaw']), style: VT.heading.copyWith(fontSize: 21)),
                Text(context.t('Techiman North · {} farm visits', [5]), style: VT.small),
              ]),
            ),
          ),
          if (toSend > 0) GestureDetector(onTap: () => context.go('/officer/sync'), child: Tag(context.t('{} to send', [toSend]), Tone.warning)),
        ]),
      ),
      gap: 10,
      children: [
        Rise(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Stack(children: [
              Image.asset('assets/images/photos/aerial-plots.jpg', height: 150, width: double.infinity, fit: BoxFit.cover),
              Positioned(
                left: 12,
                bottom: 12,
                child: Material(
                  color: VC.white,
                  borderRadius: BorderRadius.circular(99),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(99),
                    onTap: () => context.push('/officer/check'),
                    child: Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9), child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.mapPin, size: 17, color: VC.deep), const SizedBox(width: 6), Text(context.t('Next: {} · {}', ['Agyeman Farms', '2.4 km']), style: VT.label.copyWith(color: VC.deep))])),
                  ),
                ),
              ),
            ]),
          ),
        ),
        for (final (i, v) in Seed.visits.indexed)
          Rise(
            index: 1 + i,
            child: RowTile(
              leading: IconChip(officerIcon(v.icon), size: 42),
              title: v.place,
              subtitle: '${v.time} · ${context.t(v.task)}',
              trailing: Tag(v.tag, Tag.toneFor(v.tag)),
              onTap: () => context.push(v.route),
            ),
          ),
      ],
    );
  }
}

/// 31 · Officer: farm record
class FarmRecordScreen extends StatelessWidget {
  const FarmRecordScreen({super.key});
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Farms', back: false),
        children: [
          Rise(child: ClipRRect(borderRadius: BorderRadius.circular(18), child: Image.asset('assets/images/photos/aerial-plots.jpg', height: 140, width: double.infinity, fit: BoxFit.cover))),
          Rise(
            index: 1,
            child: VCard(
              child: Column(children: [
                Row(children: [
                  const CircleAvatar(radius: 24, backgroundImage: AssetImage('assets/images/photos/farmer-amina.jpg')),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Agyeman Farms', style: VT.bodyStrong.copyWith(fontSize: 17)), Text('Amina Agyeman · Techiman North', style: VT.small)])),
                  const Tag('Verified', Tone.success),
                ]),
                const SizedBox(height: 8),
                KV('Size', context.t('{} acres · {} plots', [4, 3])),
                KV('Crops now', '${context.t('Tomatoes')}, ${context.t('Pepper')}, ${context.t('Okra')}'),
                KV('Last visit', '6 Oct · Yaw Darko'),
                KV('Harvests this season', '11 · 2,980 kg'),
              ]),
            ),
          ),
          Rise(index: 2, child: RowTile(leading: const IconChip(LucideIcons.sprout, size: 42), title: '${context.t('Plot A')} · ${context.t('Tomatoes')}', subtitle: context.t('{} acres · harvest now', [1.5]), trailing: const Tag('Ready', Tone.success), onTap: () => context.push('/officer/map'))),
          Rise(index: 3, child: RowTile(leading: const IconChip(LucideIcons.leaf, size: 42), title: '${context.t('Plot B')} · ${context.t('Pepper')}', subtitle: context.t('{} acres · {} weeks to harvest', [1.5, 3]), trailing: const Tag('Growing', Tone.info), onTap: () => context.push('/officer/map'))),
          Rise(index: 4, child: VButton('Start farm check', kind: BtnKind.soft, icon: LucideIcons.clipboardCheck, onTap: () => context.push('/officer/check'))),
        ],
      );
}

/// 32 · Officer: farm check
class FarmCheckScreen extends StatefulWidget {
  const FarmCheckScreen({super.key});
  @override
  State<FarmCheckScreen> createState() => _FarmCheckScreenState();
}

class _FarmCheckScreenState extends State<FarmCheckScreen> {
  final on = [true, true, true, false, false];
  static const items = [('Plants look healthy', 'No yellow or dry leaves'), ('Water is enough', 'Drip lines working'), ('No pests seen', 'Check under the leaves'), ('Inputs recorded', 'Fertiliser and spray used'), ('Farm boundary matches the map', 'Walk the edges')];
  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Farm check', trailingText: 'Agyeman Farms'),
        gap: 10,
        bottom: [
          VButton('Add photo', kind: BtnKind.soft, icon: LucideIcons.camera, compact: true, onTap: () => toast(context, 'Camera opens here on the phone')),
          VButton('Save', icon: LucideIcons.check, compact: true, onTap: () => _save(context, 'Farm check · Agyeman Farms', '${on.where((x) => x).length} of 5 items', 'sprout')),
        ],
        children: [
          ClipRRect(borderRadius: BorderRadius.circular(18), child: Image.asset('assets/images/photos/soil.jpg', height: 130, width: double.infinity, fit: BoxFit.cover)),
          const SectionLabel('Check each item', big: true),
          for (final (i, (t, s)) in items.indexed) CheckRow(title: t, sub: s, on: on[i], onTap: () => setState(() => on[i] = !on[i])),
        ],
      );
}

void _save(BuildContext context, String title, String note, String icon) {
  final s = AppScope.read(context);
  s.update(() => s.officerQueue.insert(0, QueueItem(title, '${context.t('Today')} · ${context.t(note)}', icon, s.online ? SyncState.sending : SyncState.saved)));
  toast(context, s.online ? 'Saved and sending to Verdant' : 'Saved on your phone. It sends when you have signal.');
  context.go('/officer');
}

/// 33 · Officer: log harvest for a farmer
class OfficerLogScreen extends StatefulWidget {
  const OfficerLogScreen({super.key});
  @override
  State<OfficerLogScreen> createState() => _OfficerLogScreenState();
}

class _OfficerLogScreenState extends State<OfficerLogScreen> {
  var farmer = Seed.farmers[1];
  var crop = Seed.crop('garden-eggs');
  final weight = TextEditingController(text: '210');
  String grade = 'Grade A';

  @override
  Widget build(BuildContext context) {
    final w = int.tryParse(weight.text) ?? 0;
    return VPage(
      header: const VHeader('Log for a farmer'),
      gap: 12,
      bottom: [VButton('Save harvest', icon: LucideIcons.check, onTap: w > 0 ? () => _save(context, 'Harvest · ${farmer.name}', '$w kg', 'scale') : null)],
      children: [
        _Select(leading: Initials(farmer.initials), title: farmer.name, sub: farmer.farm, onTap: () => _pick(context, [for (final f in Seed.farmers) (f.name, f.farm)], (i) => setState(() => farmer = Seed.farmers[i]))),
        _Select(leading: CropThumb(crop.image, size: 46), title: context.t(crop.name), sub: context.t('Crop'), onTap: () => _pick(context, [for (final c in Seed.crops) (context.t(c.name), '')], (i) => setState(() => crop = Seed.crops[i]))),
        Text(context.t('Weight on the scale'), style: VT.label),
        Container(
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(color: VC.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: VC.deep, width: 2)),
          child: Row(children: [
            const Icon(LucideIcons.scale, size: 20, color: VC.muted),
            const SizedBox(width: 12),
            Expanded(child: TextField(controller: weight, keyboardType: TextInputType.number, onChanged: (_) => setState(() {}), style: VT.body.copyWith(fontSize: 17), decoration: const InputDecoration(border: InputBorder.none, isDense: true, suffixText: 'kg'))),
          ]),
        ),
        Field(label: 'Crates', icon: LucideIcons.package, value: context.t('{} crates', [(w / crop.crateKg).ceil()])),
        Text(context.t('Quality'), style: VT.label),
        _Select(title: context.t(grade), onTap: () => _pick(context, [('Grade A', ''), ('Grade B', ''), ('Mixed', '')], (i) => setState(() => grade = ['Grade A', 'Grade B', 'Mixed'][i]))),
        Notice(context.t('{} will get a message to confirm this harvest.', [farmer.name.split(' ').first])),
      ],
    );
  }
}

class _Select extends StatelessWidget {
  const _Select({this.leading, required this.title, this.sub, required this.onTap});
  final Widget? leading;
  final String title;
  final String? sub;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => RowTile(leading: leading, title: title, subtitle: sub, onTap: onTap, trailing: const Icon(LucideIcons.chevronDown, size: 20, color: VC.muted));
}

void _pick(BuildContext context, List<(String, String)> options, ValueChanged<int> onPick) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (c) => SafeArea(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(c).height * .7),
        child: ListView(shrinkWrap: true, padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), children: [
          for (final (i, (t, s)) in options.indexed)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: RowTile(title: t, subtitle: s.isEmpty ? null : s, onTap: () {
                onPick(i);
                Navigator.pop(c);
              }),
            ),
        ]),
      ),
    ),
  );
}

/// 34 · Officer: register a farmer
class RegisterFarmerScreen extends StatefulWidget {
  const RegisterFarmerScreen({super.key});
  @override
  State<RegisterFarmerScreen> createState() => _RegisterFarmerScreenState();
}

class _RegisterFarmerScreenState extends State<RegisterFarmerScreen> {
  final name = TextEditingController(text: 'Kwabena Owusu');
  final phone = TextEditingController();
  bool agree = true;
  bool photo = false;
  String community = 'Techiman North';
  String crops = 'Tomatoes, Pepper';
  String lang = 'Twi (Asante)';

  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('New farmer'),
        gap: 14,
        bottom: [VButton('Register farmer', icon: LucideIcons.userCheck, onTap: agree && name.text.isNotEmpty ? () => _save(context, 'New farmer · ${name.text}', community, 'user-check') : null)],
        children: [
          VCard(
            color: Colors.transparent,
            padding: EdgeInsets.zero,
            onTap: () => setState(() => photo = true),
            child: Row(children: [
              photo ? const CircleAvatar(radius: 28, backgroundImage: AssetImage('assets/images/photos/farmer-amina.jpg')) : Container(width: 56, height: 56, decoration: const BoxDecoration(color: VC.mint, shape: BoxShape.circle), child: const Icon(LucideIcons.camera, color: VC.deep)),
              const SizedBox(width: 14),
              Text(context.t(photo ? 'Photo added' : "Take the farmer's photo"), style: VT.bodyStrong.copyWith(color: VC.deep, fontSize: 17)),
            ]),
          ),
          Field(label: 'Full name', controller: name),
          Field(label: 'Phone number', controller: phone, hint: '024 000 0000', icon: LucideIcons.phone, keyboard: TextInputType.phone, focus: true),
          Field(label: 'Community', icon: LucideIcons.mapPin, value: community, trailing: const Icon(LucideIcons.chevronDown, size: 20, color: VC.muted), onTap: () => _pick(context, [('Techiman North', ''), ('Techiman South', ''), ('Tolon', ''), ('Nkwanta', '')], (i) => setState(() => community = ['Techiman North', 'Techiman South', 'Tolon', 'Nkwanta'][i]))),
          Field(label: 'Main crops', value: crops, trailing: const Icon(LucideIcons.chevronDown, size: 20, color: VC.muted), onTap: () => _pick(context, [for (final c in Seed.crops) (c.name, '')], (i) => setState(() => crops = Seed.crops[i].name))),
          Field(label: 'Language', icon: LucideIcons.languages, value: lang, trailing: const Icon(LucideIcons.chevronDown, size: 20, color: VC.muted), onTap: () => _pick(context, [for (final l in Lang.all) (l.name, '')], (i) => setState(() => lang = Lang.all[i].name))),
          GestureDetector(
            onTap: () => setState(() => agree = !agree),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [TickBox(agree), const SizedBox(width: 12), Expanded(child: Text(context.t('The farmer agrees to share farm records with Verdant Foods'), style: VT.label))]),
          ),
        ],
      );
}

/// 35 · Officer: farmers
class FarmersScreen extends StatefulWidget {
  const FarmersScreen({super.key});
  @override
  State<FarmersScreen> createState() => _FarmersScreenState();
}

class _FarmersScreenState extends State<FarmersScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final list = Seed.farmers.where((f) => switch (tab) { 1 => f.tag == 'Visit due', 2 => f.tag == 'New', _ => true }).toList();
    return VPage(
      header: VHeader('My farmers', back: false, trailing: RoundIcon(LucideIcons.search, label: context.t('Search'), onTap: () => toast(context, 'Search farmers by name or phone'))),
      gap: 10,
      children: [
        PillTabs(items: [context.t('All {}', [86]), context.t('Visit due {}', [12]), context.t('New {}', [4])], selected: tab, onSelect: (i) => setState(() => tab = i)),
        for (final (i, f) in list.indexed) Rise(index: i, child: RowTile(leading: Initials(f.initials), title: f.name, subtitle: f.farm, trailing: Tag(f.tag, Tag.toneFor(f.tag)), onTap: () => context.go('/officer/farms'))),
      ],
    );
  }
}

/// 36 · Officer: sync
class OfficerSyncScreen extends StatelessWidget {
  const OfficerSyncScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final q = s.officerQueue;
    final waiting = q.where((x) => x.state == SyncState.saved || x.state == SyncState.sending).length;
    final failed = q.where((x) => x.state == SyncState.failed).length;
    String tag(SyncState st) => switch (st) { SyncState.sending => 'Sending', SyncState.saved => 'Waiting', SyncState.failed => 'Failed', SyncState.sent => 'Sent' };
    return VPage(
      header: const VHeader('Send records', back: false),
      gap: 10,
      children: [
        if (waiting > 0) Notice(context.t(s.online ? 'Sending {} of {} records' : '{} records will send when you have signal', s.online ? [1, waiting + failed] : [waiting]), tone: s.online ? Tone.info : Tone.warning, icon: LucideIcons.refreshCw),
        Row(children: [
          Expanded(child: StatCard('${41 + q.where((x) => x.state == SyncState.sent).length}', 'Sent this week', color: VC.ink)),
          const SizedBox(width: 8),
          Expanded(child: StatCard('$waiting', 'Waiting', color: VC.ink)),
          const SizedBox(width: 8),
          Expanded(child: StatCard('$failed', 'Could not send', color: failed > 0 ? VC.danger : VC.ink)),
        ]),
        const SectionLabel('Waiting to send'),
        for (final (i, item) in q.where((x) => x.state != SyncState.sent).indexed)
          Rise(index: i, child: RowTile(leading: IconChip(officerIcon(item.icon), size: 42), title: item.title, subtitle: item.note, trailing: Tag(tag(item.state), Tag.toneFor(tag(item.state))))),
        if (failed > 0) const Notice('Phone number is already used by another farmer. Check and try again.', tone: Tone.danger, icon: LucideIcons.circleAlert),
        VButton('Try again', kind: BtnKind.soft, icon: LucideIcons.refreshCw, onTap: () {
          if (!s.online) return toast(context, 'No signal yet. We will try again by ourselves.');
          s.update(() {
            for (final x in q) {
              if (x.state != SyncState.failed) x.state = SyncState.sent;
            }
          });
          toast(context, 'Records sent');
        }),
      ],
    );
  }
}
