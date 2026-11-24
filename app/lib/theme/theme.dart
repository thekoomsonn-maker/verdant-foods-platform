import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'tokens.dart';

ThemeData buildTheme() {
  final base = ThemeData(
    useMaterial3: true,
    fontFamily: 'Plus Jakarta Sans',
    colorScheme: ColorScheme.fromSeed(seedColor: VC.deep, primary: VC.deep, surface: VC.paper),
    scaffoldBackgroundColor: VC.paper,
    splashFactory: InkSparkle.splashFactory,
  );
  return base.copyWith(
    textTheme: base.textTheme.apply(bodyColor: VC.ink, displayColor: VC.ink),
    appBarTheme: const AppBarTheme(systemOverlayStyle: SystemUiOverlayStyle.dark),
    pageTransitionsTheme: const PageTransitionsTheme(builders: {
      TargetPlatform.android: FadeForwardsPageTransitionsBuilder(),
      TargetPlatform.iOS: FadeForwardsPageTransitionsBuilder(),
    }),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: VC.night,
      behavior: SnackBarBehavior.floating,
      contentTextStyle: VT.label.copyWith(color: VC.white),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ),
    bottomSheetTheme: const BottomSheetThemeData(backgroundColor: VC.paper, showDragHandle: true),
  );
}
