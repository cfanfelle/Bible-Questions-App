# Bible Questions App — V1

An offline-first Electron desktop application for Bible reading, quizzes, practice, daily questions, local profiles, XP, streaks, medals, and highlights.

## Download

Download the newest Windows (`.exe`) or macOS (`.dmg`) installer from [GitHub Releases](https://github.com/cfanfelle/Bible-Questions-App/releases/latest). Installed copies check for updates automatically and preserve all local profiles and progress.

## Architecture

- `content/content.sqlite` — replaceable, shipped content (BSB, WEB, and KJV text; books; questions; animal definitions; independent bank version).
- Electron `userData/selah-user.sqlite` — private profiles and progress, outside the install directory and preserved across upgrades.
- `electron/` — trusted main process, migrations, domain rules, and persistence.
- `src/` — sandboxed React interface communicating through a narrow preload bridge.
- `shared/` — IPC data contracts.

The installer bundles the complete 66-book World English Bible (31,103 verses) for offline reading. The initial question bank contains three clearly identified sample questions and is ready for a growing real question bank without schema changes.

## Develop

```powershell
npm.cmd install
npm.cmd run dev
```

## Verify and package

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run dist
```

The Windows NSIS configuration creates an installable desktop application. User data is never packaged into—or written within—the application install directory.

## Content policy

The bundled BSB and WEB texts are public domain. The KJV is public domain outside the United Kingdom, where Crown letters patent apply. Do not edit a translation's verse text while presenting it under that translation's name. See `content/LICENSES.md` for sources and terms. Content releases should replace only `content.sqlite`; question IDs are permanent and must never be reused.
