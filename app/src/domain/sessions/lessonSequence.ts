import type { LessonSession } from "./types";

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function assertLessonDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError("Das Stundendatum muss YYYY-MM-DD sein.");
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new RangeError("Ungültiges Stundendatum.");
  }
}

export function assertLessonSequence(sequence: number): void {
  if (sequence !== 1 && sequence !== 2) {
    throw new RangeError("Die Stundennummer muss 1 oder 2 sein.");
  }
}

export function assertUniqueLessonSlots(
  sessions: readonly LessonSession[],
): void {
  const ids = new Set<string>();
  const slots = new Set<string>();
  const byDate = new Map<string, number[]>();
  for (const session of sessions) {
    if (!session.id.trim()) {
      throw new RangeError("Eine Stunde benötigt eine stabile ID.");
    }
    assertLessonDate(session.date);
    assertLessonSequence(session.lessonSequence);
    if (ids.has(session.id)) {
      throw new RangeError(`Doppelte Sitzungs-ID: ${session.id}`);
    }
    ids.add(session.id);
    const slot = `${session.date}#${session.lessonSequence}`;
    if (slots.has(slot)) {
      throw new RangeError(
        `Doppelte Stunde: ${session.date}, Nr. ${session.lessonSequence}`,
      );
    }
    slots.add(slot);
    const sequences = byDate.get(session.date) ?? [];
    sequences.push(session.lessonSequence);
    byDate.set(session.date, sequences);
  }
  for (const [date, sequences] of byDate) {
    if (sequences.length > 2) {
      throw new RangeError(
        `Für ${date} sind höchstens zwei Unterrichtsstunden möglich.`,
      );
    }
    if (sequences.length === 1 && sequences[0] !== 1) {
      throw new RangeError(
        `Die einzige Stunde am ${date} muss intern Nummer 1 haben.`,
      );
    }
  }
}

export function compareLessonSessions(
  left: LessonSession,
  right: LessonSession,
): number {
  return (
    compareText(left.date, right.date) ||
    (left.lessonSequence < right.lessonSequence
      ? -1
      : left.lessonSequence > right.lessonSequence
        ? 1
        : 0) ||
    compareText(left.id, right.id)
  );
}

export function nextLessonSequence(
  sessions: readonly LessonSession[],
  date: string,
): number {
  assertLessonDate(date);
  assertUniqueLessonSlots(sessions);
  const count = sessions.filter((session) => session.date === date).length;
  if (count === 2) {
    throw new RangeError(
      `Für ${date} sind höchstens zwei Unterrichtsstunden möglich.`,
    );
  }
  return count === 0 ? 1 : 2;
}

export function hasVisibleLessonSequence(
  sessions: readonly LessonSession[],
  date: string,
): boolean {
  assertLessonDate(date);
  assertUniqueLessonSlots(sessions);
  return sessions.filter((session) => session.date === date).length === 2;
}

export function createLessonSession(
  sessions: readonly LessonSession[],
  newSession: Omit<LessonSession, "lessonSequence">,
): LessonSession {
  const lessonSequence = nextLessonSequence(sessions, newSession.date);
  const result = { ...newSession, lessonSequence };
  assertUniqueLessonSlots([...sessions, result]);
  return result;
}

export function swapLessonSequences(
  sessions: readonly LessonSession[],
  date: string,
): readonly LessonSession[] {
  assertLessonDate(date);
  assertUniqueLessonSlots(sessions);
  if (sessions.filter((session) => session.date === date).length !== 2) {
    throw new RangeError(
      `Am ${date} müssen zwei Stunden zum Vertauschen vorhanden sein.`,
    );
  }
  const swapped = sessions.map((session) =>
    session.date === date
      ? { ...session, lessonSequence: session.lessonSequence === 1 ? 2 : 1 }
      : session,
  );
  assertUniqueLessonSlots(swapped);
  return swapped;
}

export function removeLessonSession(
  sessions: readonly LessonSession[],
  sessionId: string,
): readonly LessonSession[] {
  assertUniqueLessonSlots(sessions);
  const removed = sessions.find((session) => session.id === sessionId);
  if (!removed) {
    throw new RangeError(`Unbekannte Sitzungs-ID: ${sessionId}`);
  }
  const remaining = sessions
    .filter((session) => session.id !== sessionId)
    .map((session) =>
      session.date === removed.date
        ? { ...session, lessonSequence: 1 }
        : session,
    );
  assertUniqueLessonSlots(remaining);
  return remaining;
}
