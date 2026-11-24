import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../i18n/i18n.dart';
import '../theme/tokens.dart';

/// Screen frame: paper background, optional header, scrolling body and buttons pinned at the bottom.
class VPage extends StatelessWidget {
  const VPage({super.key, this.header, required this.children, this.bottom, this.padding = const EdgeInsets.fromLTRB(16, 8, 16, 24), this.background = VC.paper, this.scroll = true, this.gap = 12});
  final Widget? header;
  final List<Widget> children;
  final List<Widget>? bottom;
  final EdgeInsets padding;
  final Color background;
  final bool scroll;
  final double gap;

  @override
  Widget build(BuildContext context) {
    final body = Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: spaced(children, gap));
    return Scaffold(
      backgroundColor: background,
      body: SafeArea(
        bottom: false,
        child: Column(children: [
          ?header,
          Expanded(child: scroll ? SingleChildScrollView(padding: padding, child: body) : Padding(padding: padding, child: body)),
          if (bottom != null)
            SafeArea(
              top: false,
              child: Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 16), child: Column(mainAxisSize: MainAxisSize.min, children: spaced(_rows(bottom!), 10))),
            ),
        ]),
      ),
    );
  }
}

/// Side-by-side for buttons marked `compact`, stacked for the rest.
List<Widget> _rows(List<Widget> items) {
  final out = <Widget>[];
  for (var i = 0; i < items.length; i++) {
    final w = items[i];
    if (w is VButton && w.compact && i + 1 < items.length && items[i + 1] is VButton && (items[i + 1] as VButton).compact) {
      out.add(Row(children: [Expanded(child: w), const SizedBox(width: 10), Expanded(child: items[i + 1])]));
      i++;
    } else {
      out.add(w);
    }
  }
  return out;
}

List<Widget> spaced(List<Widget> items, double gap) => [
      for (var i = 0; i < items.length; i++) ...[if (i > 0) SizedBox(height: gap, width: gap), items[i]],
    ];

/// Top bar with round back button, title and optional trailing text or widget.
class VHeader extends StatelessWidget {
  const VHeader(this.title, {super.key, this.back = true, this.trailing, this.trailingText, this.onBack, this.close = false, this.dark = false, this.big = false});
  final String title;
  final bool back;
  final bool close;
  final Widget? trailing;
  final String? trailingText;
  final VoidCallback? onBack;
  final bool dark;
  final bool big;

  @override
  Widget build(BuildContext context) {
    final fg = dark ? VC.white : VC.ink;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: SizedBox(
        height: 44,
        child: Row(children: [
          if (back) ...[
            RoundIcon(close ? LucideIcons.x : LucideIcons.arrowLeft, onTap: onBack ?? () => context.canPop() ? context.pop() : context.go('/'), dark: dark, label: context.t('Back')),
            const SizedBox(width: 12),
          ],
          Expanded(child: Text(context.t(title), style: (big ? VT.heading.copyWith(fontSize: 21) : VT.heading).copyWith(color: fg), maxLines: 1, overflow: TextOverflow.ellipsis)),
          if (trailingText != null) Text(context.t(trailingText!), style: VT.label.copyWith(color: dark ? VC.lime : VC.muted)),
          ?trailing,
        ]),
      ),
    );
  }
}

class RoundIcon extends StatelessWidget {
  const RoundIcon(this.icon, {super.key, required this.onTap, this.dark = false, this.size = 44, this.label, this.badge = false});
  final IconData icon;
  final VoidCallback onTap;
  final bool dark;
  final double size;
  final String? label;
  final bool badge;

  @override
  Widget build(BuildContext context) => Semantics(
        button: true,
        label: label,
        child: Material(
          color: dark ? VC.white.withValues(alpha: .12) : VC.white,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: () {
              HapticFeedback.selectionClick();
              onTap();
            },
            child: SizedBox(
              width: size,
              height: size,
              child: Stack(alignment: Alignment.center, children: [
                Icon(icon, size: 22, color: dark ? VC.white : VC.ink),
                if (badge) Positioned(right: 11, top: 10, child: Container(width: 8, height: 8, decoration: BoxDecoration(color: VC.tomato, shape: BoxShape.circle, border: Border.all(color: VC.white, width: 1.5)))),
              ]),
            ),
          ),
        ),
      );
}

