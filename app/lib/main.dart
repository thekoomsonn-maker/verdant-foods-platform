import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'data/app_state.dart';
import 'preview/preview_frame.dart';
import 'router.dart';
import 'theme/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kIsWeb) await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  final state = await AppState.load();
  runApp(VerdantApp(state: state));
}

class VerdantApp extends StatefulWidget {
  const VerdantApp({super.key, required this.state});
  final AppState state;
  @override
  State<VerdantApp> createState() => _VerdantAppState();
}

class _VerdantAppState extends State<VerdantApp> {
  late final GoRouter router = buildRouter(widget.state);

  @override
  Widget build(BuildContext context) => AppScope(
        state: widget.state,
        child: MaterialApp.router(
          title: 'Verdant',
          debugShowCheckedModeBanner: false,
          theme: buildTheme(),
          routerConfig: router,
          builder: (context, child) => kIsWeb ? PreviewFrame(router: router, child: child!) : child!,
        ),
      );
}
