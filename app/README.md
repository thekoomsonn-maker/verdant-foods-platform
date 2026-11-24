# Verdant app

The Flutter app for farmers, savings groups (VSLAs) and field officers. It is separate from the website in `../web`.

- Android, iPhone and web from one codebase.
- Works without signal: records are saved on the phone and sent when there is signal.
- Languages: English, Twi (Asante), Akuapem Twi, Fante, Ga, Ewe and French. Dagbani and Gonja are marked "Soon". Any phrase without a translation shows in English.
- Sample data only. Nothing is sent to a server yet (see "Connecting the backend").

## Run it

```bash
flutter pub get
flutter run                 # phone or emulator
flutter run -d chrome       # browser
```

Builds:

```bash
flutter build apk --release --split-per-abi      # Android, files in build/app/outputs/flutter-apk/
flutter build ios --release                      # iPhone, needs a Mac with Xcode and an Apple developer account
flutter build web --release --no-web-resources-cdn
```

The web preview is deployed on Vercel from this folder (`vercel.json`, `tool/vercel_build.sh`). In a wide browser window the app shows inside a phone frame with a side panel for jumping between spaces and switching signal off.

## Layout

```
lib/
  main.dart               app start, theme, router
  router.dart             every screen and its address
  theme/                  colours and text styles (match the app Figma file)
  i18n/                   language list and translation lookup
  data/
    models.dart           harvest, offer, order, member, loan …
    seed.dart             sample records
    app_state.dart        app state, saving on the phone, the send queue
  widgets/                shared parts: buttons, cards, tags, bottom bar
  screens/
    start/                01–05 welcome, phone sign-in, farm set-up
    farm/                 06–20, 37–38 farmer space
    group/                21–29 savings group space
    officer/              30–36, 39–43 field officer space
  preview/                browser-only phone frame
assets/
  i18n/                   translations, English phrase → translated phrase
  images/                 crop and farm photos
  fonts/                  Plus Jakarta Sans
```

Screen numbers match the frames in the Figma file "Client Application — All screens".

## Spaces

| Space | Start | Tabs |
|---|---|---|
| Farmer | `/farm` | Home, Harvests, Orders, Money; "+" logs a harvest or a spray |
| Savings group | `/group` | Home, Members, Loans, Records; "+" starts a meeting |
| Field officer | `/officer` | Today, Farms, Farmers, Sync; "+" opens field tasks |

One phone can hold more than one space. "Switch space" is on the My farm screen.

## Connecting the backend

All data passes through `AppState` (`lib/data/app_state.dart`). To connect the Verdant backend:

1. Replace the lists filled from `Seed` with data loaded from the API, keeping the copy on the phone.
2. Replace `_send` with the real upload, one request per waiting record. Keep the record as waiting when the upload fails.
3. Sign in: `PhoneScreen` and `CodeScreen` should call the SMS code endpoints.

| Data | Used on |
|---|---|
| Harvests, offers, orders, payments | Farmer screens 09–20 |
| Members, loans, meetings | Savings group screens 21–29 |
| Visits, farmers, plots, batches, sync queue | Field officer screens 30–43 |

## Translations

Add or fix a phrase in `assets/i18n/<code>.json`. The key is the English text exactly as it appears in the code. Native speakers should review the Ghanaian language files before launch.