/// Three-part progress bar used by step-by-step flows.
class StepBar extends StatelessWidget {
  const StepBar(this.step, this.total, {super.key});
  final int step;
  final int total;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
        child: Row(children: [
          for (var i = 0; i < total; i++) ...[
            if (i > 0) const SizedBox(width: 6),
            Expanded(
              child: TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: i < step ? 1 : 0),
                duration: const Duration(milliseconds: 450),
                curve: Curves.easeOutCubic,
                builder: (_, v, _) => ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(value: v, minHeight: 5, backgroundColor: VC.line, color: VC.leaf),
                ),
              ),
            ),
          ],
        ]),
      );
}

enum BtnKind { primary, lime, soft, white, danger }

class VButton extends StatelessWidget {
  const VButton(this.label, {super.key, this.onTap, this.icon, this.kind = BtnKind.primary, this.compact = false, this.trailingIcon = false});
  final String label;
  final VoidCallback? onTap;
  final IconData? icon;
  final BtnKind kind;
  final bool compact;
  final bool trailingIcon;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (kind) {
      BtnKind.primary => (VC.deep, VC.white),
      BtnKind.lime => (VC.lime, VC.night),
      BtnKind.soft => (VC.mist, VC.deep),
      BtnKind.white => (VC.white, VC.deep),
      BtnKind.danger => (VC.danger, VC.white),
    };
    final ic = icon == null ? null : Icon(icon, size: 20, color: fg);
    return Opacity(
      opacity: onTap == null ? .45 : 1,
      child: Material(
        color: bg,
        borderRadius: BorderRadius.circular(VR.button),
        child: InkWell(
          borderRadius: BorderRadius.circular(VR.button),
          onTap: onTap == null
              ? null
              : () {
                  HapticFeedback.lightImpact();
                  onTap!();
                },
          child: SizedBox(
            height: 56,
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              if (ic != null && !trailingIcon) ...[ic, const SizedBox(width: 10)],
              Flexible(child: Text(context.t(label), style: VT.button.copyWith(color: fg), overflow: TextOverflow.ellipsis)),
              if (ic != null && trailingIcon) ...[const SizedBox(width: 10), ic],
            ]),
          ),
        ),
      ),
    );
  }
}

class VCard extends StatelessWidget {
  const VCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.color = VC.white, this.onTap, this.radius = VR.card, this.border});
  final Widget child;
  final EdgeInsets padding;
  final Color color;
  final VoidCallback? onTap;
  final double radius;
  final Color? border;

  @override
  Widget build(BuildContext context) => Material(
        color: color,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius), side: border == null ? BorderSide.none : BorderSide(color: border!, width: 1.5)),
        clipBehavior: Clip.antiAlias,
        child: InkWell(onTap: onTap, child: Padding(padding: padding, child: child)),
      );
}

enum Tone { success, info, warning, danger, neutral, lime }

(Color, Color) toneColors(Tone t) => switch (t) {
      Tone.success => (VC.successBg, VC.success),
      Tone.info => (VC.infoBg, VC.info),
      Tone.warning => (VC.warningBg, VC.warning),
      Tone.danger => (VC.dangerBg, VC.danger),
      Tone.neutral => (VC.mist, VC.muted),
      Tone.lime => (VC.lime, VC.night),
    };

/// Small status label, e.g. "Waiting", "Sent", "Late".
class Tag extends StatelessWidget {
  const Tag(this.text, this.tone, {super.key});
  final String text;
  final Tone tone;

  static Tone toneFor(String s) => switch (s) {
        'Sent' || 'Collected' || 'Verified' || 'Paid' || 'Accepted' || 'Done' || 'Matches' || 'Found' || 'Ready' || 'On time' => Tone.success,
        'Sending' || 'Waiting' || 'Next' || 'New' || 'Growing' || 'Part' || 'Counter sent' => Tone.info,
        'Reply' || 'Due' || 'Visit due' || 'Not sent' || 'Check' || 'To send' => Tone.warning,
        'Could not send' || 'Failed' || 'Late' => Tone.danger,
        _ => Tone.neutral,
      };

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(tone);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(VR.pill)),
      child: Text(context.t(text), style: VT.small.copyWith(color: fg)),
    );
  }
}

