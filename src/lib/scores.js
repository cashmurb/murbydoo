import { supabase } from "./supabase.js";

const ID_KEY = "murb_visitor_id";
const BEST_KEY = "murb_best_score";

// One id per browser, so every visitor keeps the same score row across visits
export function getVisitorId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// Best score kept locally too, so the HI number shows up without waiting
export function getLocalBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setLocalBest(score) {
  try { localStorage.setItem(BEST_KEY, String(score)); } catch { /* ignore */ }
}

// The avatar the visitor built, used as the runner in the game
export function readAvatar() {
  try {
    const raw = localStorage.getItem("murb_avatar");
    return raw ? JSON.parse(raw).selection : null;
  } catch {
    return null;
  }
}

// The character's own name wins. The terminal name is the fallback for
// anyone who never named their avatar.
export function readName() {
  try {
    const raw = localStorage.getItem("murb_avatar");
    const avatarName = raw ? JSON.parse(raw).name : null;
    if (avatarName) return avatarName;
    return localStorage.getItem("murb_visitor_name");
  } catch {
    return null;
  }
}

// Called when an avatar is saved, with the name the visitor gave it.
// The terminal greets them by the same name, and each named character gets
// its own score row, so renaming starts a fresh one rather than relabelling
// the old. The first character to be named keeps the score already there.
export function saveCharacterName(name) {
  try {
    // The name the current score row is filed under. This has to be the same
    // lookup the scoreboard uses, because the name may have come from the
    // terminal rather than from a previous avatar.
    const previous = readName();

    if (name) localStorage.setItem("murb_visitor_name", name);

    if (!previous) return;
    if (previous === (name || "")) return;

    localStorage.setItem(ID_KEY, crypto.randomUUID());
    localStorage.removeItem(BEST_KEY);
  } catch { /* ignore */ }
}

// Runs after every game over. The score only ever goes up, but the name and
// the face are rewritten each time, so a row left under an old name puts
// itself right on the next run instead of staying wrong until someone
// beats their best.
export async function submitScore(score) {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  const { data: existing } = await supabase
    .from("scores")
    .select("score")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  const best = Math.max(score || 0, existing?.score || 0, getLocalBest());

  const { error } = await supabase.from("scores").upsert({
    visitor_id: visitorId,
    name: readName(),
    avatar_data: readAvatar(),
    score: best,
    updated_at: new Date().toISOString(),
  }, { onConflict: "visitor_id" });

  if (!error) setLocalBest(best);
}

// Top ten of all time for the scoreboard on the game page
export async function fetchTopScores(limit = 10) {
  const { data } = await supabase
    .from("scores")
    .select("visitor_id, name, avatar_data, score")
    .order("score", { ascending: false })
    .limit(limit);
  return data || [];
}

// Every visitor's best score, keyed by visitor id, for the guestbook cards
export async function fetchScoreMap() {
  const { data } = await supabase.from("scores").select("visitor_id, score");
  const map = {};
  (data || []).forEach(row => { map[row.visitor_id] = row.score; });
  return map;
}
