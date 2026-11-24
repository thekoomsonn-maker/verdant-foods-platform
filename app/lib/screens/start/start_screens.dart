import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../data/app_state.dart';
import '../../data/seed.dart';
import '../../i18n/i18n.dart';
import '../../theme/tokens.dart';
import '../../widgets/ui.dart';

/// 01 · Welcome and language
class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = AppScope.of(context);
    return VPage(
      background: VC.deep,
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 16),
      bottom: [VButton('Continue', kind: BtnKind.white, onTap: () => context.push('/start/phone'))],
      children: [
        Rise(child: Align(alignment: Alignment.centerLeft, child: Image.asset('assets/brand/logo-cream.png', height: 40))),
        const SizedBox(height: 14),
        Rise(index: 1, child: Text(context.t('Choose your language'), style: VT.title.copyWith(color: VC.white, fontSize: 27))),
        Rise(index: 2, child: Text(context.t('You can change this later in settings.'), style: VT.body.copyWith(color: VC.white.withValues(alpha: .8)))),
        const SizedBox(height: 4),
        for (final (i, l) in Lang.all.indexed)
          Rise(
            index: 3 + i,
            child: _LangRow(l, on: s.lang == l.code, onTap: l.soon ? () => toast(context, 'Coming soon. You can use English for now.') : () => s.setLang(l.code)),
          ),
      ],
    );
  }
}

class _LangRow extends StatelessWidget {
  const _LangRow(this.lang, {required this.on, required this.onTap});
  final Lang lang;
  final bool on;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(color: on ? VC.lime : VC.forest, borderRadius: BorderRadius.circular(14)),
        child: Material(
          type: MaterialType.transparency,
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () {
              HapticFeedback.selectionClick();
              onTap();
            },
            child: SizedBox(
              height: 54,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18),
                child: Row(children: [
                  Expanded(child: Text(lang.name, style: VT.bodyStrong.copyWith(fontSize: 17, fontWeight: FontWeight.w500, color: on ? VC.night : VC.white))),
                  if (on) const Icon(LucideIcons.circleCheck, color: VC.night, size: 22),
                  if (lang.soon) Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3), decoration: BoxDecoration(color: VC.white.withValues(alpha: .12), borderRadius: BorderRadius.circular(99)), child: Text(context.t('Soon'), style: VT.small.copyWith(color: VC.white.withValues(alpha: .8)))),
                ]),
              ),
            ),
          ),
        ),
      );
}

/// 02 · Sign in with phone
class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});
  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  late final TextEditingController c = TextEditingController(text: AppScope.read(context).phone);

  bool get ok => c.text.replaceAll(' ', '').length >= 9;

  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader(''),
        bottom: [VButton('Send code', onTap: ok ? () {
          AppScope.read(context).phone = c.text;
          context.push('/start/code');
        } : null)],
        children: [
          Text(context.t('What is your phone number?'), style: VT.title.copyWith(color: VC.deep)),
          Text(context.t('We will send a code by SMS. Use the number your mobile money is on.'), style: VT.body.copyWith(color: VC.muted)),
          const SizedBox(height: 8),
          Container(
            height: 64,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(color: VC.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: VC.deep, width: 2)),
            child: Row(children: [
              Text('+233', style: VT.bodyStrong.copyWith(fontWeight: FontWeight.w500)),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: c,
                  autofocus: true,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9 ]')), LengthLimitingTextInputFormatter(12)],
                  onChanged: (_) => setState(() {}),
                  style: VT.title.copyWith(fontWeight: FontWeight.w500, fontSize: 26),
                  decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                ),
              ),
            ]),
          ),
          const Notice('No smartphone? A field officer can set you up.'),
        ],
      );
}

/// 03 · Enter code
class CodeScreen extends StatefulWidget {
  const CodeScreen({super.key});
  @override
  State<CodeScreen> createState() => _CodeScreenState();
}

class _CodeScreenState extends State<CodeScreen> {
  String code = '';
  int left = 42;
  Timer? t;

  @override
  void initState() {
    super.initState();
    t = Timer.periodic(const Duration(seconds: 1), (_) => setState(() => left = left > 0 ? left - 1 : 0));
  }

  @override
  void dispose() {
    t?.cancel();
    super.dispose();
  }

  void key(String k) {
    HapticFeedback.selectionClick();
    setState(() {
      if (k == '<') {
        if (code.isNotEmpty) code = code.substring(0, code.length - 1);
      } else if (code.length < 6) {
        code += k;
      }
    });
    if (code.length == 6) Future.delayed(const Duration(milliseconds: 350), () => mounted ? context.push('/start/farm') : null);
  }

