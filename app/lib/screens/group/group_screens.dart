import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/models.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/language_sheet.dart';
import '../../widgets/ui.dart';

const _sharePrice = 10;

/// 21 · Savings group home
class GroupHomeScreen extends StatelessWidget {
  const GroupHomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    return VPage(
      header: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Row(children: [
          Expanded(
            child: GestureDetector(
              onTap: () => showSpaceSheet(context),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Nkwanta Women VSLA', style: VT.heading.copyWith(fontSize: 21)),
                Text(context.t('You are the record keeper · {} members', [24]), style: VT.small),
              ]),
            ),
          ),
          RoundIcon(LucideIcons.bell, label: context.t('Notifications'), onTap: () => context.push('/farm/notifications')),
        ]),
      ),
      children: [
        if (s.unsentMeetings > 0)
          Rise(child: GestureDetector(onTap: () => context.go('/group/records'), child: Notice(context.t('{} meetings will send when you have signal', [s.unsentMeetings]), tone: Tone.warning, icon: LucideIcons.cloudUpload))),
        Rise(index: 1, child: MoneyCard(label: 'Group savings this cycle', amount: cedi(s.groupSavings), note: context.t('Week {} of 36 · Share price {}', [s.meetingNo, cedi(_sharePrice)]))),
        Rise(index: 2, child: Row(children: [
          Expanded(child: StatCard(cedi(s.outOnLoan), 'Out on loan', onTap: () => context.go('/group/loans'))),
          const SizedBox(width: 12),
          Expanded(child: StatCard(cedi(s.socialFund), 'Social fund', onTap: () => context.go('/group/records'))),
        ])),
        Rise(
          index: 3,
          child: VCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const IconChip(LucideIcons.calendar, size: 42),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('Next meeting'), style: VT.bodyStrong.copyWith(fontSize: 17)),
                  Text(context.t('Wednesday, 15 Oct · 4 pm · Church yard'), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
                ])),
              ]),
              const SizedBox(height: 14),
              VButton('Start meeting', icon: LucideIcons.users, onTap: () => context.push('/meeting/attendance')),
            ]),
          ),
        ),
      ],
    );
  }
}

/// 22 · Meeting: attendance
class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final here = s.members.where((m) => m.present).length + 14;
    return VPage(
      header: Column(children: [VHeader(context.t('Meeting {}', [s.meetingNo]), trailingText: '1 of 3'), const StepBar(1, 3)]),
      bottom: [VButton('Next: savings', icon: LucideIcons.chevronRight, onTap: () => context.push('/meeting/savings'))],
      gap: 10,
      children: [
        Row(children: [Expanded(child: Text(context.t('Who is here?'), style: VT.title)), Text(context.t('{} of {}', [here, 24]), style: VT.bodyStrong.copyWith(color: VC.leaf))]),
        for (final (i, m) in s.members.indexed)
          Rise(
            index: i,
            child: CheckRow(
              leading: Initials(m.initials),
              title: m.name,
              sub: m.present ? 'Present' : m.apology ? 'Sent apology' : 'Absent',
              subColor: m.present ? VC.muted : VC.warning,
              on: m.present,
              onTap: () => s.update(() => m.present = !m.present),
            ),
          ),
      ],
    );
  }
}

/// 23 · Meeting: record savings
class SavingsScreen extends StatelessWidget {
  const SavingsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final present = s.members.where((m) => m.present).toList();
    final shares = present.fold(0, (a, m) => a + m.todayShares) + 44;
    return VPage(
      header: Column(children: [VHeader(context.t('Meeting {}', [s.meetingNo]), trailingText: '2 of 3'), const StepBar(2, 3)]),
      bottom: [VButton('Next: loans', icon: LucideIcons.chevronRight, onTap: () => context.push('/meeting/loans'))],
      gap: 10,
      children: [
        Text(context.t('Shares bought today'), style: VT.title),
        Text(context.t('1 share is {}. Up to 5 shares each.', [cedi(_sharePrice)]), style: VT.small),
        for (final (i, m) in present.indexed)
          Rise(
            index: i,
            child: RowTile(
              leading: Initials(m.initials),
              title: m.name,
              subtitle: cedi(m.todayShares * _sharePrice),
              trailing: Counter(value: m.todayShares, max: 5, onChanged: (v) => s.update(() => m.todayShares = v)),
            ),
          ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(VR.card)),
          child: Row(children: [
            Text(context.t('Saved today'), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
            const Spacer(),
            Text('${cedi(shares * _sharePrice)} · ${context.t('{} shares', [shares])}', style: VT.bodyStrong.copyWith(color: VC.deep)),
          ]),
        ),
      ],
    );
  }
}

