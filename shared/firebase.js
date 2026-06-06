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

/**
 * Re-export all Firebase database functions used across pages.
 * Import what you need: import { db, ref, onValue } from './shared/firebase.js';
 */
export { ref, set, get, onValue, remove, push, update, serverTimestamp };
