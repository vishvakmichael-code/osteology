// Shrinks the Sketchfab wolf skeleton (51 chunks, 2.79M triangles) into one web-sized GLB.
// Vertex clustering: snap points to a grid, keep triangles whose corners land in three different cells,
// then recompute smooth normals. No dependencies.
// Bones listed in pelvisShells (shell ids from original-shells.mjs) are tagged in a _PELVIS attribute,
// and clustered separately so their edge stays crisp where they touch the thigh bones.
// Usage: node optimize-model.mjs <scene.gltf> <out.glb> [cellsAlongLongestSide=700] [pelvisShell,pelvisShell]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { originalShells } from "./original-shells.mjs";

const [, , src, out, cellsArg, shellArg = ""] = process.argv;
const CELLS = Number(cellsArg || 700);
const PELVIS_SHELLS = new Set(shellArg.split(",").filter(Boolean).map(Number));
const gltf = JSON.parse(readFileSync(src, "utf8"));
const bin = readFileSync(join(dirname(src), gltf.buffers[0].uri));

const view = (accIndex, Type, comps) => {
  const acc = gltf.accessors[accIndex], bv = gltf.bufferViews[acc.bufferView];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  if (bv.byteStride && bv.byteStride !== Type.BYTES_PER_ELEMENT * comps) throw new Error("strided data not handled");
  return new Type(bin.buffer, bin.byteOffset + offset, acc.count * comps);
};

// 1. merge every chunk
let vTotal = 0, tTotal = 0;
const prims = gltf.meshes.flatMap((m) => m.primitives);
for (const p of prims) { vTotal += gltf.accessors[p.attributes.POSITION].count; tTotal += gltf.accessors[p.indices].count; }
const pos = new Float32Array(vTotal * 3), idx = new Uint32Array(tTotal);
let vo = 0, io = 0;
for (const p of prims) {
  const P = view(p.attributes.POSITION, Float32Array, 3);
  const I = gltf.accessors[p.indices].componentType === 5125 ? view(p.indices, Uint32Array, 1) : view(p.indices, Uint16Array, 1);
  pos.set(P, vo * 3);
  for (let i = 0; i < I.length; i++) idx[io + i] = I[i] + vo;
  vo += P.length / 3; io += I.length;
}
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < pos.length; i += 3) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], pos[i + c]); max[c] = Math.max(max[c], pos[i + c]); }
const size = max.map((v, c) => v - min[c]);
const cell = Math.max(...size) / CELLS;
const flag = new Uint8Array(vTotal);
if (PELVIS_SHELLS.size) { const { shell } = originalShells(src); for (let v = 0; v < vTotal; v++) flag[v] = PELVIS_SHELLS.has(shell[v]) ? 1 : 0; }

// 2. cluster (pelvis points never share a cell with other bones)
const ids = new Int32Array(vTotal), sums = [], keyToId = new Map(), cflag = [];
for (let v = 0; v < vTotal; v++) {
  const gx = Math.floor((pos[v * 3] - min[0]) / cell), gy = Math.floor((pos[v * 3 + 1] - min[1]) / cell), gz = Math.floor((pos[v * 3 + 2] - min[2]) / cell);
  const key = ((gx * 4096 + gy) * 4096 + gz) * 2 + flag[v];
  let id = keyToId.get(key);
  if (id === undefined) { id = sums.length / 4; keyToId.set(key, id); sums.push(0, 0, 0, 0); cflag.push(flag[v]); }
  ids[v] = id; sums[id * 4] += pos[v * 3]; sums[id * 4 + 1] += pos[v * 3 + 1]; sums[id * 4 + 2] += pos[v * 3 + 2]; sums[id * 4 + 3]++;
}
const nV = sums.length / 4, outPos = new Float32Array(nV * 3);
for (let i = 0; i < nV; i++) for (let c = 0; c < 3; c++) outPos[i * 3 + c] = sums[i * 4 + c] / sums[i * 4 + 3];
const seen = new Set(), tris = [];
for (let t = 0; t < idx.length; t += 3) {
  const a = ids[idx[t]], b = ids[idx[t + 1]], c = ids[idx[t + 2]];
  if (a === b || b === c || a === c) continue;
  const s = [a, b, c].sort((x, y) => x - y), key = s[0] + "," + s[1] + "," + s[2];
  if (seen.has(key)) continue; seen.add(key); tris.push(a, b, c);
}
// drop clusters no triangle uses, and renumber
const used = new Int32Array(nV).fill(-1); let n = 0;
for (const v of tris) if (used[v] < 0) used[v] = n++;
const fPos = new Float32Array(n * 3), fIdx = new Uint32Array(tris.length);
const fMask = new Float32Array(n);
for (let i = 0; i < nV; i++) if (used[i] >= 0) { fPos.set(outPos.subarray(i * 3, i * 3 + 3), used[i] * 3); fMask[used[i]] = cflag[i]; }
tris.forEach((v, i) => (fIdx[i] = used[v]));

