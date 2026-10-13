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

function readName() {
  try { return localStorage.getItem("murb_visitor_name"); } catch { return null; }
}

export async function submitScore(score) {
  if (!score || score <= getLocalBest()) return;

  const visitorId = getVisitorId();
  if (!visitorId) return;

  const { data: existing } = await supabase
    .from("scores")
    .select("score")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (existing && existing.score >= score) {
    setLocalBest(existing.score);
    return;
  }

  const { error } = await supabase.from("scores").upsert({
    visitor_id: visitorId,
    name: readName(),
    avatar_data: readAvatar(),
    score,
    updated_at: new Date().toISOString(),
  }, { onConflict: "visitor_id" });

  if (!error) setLocalBest(score);
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