/// 24 · Meeting: loans and repayments
class MeetingLoansScreen extends StatefulWidget {
  const MeetingLoansScreen({super.key});
  @override
  State<MeetingLoansScreen> createState() => _MeetingLoansScreenState();
}

class _MeetingLoansScreenState extends State<MeetingLoansScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final due = s.loans.firstWhere((l) => l.member == 'Efua Mensah');
    return VPage(
      header: Column(children: [VHeader(context.t('Meeting {}', [s.meetingNo]), trailingText: '3 of 3'), const StepBar(3, 3)]),
      bottom: [VButton('Close meeting', icon: LucideIcons.lock, onTap: () => context.go('/meeting/closed'))],
      children: [
        PillTabs(items: const ['Repayments', 'New loans'], selected: tab, onSelect: (i) => setState(() => tab = i)),
        if (tab == 0) ...[
          VCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Row(children: [
                const Initials('EM'),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Efua Mensah', style: VT.bodyStrong.copyWith(fontSize: 17)),
                  Text(context.t('Owes {} · due today', [cedi(330)]), style: VT.small),
                ])),
                Tag(due.state == LoanState.paid ? 'Paid' : due.state == LoanState.part ? 'Part' : 'Due', due.state == LoanState.paid ? Tone.success : Tone.warning),
              ]),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(12)),
                child: Row(children: [Text(context.t('Paying today'), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)), const Spacer(), Text(cedi(due.state == LoanState.part ? 150 : 330), style: VT.heading.copyWith(color: VC.deep, fontSize: 22))]),
              ),
              const SizedBox(height: 10),
              Row(children: [
                Expanded(child: VButton('Part payment', kind: due.state == LoanState.part ? BtnKind.primary : BtnKind.soft, onTap: () => s.update(() => due.state = LoanState.part))),
                const SizedBox(width: 10),
                Expanded(child: VButton('Paid in full', icon: LucideIcons.check, kind: due.state == LoanState.paid ? BtnKind.primary : BtnKind.soft, onTap: () => s.update(() => due.state = LoanState.paid))),
              ]),
            ]),
          ),
          RowTile(leading: const Initials('AO'), title: 'Abena Owusu', subtitle: context.t('Paid {} · Loan cleared', [cedi(220)]), trailing: const Tag('Paid', Tone.success)),
          RowTile(leading: const Initials('YN'), title: 'Yaa Nyarko', subtitle: context.t('Paid {} · {} left', [cedi(100), cedi(120)]), trailing: const Tag('Part', Tone.info)),
          RowTile(leading: const Initials('AA'), title: 'Adwoa Asante', subtitle: context.t('Absent · {} due', [cedi(440)]), trailing: const Tag('Late', Tone.danger)),
        ] else ...[
          RowTile(leading: const Initials('AD'), title: 'Afia Darko', subtitle: context.t('Savings {} · can borrow up to {}', [cedi(400), cedi(1200)]), trailing: const Tag('New', Tone.info), onTap: () => context.push('/group/loan/new')),
          VButton('Give a new loan', kind: BtnKind.soft, icon: LucideIcons.plus, onTap: () => context.push('/group/loan/new')),
        ],
      ],
    );
  }
}