class Initials extends StatelessWidget {
  const Initials(this.text, {super.key, this.size = 42, this.dark = false});
  final String text;
  final double size;
  final bool dark;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(color: dark ? VC.forest : VC.mist, shape: BoxShape.circle),
        child: Text(text, style: VT.small.copyWith(color: dark ? VC.white : VC.deep, fontWeight: FontWeight.w600)),
      );
}

class CropThumb extends StatelessWidget {
  const CropThumb(this.asset, {super.key, this.size = 52, this.radius = 12});
  final String asset;
  final double size;
  final double radius;

  @override
  Widget build(BuildContext context) => ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: Container(color: VC.mist, width: size, height: size, child: Image.asset(asset, fit: BoxFit.cover, cacheWidth: (size * 3).round())),
      );
}

class IconChip extends StatelessWidget {
  const IconChip(this.icon, {super.key, this.size = 44, this.bg = VC.mist, this.fg = VC.deep});
  final IconData icon;
  final double size;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, size: 20, color: fg),
      );
}

/// A row inside a white card: leading, two lines of text, trailing.
class RowTile extends StatelessWidget {
  const RowTile({super.key, this.leading, required this.title, this.subtitle, this.trailing, this.onTap, this.subtitleColor, this.padding = const EdgeInsets.all(14)});
  final Widget? leading;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final Color? subtitleColor;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) => VCard(
        padding: padding,
        onTap: onTap,
        child: Row(children: [
          if (leading != null) ...[leading!, const SizedBox(width: 12)],
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(context.t(title), style: VT.bodyStrong.copyWith(fontSize: 16.5)),
              if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(context.t(subtitle!), style: VT.small.copyWith(color: subtitleColor ?? VC.muted))),
            ]),
          ),
          if (trailing != null) ...[const SizedBox(width: 10), trailing!],
        ]),
      );
}

/// Coloured message strip with an icon.
class Notice extends StatelessWidget {
  const Notice(this.text, {super.key, this.tone = Tone.neutral, this.icon = LucideIcons.info, this.sub, this.dark = false});
  final String text;
  final String? sub;
  final Tone tone;
  final IconData icon;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    var (bg, fg) = toneColors(tone);
    if (tone == Tone.neutral) (bg, fg) = (VC.mist, VC.deep);
    if (dark) (bg, fg) = (VC.night, VC.white);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(VR.card)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.only(top: 1), child: Icon(icon, size: 19, color: fg)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(context.t(text), style: VT.label.copyWith(color: fg, fontWeight: sub != null ? FontWeight.w600 : FontWeight.w500, fontSize: sub != null ? 16 : 14)),
            if (sub != null) Text(context.t(sub!), style: VT.small.copyWith(color: VC.muted)),
          ]),
        ),
      ]),
    );
  }
}

/// Row of rounded filter tabs.
class PillTabs extends StatelessWidget {
  const PillTabs({super.key, required this.items, required this.selected, required this.onSelect, this.compact = false});
  final List<String> items;
  final int selected;
  final ValueChanged<int> onSelect;
  final bool compact;

  @override
  Widget build(BuildContext context) => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        clipBehavior: Clip.none,
        child: Row(children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0) const SizedBox(width: 8),
            Pill(items[i], on: i == selected, onTap: () => onSelect(i), compact: compact),
          ],
        ]),
      );
}

class Pill extends StatelessWidget {
  const Pill(this.text, {super.key, required this.on, required this.onTap, this.check = false, this.compact = false});
  final String text;
  final bool on;
  final bool check;
  final bool compact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(color: on ? VC.deep : VC.white, borderRadius: BorderRadius.circular(VR.pill)),
        child: Material(
          type: MaterialType.transparency,
          child: InkWell(
            borderRadius: BorderRadius.circular(VR.pill),
            onTap: () {
              HapticFeedback.selectionClick();
              onTap();
            },
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: compact ? 12 : 14, vertical: 9),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                if (check && on) ...[const Icon(LucideIcons.check, size: 16, color: VC.white), const SizedBox(width: 6)],
                Text(context.t(text), style: VT.label.copyWith(fontSize: 15, color: on ? VC.white : VC.ink)),
              ]),
            ),
          ),
        ),
      );
}

