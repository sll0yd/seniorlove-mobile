# Senior Love — iOS app 💘

The mobile version of Senior Love, built with **Expo (SDK 57) + React Native + TypeScript + Expo Router**.
SDK 57 is the version supported by the Expo Go app on the App Store, so you can test on your own iPhone by scanning a QR code.
It talks to the existing `seniorlove-back` API, the same way `seniorlove-front` does.

## What's inside

| Tab / screen | What it does | API used |
|---|---|---|
| Connexion / Inscription | Log in, create an account | `POST /login`, `POST /signup` |
| Événements | List of events, pull to refresh | `GET /events` |
| Event detail | Details, organiser, attendees, **Je participe / Je ne participe plus** | `GET /events/:id`, `POST`/`DELETE /me/events/join/:id` |
| Nouvel événement | Propose an event | `POST /me/events` |
| Membres | All members, search by name, city or interest | `GET /users` |
| Member profile | Bio, interests, **Écrire à …** | `GET /users/:id` |
| Messages | Your conversations | `GET /me/contacts` |
| Conversation | Chat; checks for new messages every 5 s | `GET`/`POST /me/messages/:id` |
| Mon profil | Edit name, age, city, bio; pick interests; log out | `GET`/`PATCH /me`, `POST`/`DELETE /me/tags/:id` |

The login token is stored in the iPhone keychain (`expo-secure-store`), so you stay logged in between launches (the back end's token lasts 3 hours, after which you're sent back to the login screen).

## Project layout

```
src/
  app/                  ← every file here is a screen (Expo Router)
    _layout.tsx         ← root: logged-in vs logged-out screens
    (auth)/login.tsx, register.tsx
    (tabs)/_layout.tsx  ← the bottom tab bar
    (tabs)/index.tsx, members.tsx, messages.tsx, profile.tsx
    events/[id].tsx, events/new.tsx
    members/[id].tsx
    chat/[id].tsx
  api/client.ts         ← all calls to the back end (like utils/axios.ts in the web app)
  api/types.ts          ← shapes of the API data
  auth/AuthContext.tsx  ← who is logged in (like UserContext in the web app)
  components/ui.tsx     ← buttons, inputs, avatars, tag chips…
  config.ts             ← back-end URL
  theme.ts              ← colours & font sizes (large, for seniors)
```

## Run it in the iOS Simulator (on your Mac)

You need: **Node 20+**, **Xcode** (with an iOS Simulator installed: Xcode → Settings → Components), and **PostgreSQL**.

### 1. Start the back end

```bash
cd seniorlove-back
npm install
cp .env.example .env    # then edit it, see below
npm run db:reset        # creates the tables + sample data
npm run dev             # → http://localhost:3000
```

`.env` example:

```
PORT=3000
PG_URL=postgres://seniorlove:seniorlove@localhost:5432/seniorlove
JWT_SECRET=any_long_random_string
BASE_URL=http://localhost:3000
SESSION_SECRET=another_random_string
```

### 2. Start the app

```bash
cd seniorlove-mobile
npm install
npx expo start
```

When the QR code appears, press **`i`**. Expo opens the iOS Simulator, installs Expo Go and loads the app.
Edit any file in `src/` and the simulator updates instantly.

### 3. Log in

The seeded members have placeholder passwords, so **create an account** from the app's first screen
(password: 8 characters minimum). You'll then see the seeded events, members and photos.

## Testing on a real iPhone (optional)

1. Install **Expo Go** from the App Store (it supports Expo SDK 57, which this project uses).
2. Phone and Mac on the same Wi-Fi.
3. Create `seniorlove-mobile/.env` with your Mac's local IP (System Settings → Wi-Fi → Details):
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
   ```
4. `npx expo start`, then scan the QR code with the iPhone camera.

## Useful commands

```bash
npx tsc --noEmit        # typecheck
npx expo start --clear  # restart with a clean cache if something looks stale
npx expo start --web    # quick preview in the browser
```
