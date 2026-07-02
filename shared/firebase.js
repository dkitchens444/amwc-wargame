/* =============================================================
   AMWC WARGAME SYSTEM — Shared Firebase Module
   shared/firebase.js

   Single source of truth for Firebase initialization.
   Import db and any Firebase functions from this file instead
   of re-initializing in each page.

   Used by: director.html, dashboard.html, feedback.html
   Not used by: index.html (no Firebase), doc-tool-teams.html (no Firebase)

   IMPORTANT — API KEY NOTE:
   feedback.html previously used a different apiKey pointing to
   a second registered web app in the same Firebase project
   (different messagingSenderId / appId). Both keys access the
   same Realtime Database. This file uses the primary key shared
   by director.html and dashboard.html. If feedback submissions
   stop working after this change, the fix is to verify whether
   the feedback app registration requires its own key — if so,
   create a separate shared/firebase-feedback.js with that config.
   ============================================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  remove,
  push,
  update,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBdKRyZWpmr0YgZhrwI97WSH5ZG0ER_bAg",
  authDomain:        "amwc-wargame.firebaseapp.com",
  databaseURL:       "https://amwc-wargame-default-rtdb.firebaseio.com",
  projectId:         "amwc-wargame",
  storageBucket:     "amwc-wargame.firebasestorage.app",
  messagingSenderId: "1044419739959",
  appId:             "1:1044419739959:web:486d7dbc673b5cb5ebdab2"
};

const fbApp = initializeApp(firebaseConfig);

/** Initialized Realtime Database instance. */
export const db = getDatabase(fbApp);

/** Auth instance — pages can import if they need the current user. */
export const auth = getAuth(fbApp);

/**
 * Sign in anonymously on load. This satisfies the Firebase rule
 * `auth != null` without requiring any user-facing login flow.
 * The token is scoped to this session and contains no PII.
 */
signInAnonymously(auth).catch(err => {
  console.warn('[AMWC] Anonymous auth failed:', err.code);
});

/**
 * Self-claims this browser's Firebase UID for a specific game, once.
 *
 * Security model (added in the security-hardening pass, July 2026):
 * database.rules.json grants read/write on games/{gameId} only to UIDs that
 * have a gameRoles/{gameId}/{uid} entry. This function is what creates that
 * entry — a director/blue/red opening a game's real link, or the dashboard
 * discovering a game, calls this once and is then recognized for that game.
 * The write is enforced write-once by the rules (!data.exists()), so
 * re-claiming an already-claimed game is a harmless no-op.
 *
 * Deliberately does NOT distinguish director/blue/red for access purposes —
 * all three get equal read/write on their game once claimed. Per-game
 * scoping (you need that game's link to get in at all) was the actual goal;
 * separating roles from each other was explicitly out of scope.
 *
 * Waits for anonymous auth to resolve if it hasn't yet (auth.currentUser
 * can be null for a moment right after page load).
 */
export async function claimGameRole(gameId, role) {
  if (!gameId) return null;
  const user = auth.currentUser || await new Promise(resolve => {
    const unsub = onAuthStateChanged(auth, u => { if (u) { unsub(); resolve(u); } });
  });
  const claimRef = ref(db, `gameRoles/${gameId}/${user.uid}`);
  try {
    const existing = await get(claimRef);
    if (!existing.exists()) {
      await set(claimRef, { role, claimedAt: serverTimestamp() });
    }
  } catch (err) {
    console.warn('[AMWC] claimGameRole failed:', gameId, err.code || err.message);
    throw err; // let the caller decide how to surface this
  }
  return user.uid;
}

/**
 * Re-export all Firebase database functions used across pages.
 * Import what you need: import { db, ref, onValue } from './shared/firebase.js';
 */
export { ref, set, get, onValue, remove, push, update, serverTimestamp,
         onAuthStateChanged };
