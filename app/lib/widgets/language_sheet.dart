import 'package:material_ui/material_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../data/app_state.dart';
import '../i18n/i18n.dart';
import '../theme/tokens.dart';
import 'ui.dart';

void showLanguageSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    builder: (c) {
      final s = AppScope.of(c);
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text(c.t('Language'), style: VT.heading),
            const SizedBox(height: 12),
            for (final l in Lang.all)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: VCard(
                  color: s.lang == l.code ? VC.mint : VC.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                  onTap: l.soon
                      ? () => toast(context, 'Coming soon. You can use English for now.')
                      : () {
                          s.setLang(l.code);
                          Navigator.pop(c);
                        },
                  child: Row(children: [
                    Expanded(child: Text(l.name, style: VT.bodyStrong.copyWith(fontWeight: s.lang == l.code ? FontWeight.w600 : FontWeight.w500))),
                    if (s.lang == l.code) const Icon(LucideIcons.check, color: VC.leaf, size: 20),
                    if (l.soon) Tag('Soon', Tone.neutral),
                  ]),
                ),
              ),
          ]),
        ),
      );
    },
  );
}

/// One phone can hold a farmer, a savings group record keeper and a field officer account.
void showSpaceSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    builder: (c) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(c.t('Switch space'), style: VT.heading),
          const SizedBox(height: 12),
          for (final (icon, title, sub, path) in [
            (LucideIcons.sprout, 'My farm', 'Agyeman Farms', '/farm'),
            (LucideIcons.users, 'Savings group', 'Nkwanta Women VSLA · record keeper', '/group'),
            (LucideIcons.clipboardCheck, 'Field officer', 'Yaw Darko · Techiman North', '/officer'),
          ])
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: RowTile(
                leading: IconChip(icon, size: 42),
                title: title,
                subtitle: sub,
                trailing: const Icon(LucideIcons.chevronRight, size: 20, color: VC.muted),
                onTap: () {
                  Navigator.pop(c);
                  context.go(path);
                },
              ),
            ),
        ]),
      ),
    ),
  );
}