// 3. smooth normals, area weighted
const nrm = new Float32Array(n * 3);
for (let t = 0; t < fIdx.length; t += 3) {
  const [a, b, c] = [fIdx[t], fIdx[t + 1], fIdx[t + 2]];
  const ux = fPos[b * 3] - fPos[a * 3], uy = fPos[b * 3 + 1] - fPos[a * 3 + 1], uz = fPos[b * 3 + 2] - fPos[a * 3 + 2];
  const wx = fPos[c * 3] - fPos[a * 3], wy = fPos[c * 3 + 1] - fPos[a * 3 + 1], wz = fPos[c * 3 + 2] - fPos[a * 3 + 2];
  const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
  for (const v of [a, b, c]) { nrm[v * 3] += nx; nrm[v * 3 + 1] += ny; nrm[v * 3 + 2] += nz; }
}
for (let i = 0; i < n; i++) { const l = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1; for (let c = 0; c < 3; c++) nrm[i * 3 + c] /= l; }

// 4. write one GLB
const pad4 = (b) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4)]);
const pBuf = Buffer.from(fPos.buffer), nBuf = Buffer.from(nrm.buffer), iBuf = Buffer.from(fIdx.buffer), mBuf = Buffer.from(fMask.buffer);
const body = pad4(Buffer.concat([pBuf, nBuf, iBuf, mBuf]));
const fmin = [Infinity, Infinity, Infinity], fmax = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < fPos.length; i += 3) for (let c = 0; c < 3; c++) { fmin[c] = Math.min(fmin[c], fPos[i + c]); fmax[c] = Math.max(fmax[c], fPos[i + c]); }
const doc = {
  asset: { version: "2.0", generator: "optimize-model.mjs", copyright: "Wolf Skeleton by Ahnaf Tauseef (sketchfab.com/ahnaftauseef), CC-BY-4.0" },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: "wolf_skeleton" }],
  meshes: [{ name: "wolf_skeleton", primitives: [{ attributes: { POSITION: 0, NORMAL: 1, _PELVIS: 3 }, indices: 2, material: 0 }] }],
  materials: [{ name: "bone", pbrMetallicRoughness: { baseColorFactor: [0.86, 0.82, 0.74, 1], metallicFactor: 0, roughnessFactor: 0.8 } }],
  buffers: [{ byteLength: body.length }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: pBuf.length, target: 34962 },
    { buffer: 0, byteOffset: pBuf.length, byteLength: nBuf.length, target: 34962 },
    { buffer: 0, byteOffset: pBuf.length + nBuf.length, byteLength: iBuf.length, target: 34963 },
    { buffer: 0, byteOffset: pBuf.length + nBuf.length + iBuf.length, byteLength: mBuf.length, target: 34962 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: n, type: "VEC3", min: fmin, max: fmax },
    { bufferView: 1, componentType: 5126, count: n, type: "VEC3" },
    { bufferView: 2, componentType: 5125, count: fIdx.length, type: "SCALAR" },
    { bufferView: 3, componentType: 5126, count: n, type: "SCALAR" },
  ],
};
const json = pad4(Buffer.from(JSON.stringify(doc)));
const jsonPadded = Buffer.concat([json.subarray(0, Buffer.from(JSON.stringify(doc)).length), Buffer.alloc(json.length - Buffer.from(JSON.stringify(doc)).length, 0x20)]);
const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + body.length, 8);
jh.writeUInt32LE(jsonPadded.length, 0); jh.writeUInt32LE(0x4e4f534a, 4); bh.writeUInt32LE(body.length, 0); bh.writeUInt32LE(0x004e4942, 4);
writeFileSync(out, Buffer.concat([header, jh, jsonPadded, bh, body]));
console.log(JSON.stringify({ inTriangles: tTotal / 3, outTriangles: fIdx.length / 3, vertices: n, bytes: 12 + 16 + jsonPadded.length + body.length, min: fmin, max: fmax, size }));
