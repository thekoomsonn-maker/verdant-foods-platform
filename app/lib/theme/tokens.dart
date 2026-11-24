import 'package:material_ui/material_ui.dart';

/// Verdant colours, matching the "Verdant / Color" variables in the app Figma file.
abstract final class VC {
  static const night = Color(0xFF01261F);
  static const deep = Color(0xFF024639);
  static const forest = Color(0xFF0B5B49);
  static const leaf = Color(0xFF5F9F0D);
  static const leafLight = Color(0xFF8CC63F);
  static const mint = Color(0xFFE4EFE8);
  static const mist = Color(0xFFF2F7F4);
  static const white = Color(0xFFFFFFFF);
  static const paper = Color(0xFFF7F8F7);
  static const line = Color(0xFFE2E8E4);
  static const lineStrong = Color(0xFFC9D3CE);
  static const muted = Color(0xFF5A6A63);
  static const ink = Color(0xFF0F1F1A);
  static const lime = Color(0xFFBBEA70);
  static const orange = Color(0xFFFF7006);
  static const tomato = Color(0xFFE5412B);
  static const sun = Color(0xFFF7C33C);

  static const success = Color(0xFF1E7B4F);
  static const successBg = Color(0xFFE3F2E9);
  static const warning = Color(0xFF8A5300);
  static const warningBg = Color(0xFFFFF0D4);
  static const danger = Color(0xFFB42318);
  static const dangerBg = Color(0xFFFDE8E5);
  static const info = Color(0xFF1D5FA8);
  static const infoBg = Color(0xFFE4EEFA);
}

/// Type scale from the "App/…" text styles.
abstract final class VT {
  static const _f = 'Plus Jakarta Sans';
  static const display = TextStyle(fontFamily: _f, fontSize: 56, height: 60 / 56, fontWeight: FontWeight.w500, letterSpacing: -1.6, color: VC.ink);
  static const amount = TextStyle(fontFamily: _f, fontSize: 40, height: 46 / 40, fontWeight: FontWeight.w600, letterSpacing: -0.8, color: VC.ink);
  static const title = TextStyle(fontFamily: _f, fontSize: 26, height: 32 / 26, fontWeight: FontWeight.w600, letterSpacing: -0.4, color: VC.ink);
  static const heading = TextStyle(fontFamily: _f, fontSize: 20, height: 26 / 20, fontWeight: FontWeight.w600, letterSpacing: -0.2, color: VC.ink);
  static const body = TextStyle(fontFamily: _f, fontSize: 16, height: 24 / 16, fontWeight: FontWeight.w400, color: VC.ink);
  static const bodyStrong = TextStyle(fontFamily: _f, fontSize: 16, height: 24 / 16, fontWeight: FontWeight.w600, color: VC.ink);
  static const label = TextStyle(fontFamily: _f, fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w500, color: VC.ink);
  static const small = TextStyle(fontFamily: _f, fontSize: 13, height: 18 / 13, fontWeight: FontWeight.w500, color: VC.muted);
  static const button = TextStyle(fontFamily: _f, fontSize: 17, height: 22 / 17, fontWeight: FontWeight.w600);
}

abstract final class VR {
  static const card = 16.0;
  static const button = 16.0;
  static const pill = 999.0;
}

/// Ghana cedi amounts: "GH₵ 2,480".
String cedi(num v, {bool decimals = false}) {
  final s = decimals ? v.toStringAsFixed(2) : v.round().toString();
  final parts = s.split('.');
  final whole = parts.first.replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},');
  return 'GH₵ $whole${parts.length > 1 ? '.${parts[1]}' : ''}';
}

String kg(num v) => '${v.round().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')} kg';
