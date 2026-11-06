// Welds the original chunks by exact position and lists the bone shells near the hips.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
export function originalShells(src) {
  const g = JSON.parse(readFileSync(src, "utf8")), bin = readFileSync(join(dirname(src), g.buffers[0].uri));
  const view = (i, T, k) => { const a = g.accessors[i], bv = g.bufferViews[a.bufferView]; return new T(bin.buffer, bin.byteOffset + (bv.byteOffset || 0) + (a.byteOffset || 0), a.count * k); };
  const prims = g.meshes.flatMap((m) => m.primitives);
  let V = 0, I = 0; for (const p of prims) { V += g.accessors[p.attributes.POSITION].count; I += g.accessors[p.indices].count; }
  const pos = new Float32Array(V * 3), idx = new Uint32Array(I); let vo = 0, io = 0;
  for (const p of prims) { const P = view(p.attributes.POSITION, Float32Array, 3), X = view(p.indices, Uint32Array, 1); pos.set(P, vo * 3); for (let i = 0; i < X.length; i++) idx[io + i] = X[i] + vo; vo += P.length / 3; io += X.length; }
  // weld: same position -> same id
  const key = new Map(), weld = new Int32Array(V), u = new Uint32Array(pos.buffer);
  for (let v = 0; v < V; v++) { const k = u[v * 3] + "," + u[v * 3 + 1] + "," + u[v * 3 + 2]; let w = key.get(k); if (w === undefined) { w = v; key.set(k, w); } weld[v] = w; }
  const parent = new Int32Array(V).map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (let t = 0; t < I; t += 3) { const a = find(weld[idx[t]]), b = find(weld[idx[t + 1]]), c = find(weld[idx[t + 2]]); if (b !== a) parent[b] = a; const c2 = find(c); if (c2 !== a) parent[c2] = a; }
  const shell = new Int32Array(V), stats = new Map();
  for (let v = 0; v < V; v++) {
    const r = find(weld[v]); shell[v] = r; let s = stats.get(r);
    if (!s) stats.set(r, (s = { id: r, n: 0, min: [9, 9, 9], max: [-9, -9, -9], sum: [0, 0, 0] }));
    s.n++; for (let c = 0; c < 3; c++) { const x = pos[v * 3 + c]; s.min[c] = Math.min(s.min[c], x); s.max[c] = Math.max(s.max[c], x); s.sum[c] += x; }
  }
  for (const s of stats.values()) s.mid = s.sum.map((x) => x / s.n);
  return { pos, idx, shell, stats: [...stats.values()] };
}
if (process.argv[1].endsWith("original-shells.mjs")) {
  const { stats } = originalShells(process.argv[2]);
  console.log("shells:", stats.length);
  const f = (a) => a.map((x) => x.toFixed(3)).join(",");
  stats.filter((s) => s.mid[2] < -0.15 && s.mid[2] > -0.8 && s.max[1] > 0.55 && s.n > 200).sort((a, b) => a.mid[2] - b.mid[2])
    .forEach((s) => console.log(String(s.id).padStart(8), "verts", String(s.n).padStart(7), "mid", f(s.mid), "size", f(s.max.map((x, c) => x - s.min[c])), "min", f(s.min), "max", f(s.max)));
}