/// Minus / value / plus control.
class Counter extends StatelessWidget {
  const Counter({super.key, required this.value, required this.onChanged, this.min = 0, this.max = 999, this.suffix = '', this.step = 1});
  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final int step;
  final String suffix;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(color: VC.mist, borderRadius: BorderRadius.circular(VR.pill)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          _b(LucideIcons.minus, false, value - step >= min ? () => onChanged(value - step) : null),
          ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 32),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 160),
              transitionBuilder: (c, a) => ScaleTransition(scale: a, child: c),
              child: Text('$value$suffix', key: ValueKey(value), textAlign: TextAlign.center, style: VT.bodyStrong.copyWith(fontSize: 17)),
            ),
          ),
          _b(LucideIcons.plus, true, value + step <= max ? () => onChanged(value + step) : null),
        ]),
      );

  Widget _b(IconData i, bool solid, VoidCallback? f) => Material(
        color: solid ? VC.deep : VC.white,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: f == null
              ? null
              : () {
                  HapticFeedback.selectionClick();
                  f();
                },
          child: SizedBox(width: 34, height: 34, child: Icon(i, size: 18, color: solid ? VC.white : VC.ink)),
        ),
      );
}

/// Square tick box.
class TickBox extends StatelessWidget {
  const TickBox(this.on, {super.key, this.size = 26});
  final bool on;
  final double size;

  @override
  Widget build(BuildContext context) => AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        width: size,
        height: size,
        decoration: BoxDecoration(color: on ? VC.deep : VC.white, borderRadius: BorderRadius.circular(7), border: Border.all(color: on ? VC.deep : VC.lineStrong, width: 1.5)),
        child: AnimatedScale(scale: on ? 1 : 0, duration: const Duration(milliseconds: 180), curve: Curves.easeOutBack, child: const Icon(LucideIcons.check, size: 17, color: VC.white)),
      );
}

/// A card with a title, a line of help text and a tick box.
class CheckRow extends StatelessWidget {
  const CheckRow({super.key, required this.title, this.sub, required this.on, required this.onTap, this.leading, this.subColor, this.highlight = false});
  final String title;
  final String? sub;
  final bool on;
  final VoidCallback onTap;
  final Widget? leading;
  final Color? subColor;
  final bool highlight;

  @override
  Widget build(BuildContext context) => VCard(
        color: highlight && on ? VC.mist : VC.white,
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        child: Row(children: [
          if (leading != null) ...[leading!, const SizedBox(width: 12)],
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(context.t(title), style: VT.bodyStrong.copyWith(fontSize: 16.5)),
              if (sub != null) Text(context.t(sub!), style: VT.small.copyWith(color: subColor ?? VC.muted)),
            ]),
          ),
          const SizedBox(width: 10),
          TickBox(on),
        ]),
      );
}

/// Label above a group, e.g. "Quality".
class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key, this.big = false});
  final String text;
  final bool big;
  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.only(top: big ? 8 : 4),
        child: Text(context.t(text), style: big ? VT.heading : VT.label.copyWith(color: VC.ink.withValues(alpha: .8))),
      );
}

/// Label / value line inside a summary card.
class KV extends StatelessWidget {
  const KV(this.k, this.v, {super.key, this.strong = false, this.valueColor, this.dark = false});
  final String k;
  final String v;
  final bool strong;
  final Color? valueColor;
  final bool dark;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(context.t(k), style: VT.label.copyWith(color: dark ? VC.white.withValues(alpha: .75) : VC.muted, fontWeight: FontWeight.w400)),
          const SizedBox(width: 12),
          Expanded(child: Text(v, textAlign: TextAlign.right, style: (strong ? VT.bodyStrong : VT.body).copyWith(fontSize: 16.5, color: valueColor ?? (dark ? VC.white : VC.ink), fontWeight: FontWeight.w500))),
        ]),
      );
}

