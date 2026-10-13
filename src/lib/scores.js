import { supabase } from "./supabase.js";

const ID_KEY = "murb_visitor_id";
const BEST_KEY = "murb_best_score";

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

export function getLocalBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setLocalBest(score) {
  try { localStorage.setItem(BEST_KEY, String(score)); } catch { void 0; }
}

export function readAvatar() {
  try {
    const raw = localStorage.getItem("murb_avatar");
    return raw ? JSON.parse(raw).selection : null;
  } catch {
    return null;
  }
}

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

export function saveCharacterName(name) {
  try {
    const previous = readName();

    if (name) localStorage.setItem("murb_visitor_name", name);

    if (!previous) return;
    if (previous === (name || "")) return;

    localStorage.setItem(ID_KEY, crypto.randomUUID());
    localStorage.removeItem(BEST_KEY);
  } catch { void 0; }
}
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

export async function fetchTopScores(limit = 10) {
  const { data } = await supabase
    .from("scores")
    .select("visitor_id, name, avatar_data, score")
    .order("score", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function fetchScoreMap() {
  const { data } = await supabase.from("scores").select("visitor_id, score");
  const map = {};
  (data || []).forEach(row => { map[row.visitor_id] = row.score; });
  return map;
}
