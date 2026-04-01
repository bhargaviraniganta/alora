import { db } from "@/services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  collection,
  getCountFromServer,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

export interface AnalyticsSnapshot {
  totalPredictions: number;
  compatible: number;
  partiallyCompatible: number;
  incompatible: number;
  totalVisitors: number;
}

const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  totalPredictions: 0,
  compatible: 0,
  partiallyCompatible: 0,
  incompatible: 0,
  totalVisitors: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// VISITOR TRACKING
// Call this once on first sign-up (e.g. in your auth handler after createUser)
// ─────────────────────────────────────────────────────────────────────────────

export const registerVisitor = async (uid: string, email?: string) => {
  if (!uid) return;

  const visitorRef = doc(db, "visitors", uid);
  const globalRef = doc(db, "analytics", "global");

  await runTransaction(db, async (transaction) => {
    const visitorSnap = await transaction.get(visitorRef);

    if (visitorSnap.exists()) {
      return;
    }

    transaction.set(visitorRef, {
      uid,
      email: email ?? null,
      firstSeen: serverTimestamp(),
    });
    transaction.set(globalRef, { totalVisitors: increment(1) }, { merge: true });
  });
};

export async function getVisitorCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, "visitors"));
  return snap.data().count;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTION ANALYTICS
// Call this from your prediction tool page after a successful prediction.
//
// final_label comes directly from prediction.py and is one of:
//   "compatible" | "partially_compatible" | "incompatible"
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAnalytics(result: {
  final_label: string;  // "compatible" | "partially_compatible" | "incompatible"
}) {
  const globalRef = doc(db, "analytics", "global");

  const updates: Record<string, unknown> = {
    totalPredictions: increment(1),
  };

  if (result.final_label === "compatible") {
    updates.compatible = increment(1);
  } else if (result.final_label === "partially_compatible") {
    updates.partiallyCompatible = increment(1);
  } else {
    // "incompatible"
    updates.incompatible = increment(1);
  }

  await setDoc(globalRef, updates, { merge: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH ALL ANALYTICS FOR THE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAnalytics() {
  const snap = await getDoc(doc(db, "analytics", "global"));

  if (!snap.exists()) {
    return EMPTY_ANALYTICS;
  }

  const d = snap.data();
  return {
    totalPredictions:    d.totalPredictions    ?? 0,
    compatible:          d.compatible          ?? 0,
    partiallyCompatible: d.partiallyCompatible ?? 0,
    incompatible:        d.incompatible        ?? 0,
    totalVisitors:       d.totalVisitors       ?? 0,
  };
}

export function subscribeToAnalytics(
  onChange: (data: AnalyticsSnapshot) => void
) {
  return onSnapshot(doc(db, "analytics", "global"), (snap) => {
    if (!snap.exists()) {
      onChange(EMPTY_ANALYTICS);
      return;
    }

    const d = snap.data();
    onChange({
      totalPredictions: d.totalPredictions ?? 0,
      compatible: d.compatible ?? 0,
      partiallyCompatible: d.partiallyCompatible ?? 0,
      incompatible: d.incompatible ?? 0,
      totalVisitors: d.totalVisitors ?? 0,
    });
  });
}