/// 25 · Meeting closed
class MeetingClosedScreen extends StatelessWidget {
  const MeetingClosedScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    return VPage(
      background: VC.deep,
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
      bottom: [VButton('Done', kind: BtnKind.lime, icon: LucideIcons.check, onTap: () {
        s.update(() {
          s.meetingNo++;
          s.unsentMeetings += s.online ? 0 : 1;
          s.groupSavings += 640;
        });
        toast(context, s.online ? 'Meeting sent to Verdant' : 'Meeting saved. It sends when you have signal.');
        context.go('/group');
      })],
      gap: 14,
      children: [
        Center(
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: 1),
            duration: const Duration(milliseconds: 700),
            curve: Curves.elasticOut,
            builder: (_, v, c) => Transform.scale(scale: v, child: c),
            child: Container(width: 84, height: 84, decoration: const BoxDecoration(color: VC.lime, shape: BoxShape.circle), child: const Icon(LucideIcons.lock, size: 36, color: VC.deep)),
          ),
        ),
        Rise(index: 1, child: Text(context.t('Meeting {} closed', [s.meetingNo]), textAlign: TextAlign.center, style: VT.title.copyWith(color: VC.white, fontSize: 28))),
        Rise(index: 2, child: Text(context.t('Count the cash together before you lock the box.'), textAlign: TextAlign.center, style: VT.body.copyWith(color: VC.white.withValues(alpha: .85), fontSize: 17))),
        Rise(
          index: 3,
          child: Container(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 12),
            decoration: BoxDecoration(color: VC.forest, borderRadius: BorderRadius.circular(18)),
            child: Column(children: [
              KV('Members present', context.t('{} of {}', [19, 24]), dark: true),
              KV('Saved today', cedi(640), dark: true),
              KV('Repaid today', cedi(650), dark: true),
              KV('New loans', cedi(800), dark: true),
              KV('Social fund', cedi(95), dark: true),
              const Divider(color: Color(0x33FFFFFF), height: 16),
              Row(children: [Text(context.t('Cash in the box'), style: VT.label.copyWith(color: VC.lime)), const Spacer(), Text(cedi(4385), style: VT.heading.copyWith(color: VC.lime))]),
            ]),
          ),
        ),
        const SizedBox(height: 4),
        Text(context.t('Key holders confirmed'), textAlign: TextAlign.center, style: VT.label.copyWith(color: VC.white.withValues(alpha: .85), fontWeight: FontWeight.w400)),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          for (final k in ['AB', 'EQ', 'AD'])
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(color: VC.forest, borderRadius: BorderRadius.circular(99)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.circleCheck, size: 16, color: VC.lime), const SizedBox(width: 6), Text(k, style: VT.label.copyWith(color: VC.white))]),
            ),
        ]),
      ],
    );
  }
}

/// 26 · Members
class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key});
  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final all = AppScope.of(context).members;
    final list = all.where((m) => switch (tab) { 1 => m.onLoan, 2 => m.late, _ => true }).toList();
    return VPage(
      header: VHeader('Members', back: false, trailing: RoundIcon(LucideIcons.search, label: context.t('Search'), onTap: () => toast(context, 'Search members by name'))),
      gap: 10,
      children: [
        PillTabs(items: [context.t('All {}', [24]), context.t('On loan {}', [7]), context.t('Late {}', [1])], selected: tab, onSelect: (i) => setState(() => tab = i)),
        for (final (i, m) in list.indexed)
          Rise(
            index: i,
            child: RowTile(
              leading: Initials(m.initials),
              title: m.name,
              subtitle: m.note,
              subtitleColor: m.late ? VC.danger : null,
              trailing: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(cedi(m.saved), style: VT.bodyStrong.copyWith(color: VC.deep, fontSize: 17)),
                Text(context.t('{} shares', [m.shares]), style: VT.small),
              ]),
            ),
          ),
      ],
    );
  }
}

/// 27 · Loans
class LoansScreen extends StatelessWidget {
  const LoansScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    String tag(LoanState st) => switch (st) { LoanState.late => 'Late', LoanState.due => 'Due', LoanState.onTime => 'On time', LoanState.newLoan => 'New', LoanState.paid => 'Paid', LoanState.part => 'Part' };
    return VPage(
      header: const VHeader('Loans', back: false),
      gap: 10,
      bottom: [VButton('Give a new loan', kind: BtnKind.soft, icon: LucideIcons.plus, onTap: () => context.push('/group/loan/new'))],
      children: [
        Rise(child: MoneyCard(label: 'Out on loan', amount: cedi(s.outOnLoan), note: '7 loans · 10% a month')),
        for (final (i, l) in s.loans.where((l) => l.state != LoanState.paid).indexed)
          Rise(
            index: 1 + i,
            child: RowTile(
              leading: Initials(l.member.split(' ').map((p) => p[0]).join()),
              title: l.member,
              subtitle: '${cedi(l.left > 0 ? l.left : l.amount)} · ${context.t(l.note)}',
              trailing: Tag(tag(l.state), Tag.toneFor(tag(l.state))),
            ),
          ),
        const Rise(index: 6, child: RowTile(leading: Initials('AD'), title: 'Afia Darko', subtitle: 'GH₵ 800 · new today', trailing: Tag('New', Tone.info))),
      ],
    );
  }
}

/// 28 · Records
class RecordsScreen extends StatefulWidget {
  const RecordsScreen({super.key});
  @override
  State<RecordsScreen> createState() => _RecordsScreenState();
}