  @override
  Widget build(BuildContext context) {
    final phone = AppScope.of(context).phone.replaceAll(' ', '');
    return Scaffold(
      backgroundColor: VC.paper,
      body: SafeArea(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const VHeader(''),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(context.t('Enter the 6-digit code'), style: VT.title.copyWith(color: VC.deep)),
              const SizedBox(height: 12),
              Text(context.t('Sent to {}', ['0${phone.length > 2 ? '${phone.substring(0, 2)} ${phone.substring(2, phone.length.clamp(2, 5))} ${phone.length > 5 ? phone.substring(5) : ''}' : phone}']), style: VT.body.copyWith(color: VC.muted)),
              const SizedBox(height: 20),
              Row(children: [
                for (var i = 0; i < 6; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      height: 58,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(color: VC.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: i == code.length ? VC.deep : Colors.transparent, width: 2)),
                      child: Text(i < code.length ? code[i] : '', style: VT.title.copyWith(fontWeight: FontWeight.w500)),
                    ),
                  ),
                ],
              ]),
              const SizedBox(height: 20),
              left > 0
                  ? Text(context.t('Resend code in 0:{}', [left.toString().padLeft(2, '0')]), style: VT.label.copyWith(color: VC.muted))
                  : GestureDetector(onTap: () => setState(() => left = 42), child: Text(context.t('Send a new code'), style: VT.label.copyWith(color: VC.leaf, fontWeight: FontWeight.w600))),
            ]),
          ),
          const Spacer(),
          Container(
            color: VC.mist,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(children: [
              for (final row in [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '<']])
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(children: [
                    for (final (j, k) in row.indexed) ...[
                      if (j > 0) const SizedBox(width: 8),
                      Expanded(
                        child: k.isEmpty
                            ? const SizedBox(height: 52)
                            : Material(
                                color: VC.white,
                                borderRadius: BorderRadius.circular(10),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(10),
                                  onTap: () => key(k),
                                  child: SizedBox(height: 52, child: Center(child: k == '<' ? const Icon(LucideIcons.arrowLeft, size: 22) : Text(k, style: VT.title.copyWith(fontWeight: FontWeight.w500)))),
                                ),
                              ),
                      ),
                    ],
                  ]),
                ),
            ]),
          ),
        ]),
      ),
    );
  }
}

/// 04 · Set up your farm
class FarmSetupScreen extends StatefulWidget {
  const FarmSetupScreen({super.key});
  @override
  State<FarmSetupScreen> createState() => _FarmSetupScreenState();
}

class _FarmSetupScreenState extends State<FarmSetupScreen> {
  final name = TextEditingController(text: 'Nyankpala Women Farmers');
  final size = TextEditingController(text: '12 hectares');
  String place = 'Tolon, Northern Region';
  late Set<String> grow = {...AppScope.read(context).growing};

  @override
  Widget build(BuildContext context) => VPage(
        header: const VHeader('Your farm', trailingText: 'Step 2 of 3'),
        bottom: [VButton('Next', onTap: grow.isEmpty ? null : () {
          final s = AppScope.read(context);
          s.update(() {
            s.farmName = name.text;
            s.growing = grow.toList();
          });
          context.push('/start/offline');
        })],
        gap: 16,
        children: [
          Field(label: 'Farm or group name', controller: name),
          Field(
            label: 'Where is the farm?',
            icon: LucideIcons.mapPin,
            value: place,
            trailing: TextButton(
              onPressed: () {
                setState(() => place = 'Tolon, Northern Region');
                toast(context, 'Location found');
              },
              child: Text(context.t('Use GPS'), style: VT.label.copyWith(color: VC.leaf, fontWeight: FontWeight.w600)),
            ),
          ),
          Field(label: 'Size', controller: size),
          SectionLabel('What do you grow?'),
          Wrap(spacing: 8, runSpacing: 8, children: [
            for (final c in Seed.crops.take(7)) Pill(c.name, on: grow.contains(c.id), check: true, onTap: () => setState(() => grow.contains(c.id) ? grow.remove(c.id) : grow.add(c.id))),
          ]),
        ],
      );
}

/// 05 · Works without internet
class OfflineIntroScreen extends StatelessWidget {
  const OfflineIntroScreen({super.key});

  @override
  Widget build(BuildContext context) => VPage(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        bottom: [VButton('Start using Verdant', onTap: () {
          AppScope.read(context).finishOnboarding();
          context.go('/farm');
        })],
        gap: 14,
        children: [
          Rise(child: ClipRRect(borderRadius: BorderRadius.circular(22), child: Image.asset('assets/images/photos/hands-tomato.jpg', height: 250, fit: BoxFit.cover))),
          const SizedBox(height: 4),
          Rise(index: 1, child: Text(context.t('Works without internet'), style: VT.title.copyWith(color: VC.deep))),
          Rise(index: 2, child: Text(context.t('Log harvests and record meetings anywhere. Everything is saved on your phone and sent to Verdant when you have signal.'), style: VT.body.copyWith(color: VC.muted))),
          for (final (i, (ic, t)) in [(LucideIcons.cloudUpload, 'Saved on your phone'), (LucideIcons.refreshCw, 'Sends by itself when online'), (LucideIcons.shieldCheck, 'Your records stay safe if the phone is lost')].indexed)
            Rise(index: 3 + i, child: Row(children: [IconChip(ic, size: 40), const SizedBox(width: 14), Expanded(child: Text(context.t(t), style: VT.bodyStrong.copyWith(fontWeight: FontWeight.w500)))])),
        ],
      );
}