/// Deep green money card.
class MoneyCard extends StatelessWidget {
  const MoneyCard({super.key, required this.label, required this.amount, this.note, this.onTap});
  final String label;
  final String amount;
  final String? note;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => VCard(
        color: VC.deep,
        radius: 20,
        onTap: onTap,
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(context.t(label), style: VT.label.copyWith(color: VC.white.withValues(alpha: .85), fontWeight: FontWeight.w400)),
          const SizedBox(height: 4),
          FittedBox(fit: BoxFit.scaleDown, alignment: Alignment.centerLeft, child: AmountText(amount, style: VT.amount.copyWith(color: VC.white, fontSize: 42))),
          if (note != null) ...[const SizedBox(height: 4), Text(context.t(note!), style: VT.small.copyWith(color: VC.lime))],
        ]),
      );
}

/// Counts up to the amount the first time it appears.
class AmountText extends StatelessWidget {
  const AmountText(this.text, {super.key, required this.style});
  final String text;
  final TextStyle style;

  @override
  Widget build(BuildContext context) {
    final m = RegExp(r'([\d,]+)').firstMatch(text);
    if (m == null) return Text(text, style: style);
    final target = int.parse(m[1]!.replaceAll(',', ''));
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: target * .6, end: target.toDouble()),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeOutCubic,
      builder: (_, v, _) => Text(text.replaceFirst(m[1]!, v.round().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (x) => '${x[1]},')), style: style),
    );
  }
}

/// Small white stat card: big number and a label.
class StatCard extends StatelessWidget {
  const StatCard(this.value, this.label, {super.key, this.color = VC.deep, this.onTap});
  final String value;
  final String label;
  final Color color;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => VCard(
        onTap: onTap,
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          FittedBox(fit: BoxFit.scaleDown, alignment: Alignment.centerLeft, child: Text(value, style: VT.heading.copyWith(fontSize: 21, color: color, fontWeight: FontWeight.w600))),
          const SizedBox(height: 2),
          Text(context.t(label), style: VT.small),
        ]),
      );
}

/// Simple labelled input in the app style.
class Field extends StatelessWidget {
  const Field({super.key, required this.label, this.controller, this.hint, this.icon, this.keyboard, this.trailing, this.focus = false, this.readOnly = false, this.onTap, this.value});
  final String label;
  final TextEditingController? controller;
  final String? hint;
  final IconData? icon;
  final TextInputType? keyboard;
  final Widget? trailing;
  final bool focus;
  final bool readOnly;
  final VoidCallback? onTap;
  final String? value;

  @override
  Widget build(BuildContext context) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(context.t(label), style: VT.label),
        const SizedBox(height: 8),
        Container(
          height: 56,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(color: VC.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: focus ? VC.deep : Colors.transparent, width: 2)),
          child: Row(children: [
            if (icon != null) ...[Icon(icon, size: 20, color: VC.muted), const SizedBox(width: 12)],
            Expanded(
              child: value != null || readOnly
                  ? InkWell(onTap: onTap, child: Align(alignment: Alignment.centerLeft, child: Text(value ?? '', style: VT.body.copyWith(fontSize: 17))))
                  : TextField(
                      controller: controller,
                      keyboardType: keyboard,
                      style: VT.body.copyWith(fontSize: 17),
                      decoration: InputDecoration(border: InputBorder.none, isDense: true, hintText: hint == null ? null : context.t(hint!), hintStyle: VT.body.copyWith(color: VC.muted, fontSize: 17)),
                    ),
            ),
            ?trailing,
          ]),
        ),
      ]);
}

/// Fades and lifts children in, one after another.
class Rise extends StatelessWidget {
  const Rise({super.key, required this.child, this.index = 0});
  final Widget child;
  final int index;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: Duration(milliseconds: 380 + index * 60),
        curve: Curves.easeOutCubic,
        builder: (_, v, c) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, (1 - v) * 14), child: c)),
        child: child,
      );
}

void toast(BuildContext context, String msg) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(context.t(msg)), duration: const Duration(milliseconds: 2200)));
}