class _RecordsScreenState extends State<RecordsScreen> {
  int tab = 0;
  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    final meetings = [
      for (var n = s.meetingNo; n > s.meetingNo - 5; n--)
        (context.t('Meeting {}', [n]), n == s.meetingNo ? context.t('Today · {} present', [19]) : '${['8 Oct', '1 Oct', '24 Sep', '17 Sep', '10 Sep'][(s.meetingNo - n - 1).clamp(0, 4)]} · ${context.t('{} present', [24 - (s.meetingNo - n) % 3])}', s.meetingNo - n < s.unsentMeetings ? 'Not sent' : 'Sent'),
    ];
    return VPage(
      header: const VHeader('Records', back: false),
      gap: 10,
      children: [
        PillTabs(items: const ['Meetings', 'Social fund', 'Share-out'], selected: tab, onSelect: (i) => setState(() => tab = i)),
        if (tab == 0)
          for (final (i, (t, sub, st)) in meetings.indexed) Rise(index: i, child: RowTile(leading: const IconChip(LucideIcons.fileText, size: 42), title: t, subtitle: sub, trailing: Tag(st, Tag.toneFor(st)))),
        if (tab == 1) ...[
          StatCard(cedi(s.socialFund), 'In the social fund'),
          const RowTile(leading: IconChip(LucideIcons.heartHandshake, size: 42), title: 'Support for Ama Sarpong', subtitle: 'Hospital bill · 24 Sep', trailing: Text('GH₵ 150')),
          const RowTile(leading: IconChip(LucideIcons.heartHandshake, size: 42), title: 'Funeral support · Esi Quaye', subtitle: '3 Sep', trailing: Text('GH₵ 200')),
        ],
        if (tab != 1)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: VC.mint, borderRadius: BorderRadius.circular(VR.card)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(context.t('Share-out day'), style: VT.bodyStrong.copyWith(color: VC.deep, fontSize: 17)),
              const SizedBox(height: 4),
              Text(context.t('Week 36 · about 21 June. Each share is worth {} so far.', [cedi(12.4, decimals: true)]), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
            ]),
          ),
      ],
    );
  }
}

/// 29 · Give a new loan
class NewLoanScreen extends StatefulWidget {
  const NewLoanScreen({super.key});
  @override
  State<NewLoanScreen> createState() => _NewLoanScreenState();
}

class _NewLoanScreenState extends State<NewLoanScreen> {
  int amount = 800;
  int months = 2;
  @override
  Widget build(BuildContext context) {
    final interest = (amount * .10 * months).round();
    final due = ['10 Nov', '10 Dec', '10 Jan'][months - 1];
    return VPage(
      header: const VHeader('New loan'),
      bottom: [VButton('Give loan', icon: LucideIcons.handCoins, onTap: () {
        final s = AppScope.read(context);
        s.update(() {
          s.loans.insert(0, Loan(member: 'Afia Darko', amount: amount, note: 'new today', state: LoanState.newLoan, left: amount + interest));
          s.outOnLoan += amount;
        });
        toast(context, context.t('Loan recorded. Afia pays back {} by {}.', [cedi(amount + interest), due]));
        context.pop();
      })],
      children: [
        RowTile(leading: const Initials('AD'), title: 'Afia Darko', subtitle: context.t('Savings {} · can borrow up to {}', [cedi(400), cedi(1200)])),
        VCard(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
          child: Column(children: [
            Text(context.t('Amount'), style: VT.label.copyWith(color: VC.muted, fontWeight: FontWeight.w400)),
            const SizedBox(height: 6),
            Text(cedi(amount), style: VT.amount.copyWith(color: VC.deep, fontSize: 44)),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: VButton('- 50', kind: BtnKind.soft, onTap: amount > 50 ? () => setState(() => amount -= 50) : null)),
              const SizedBox(width: 10),
              Expanded(child: VButton('+ 50', kind: BtnKind.soft, onTap: amount < 1200 ? () => setState(() => amount += 50) : null)),
            ]),
          ]),
        ),
        const SectionLabel('Pay back in'),
        Wrap(spacing: 8, children: [for (final m in [1, 2, 3]) Pill(context.t(m == 1 ? '1 month' : '{} months', [m]), on: months == m, onTap: () => setState(() => months = m))]),
        VCard(color: VC.mist, child: Column(children: [
          KV(context.t('Interest (10% a month)'), cedi(interest), strong: true),
          KV('To pay back', cedi(amount + interest), strong: true, valueColor: VC.deep),
          KV('Due', due, strong: true),
        ])),
      ],
    );
  }
}
