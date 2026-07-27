type Theme = "dark" | "light";
interface TC { bg: string; node: string; nodeDim: string; conn: string; glow: string; label: string }
const THEMES: Record<Theme, TC> = {
  dark: { bg: "#0a0f1a", node: "#5b9bd5", nodeDim: "#3a7ab8", conn: "#2a5a90", glow: "#4a8fd4", label: "#ffffff" },
  light: { bg: "#f0f4f8", node: "#173E69", nodeDim: "#2a6cb0", conn: "#8aaed4", glow: "#2a5a90", label: "#ffffff" },
};
const LINK = 140, WR = 22, GR = 32, STEP = 4, TICK = 500;
interface DN { x: number; y: number; r: number; ph: number; ps: number }
interface SN { lx: number; ly: number; x: number; y: number; label: string; r: number; guide: boolean; target?: string; pi: number }
const SD: { lx: number; ly: number; label: string; r: number; guide: boolean; target?: string }[] = [
  { lx: 0.03, ly: 0.04, label: "Submit", r: WR, guide: false },
  { lx: 0.03, ly: 0.09, label: "Review", r: WR, guide: false },
  { lx: 0.03, ly: 0.14, label: "Manager Approval", r: WR, guide: false },
  { lx: 0.03, ly: 0.19, label: "Approved", r: WR, guide: false },
  { lx: 0.03, ly: 0.24, label: "Complete", r: WR, guide: false },
  { lx: 0.10, ly: 0.06, label: "Escalate", r: WR, guide: false },
  { lx: 0.92, ly: 0.08, label: "Get Started", r: GR, guide: true, target: "/register" },
  { lx: 0.92, ly: 0.22, label: "Features", r: GR, guide: true, target: "#features" },
  { lx: 0.92, ly: 0.38, label: "How It Works", r: GR, guide: true, target: "#how-it-works" },
];
const PC = [["Submit", "Review", "Manager Approval", "Approved", "Complete"], ["Submit", "Escalate", "Manager Approval"]];
const GS = ["Features", "How It Works"];
class ParticleEngine {
  private cvs: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private dns: DN[] = [];
  private sns: SN[] = [];
  private all: { x: number; y: number }[] = [];
  private adj: number[][] = [];
  private mouse = { x: -9999, y: -9999, on: false };
  private theme: Theme = "dark";
  private raf = 0;
  private running = false;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private rm = false;
  private lt = 0;
  private gp: { path: number[]; p: number; cb?: () => void } | null = null;
  init(canvas: HTMLCanvasElement, theme: Theme) {
    this.cvs = canvas; this.ctx = canvas.getContext("2d")!; this.theme = theme;
    this.dpr = window.devicePixelRatio || 1;
    this.rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize(window.innerWidth, window.innerHeight);
    this.running = true;
    if (!this.rm) this.loop(); else this.draw();
  }
  private buildNodes() {
    const c = Math.max(60, Math.floor((this.w * this.h) / 4000));
    this.dns = [];
    for (let i = 0; i < c; i++) { const r = 2 + Math.random() * 2.5; this.dns.push({ x: Math.random() * this.w, y: Math.random() * this.h, r, ph: Math.random() * Math.PI * 2, ps: 5 * Math.PI * 2 * r }); }
    this.sns = SD.map((d) => ({ ...d, x: d.lx * this.w, y: d.ly * this.h, pi: PC.findIndex((p) => p.includes(d.label)) }));
    this.all = [...this.dns, ...this.sns];
    this.buildAdj();
  }
  private buildAdj() {
    const n = this.all.length;
    this.adj = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (Math.hypot(this.all[i].x - this.all[j].x, this.all[i].y - this.all[j].y) < LINK) { this.adj[i].push(j); this.adj[j].push(i); }
    }
    for (let i = 0; i < n; i++) {
      if (this.adj[i].length >= 4) continue;
      const cands: { j: number; d: number }[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j || this.adj[i].includes(j)) continue;
        cands.push({ j, d: Math.hypot(this.all[i].x - this.all[j].x, this.all[i].y - this.all[j].y) });
      }
      cands.sort((a, b) => a.d - b.d);
      for (const c of cands) { if (this.adj[i].length >= 4) break; this.adj[i].push(c.j); this.adj[c.j].push(i); }
    }
  }
  resize(w: number, h: number) {
    this.w = w; this.h = h;
    if (this.cvs && this.ctx) {
      this.cvs.width = w * this.dpr; this.cvs.height = h * this.dpr;
      this.cvs.style.width = `${w}px`; this.cvs.style.height = `${h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    this.buildNodes();
  }
  setMouse(x: number, y: number) { this.mouse = { x, y, on: true }; }
  clearMouse() { this.mouse = { x: -9999, y: -9999, on: false }; }
  handleClick(mx: number, my: number) {
    for (const s of this.sns) {
      if (Math.hypot(mx - s.x, my - s.y) < s.r + 12) {
        if (s.guide && s.target) {
          const navigate = () => {
            if (s.target!.startsWith("/")) window.location.href = s.target!;
            else document.querySelector(s.target!)?.scrollIntoView({ behavior: "smooth" });
          };
          const gi = GS.indexOf(s.label);
          if (gi >= 0 && gi < GS.length - 1) { const nxt = this.sns.find((n) => n.label === GS[gi + 1]); if (nxt) this.startGlow(s, nxt, navigate); }
          else navigate();
          return;
        }
        const proc = PC[s.pi]; if (!proc) return;
        const idx = proc.indexOf(s.label); if (idx < 0 || idx >= proc.length - 1) return;
        const nxt = this.sns.find((n) => n.label === proc[idx + 1]); if (nxt) this.startGlow(s, nxt);
        return;
      }
    }
  }
  private startGlow(from: SN, to: SN, cb?: () => void) { const p = this.bfs(from, to); if (p) this.gp = { path: p, p: 0, cb }; }
  private bfs(from: { x: number; y: number }, to: { x: number; y: number }): number[] | null {
    const si = this.all.indexOf(from), ti = this.all.indexOf(to); if (si < 0 || ti < 0) return null;
    const vis = new Set<number>([si]); const q: [number, number[]][] = [[si, [si]]];
    while (q.length) { const [c, path] = q.shift()!; if (c === ti) return path; for (const n of this.adj[c]) if (!vis.has(n)) { vis.add(n); q.push([n, [...path, n]]); } }
    return null;
  }
  setTheme(theme: Theme) { this.theme = theme; if (!this.running) this.draw(); }
  private loop = () => {
    if (!this.running) return;
    const now = performance.now();
    if (now - this.lt >= TICK) { this.repulse(); this.lt = now; }
    if (this.gp) { this.gp.p += 0.02; if (this.gp.p >= 1) { this.gp.cb?.(); this.gp = null; } }
    for (const d of this.dns) d.ph += 0.018;
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };
  private repulse() {
    for (const d of this.dns) {
      let fx = 0, fy = 0;
      for (const o of this.all) {
        if (o === d) continue;
        const dx = d.x - o.x, dy = d.y - o.y, dist = Math.hypot(dx, dy);
        if (dist < d.ps && dist > 0.1) { const f = (d.ps - dist) / d.ps; fx += (dx / dist) * f; fy += (dy / dist) * f; }
      }
      if (fx !== 0 || fy !== 0) { const m = Math.hypot(fx, fy); d.x += (fx / m) * STEP; d.y += (fy / m) * STEP; d.x = Math.max(d.r, Math.min(this.w - d.r, d.x)); d.y = Math.max(d.r, Math.min(this.h - d.r, d.y)); }
    }
    this.all = [...this.dns, ...this.sns]; this.buildAdj();
  }
  private draw() {
    if (!this.ctx) return;
    const ctx = this.ctx, tc = THEMES[this.theme];
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.fillStyle = tc.bg; ctx.fillRect(0, 0, this.w, this.h);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < this.all.length; i++) for (let j = i + 1; j < this.all.length; j++) {
      const d = Math.hypot(this.all[i].x - this.all[j].x, this.all[i].y - this.all[j].y);
      if (d < LINK) { ctx.globalAlpha = (1 - d / LINK) * 0.5; ctx.strokeStyle = tc.conn; ctx.beginPath(); ctx.moveTo(this.all[i].x, this.all[i].y); ctx.lineTo(this.all[j].x, this.all[j].y); ctx.stroke(); }
    }
    if (this.mouse.on) for (const nd of this.all) {
      const d = Math.hypot(nd.x - this.mouse.x, nd.y - this.mouse.y);
      if (d < LINK * 1.5) { ctx.globalAlpha = (1 - d / (LINK * 1.5)) * 0.3; ctx.strokeStyle = tc.glow; ctx.shadowColor = tc.glow; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(nd.x, nd.y); ctx.lineTo(this.mouse.x, this.mouse.y); ctx.stroke(); ctx.shadowBlur = 0; }
    }
    if (this.gp && this.gp.path.length > 1) {
      const path = this.gp.path, cur = this.gp.p * (path.length - 1), ei = Math.min(Math.floor(cur), path.length - 2), ep = cur - ei;
      const getP = (i: number) => this.all[path[i]];
      ctx.globalAlpha = 0.85; ctx.strokeStyle = tc.glow; ctx.shadowColor = tc.glow; ctx.shadowBlur = 16; ctx.lineWidth = 3;
      for (let k = 0; k <= ei; k++) { const a = getP(k), b = getP(k + 1); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      const a = getP(ei), b = getP(ei + 1), hx = a.x + (b.x - a.x) * ep, hy = a.y + (b.y - a.y) * ep;
      ctx.shadowBlur = 0; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1;
    }
    for (const d of this.dns) { ctx.globalAlpha = 0.4 + Math.sin(d.ph) * 0.2; ctx.fillStyle = tc.nodeDim; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
    for (const s of this.sns) this.drawSN(ctx, s, tc);
    ctx.globalAlpha = 1;
  }
  private drawSN(ctx: CanvasRenderingContext2D, s: SN, tc: TC) {
    const hov = this.mouse.on && Math.hypot(s.x - this.mouse.x, s.y - this.mouse.y) < s.r + 20;
    const p = Math.sin(Date.now() * 0.002) * 0.5 + 0.5;
    ctx.globalAlpha = (0.12 + p * 0.1) * (hov ? 3 : 1.5); ctx.fillStyle = tc.glow;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 16, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.shadowColor = tc.glow; ctx.shadowBlur = hov ? 22 : 10;
    ctx.fillStyle = tc.node; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.95;
    ctx.font = `700 ${s.guide ? 12 : 11}px "Outfit", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(s.label, s.x, s.y);
    ctx.globalAlpha = 1; ctx.fillStyle = tc.label; ctx.font = `600 ${s.guide ? 13 : 11}px "Outfit", system-ui, sans-serif`;
    ctx.fillText(s.label, s.x, s.y + s.r + 16);
    if (hov && !s.guide) { const cy = s.y - s.r - 14; ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(s.x, cy, 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(s.x - 3, cy); ctx.lineTo(s.x - 1, cy + 2); ctx.lineTo(s.x + 4, cy - 2); ctx.stroke(); }
    if (s.guide && hov) { ctx.fillStyle = tc.label; ctx.globalAlpha = 0.7; ctx.font = '500 11px "Outfit", system-ui, sans-serif'; ctx.fillText(s.target?.startsWith("/") ? "Sign up now" : "Click to explore", s.x, s.y + s.r + 32); }
    ctx.globalAlpha = 1;
  }
  destroy() { this.running = false; cancelAnimationFrame(this.raf); this.cvs = null; this.ctx = null; }
}
export { ParticleEngine, type Theme };
