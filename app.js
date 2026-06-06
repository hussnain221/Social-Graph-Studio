/* ─────────────────────────────────────────────────────────────────────────
   SocialGraph Studio — app.js
   BFS / DFS Social Network Visualizer with real queue/stack animations
───────────────────────────────────────────────────────────────────────── */

/* ── CONSTANTS ─────────────────────────────────────────────────────────── */
const COLOR_CLASSES = ["community-0", "community-1", "community-2", "community-3", "community-4"];

const SAMPLE_TEXT = `Ayesha: Bilal, Hina, Fahad
Bilal: Usman, Sara
Hina: Sara, Nida
Sara: Zain, Noor
Zain: Iqra, Danish
Iqra: Ali, Maham
Omar: Maham, Nida, Hamza
Noor: Hamza, Fahad
Laiba: Fahad, Rehan
Sana: Rehan, Ayesha`;

/* ── STATE ─────────────────────────────────────────────────────────────── */
const state = {
  algorithm: "BFS",
  nodes: [],
  edges: [],
  source: "",
  target: "",
  selectedNode: "",
  traversal: [],
  activeStep: -1,
  timer: null,
  components: [],
  layoutReady: false,
  dragNode: null,
  prevKpi: { nodes: 0, edges: 0, density: 0, components: 0 }
};

/* ── DOM REFERENCES ────────────────────────────────────────────────────── */
const svg           = document.getElementById("graphSvg");
const sourceSelect  = document.getElementById("sourceSelect");
const targetSelect  = document.getElementById("targetSelect");
const edgeFrom      = document.getElementById("edgeFrom");
const edgeTo        = document.getElementById("edgeTo");
const speedRange    = document.getElementById("speedRange");
const speedLabel    = document.getElementById("speedLabel");
const toastText     = document.getElementById("toastText");
const graphToast    = document.getElementById("graphToast");
const stepText      = document.getElementById("stepText");
const edgeInput     = document.getElementById("edgeInput");
const newUserInput  = document.getElementById("newUserInput");
const structureTitle  = document.getElementById("structureTitle");
const structureBadge  = document.getElementById("structureBadge");
const structureDir    = document.getElementById("structureDir");
const queueViewport   = document.getElementById("queueViewport");
const queueTrack      = document.getElementById("queueTrack");
const stackViewport   = document.getElementById("stackViewport");
const stackTrack      = document.getElementById("stackTrack");
const structureMeta   = document.getElementById("structureMeta");
const nodeTooltip     = document.getElementById("nodeTooltip");
const dirDequeueLabel = document.getElementById("dirDequeueLabel");
const dirEnqueueLabel = document.getElementById("dirEnqueueLabel");
const dirDequeue      = document.getElementById("dirDequeue");
const dirEnqueue      = document.getElementById("dirEnqueue");
const pathResult      = document.getElementById("pathResult");

/* ── SPEED LABEL ───────────────────────────────────────────────────────── */
function updateSpeedLabel() {
  const v = Number(speedRange.value);
  if (v < 350)      speedLabel.textContent = "Fast";
  else if (v < 900) speedLabel.textContent = "Med";
  else              speedLabel.textContent = "Slow";
}
speedRange.addEventListener("input", updateSpeedLabel);
updateSpeedLabel();

/* ── PARSING ───────────────────────────────────────────────────────────── */
function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function parseGraphText(text) {
  const nodes   = new Set();
  const edgeKeys = new Set();
  const edges   = [];

  function addEdge(fromRaw, toRaw) {
    const from = normalizeName(fromRaw);
    const to   = normalizeName(toRaw);
    if (!from || !to || from === to) return;
    nodes.add(from);
    nodes.add(to);
    const key = [from, to].sort().join("::");
    if (!edgeKeys.has(key)) { edgeKeys.add(key); edges.push({ from, to }); }
  }

  text.split(/\r?\n/).forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;

    if (clean.includes(":")) {
      const colonIndex = clean.indexOf(":");
      const from = normalizeName(clean.slice(0, colonIndex));
      if (from) nodes.add(from);
      splitNeighborList(clean.slice(colonIndex + 1)).forEach((to) => addEdge(from, to));
      return;
    }

    const parts = clean.split(/\s*(?:<->|->|-|,)\s*/).map(normalizeName).filter(Boolean);
    if (parts.length >= 2) addEdge(parts[0], parts[1]);
    if (parts.length === 1) nodes.add(parts[0]);
  });

  return { nodes: [...nodes].map((id) => ({ id })), edges };
}

function splitNeighborList(value) {
  const text = value.trim();
  if (!text) return [];
  const delimiter = /[,;|]/.test(text) ? /[,;|]/ : /\s+/;
  return text.split(delimiter).map(normalizeName).filter(Boolean);
}

/* ── ADJACENCY ─────────────────────────────────────────────────────────── */
function getAdjacency() {
  const adj = new Map(state.nodes.map((n) => [n.id, []]));
  state.edges.forEach(({ from, to }) => {
    if (!adj.has(from) || !adj.has(to)) return;
    adj.get(from).push(to);
    adj.get(to).push(from);
  });
  adj.forEach((neighbors) => neighbors.sort((a, b) => a.localeCompare(b)));
  return adj;
}

/* ── BFS ───────────────────────────────────────────────────────────────── */
function bfs(source) {
  const adj     = getAdjacency();
  const queue   = [source];
  const visited = new Set([source]);
  const parent  = new Map();
  const levels  = new Map([[source, 0]]);
  const steps   = [];
  let operations = 0;

  while (queue.length) {
    const current  = queue.shift();
    operations += 1;
    const enqueued = [];
    const before   = [current, ...queue];

    adj.get(current).forEach((neighbor) => {
      operations += 1;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        levels.set(neighbor, levels.get(current) + 1);
        queue.push(neighbor);
        enqueued.push(neighbor);
      }
    });

    steps.push({
      node:            current,
      parent:          parent.get(current) || null,
      structure:       [...queue],
      structureBefore: before,
      added:           enqueued,
      removed:         current,
      level:           levels.get(current),
      operations
    });
  }
  return steps;
}

/* ── DFS ───────────────────────────────────────────────────────────────── */
function dfs(source) {
  const adj     = getAdjacency();
  const stack   = [{ node: source, parent: null }];
  const visited = new Set();
  const steps   = [];
  let operations = 0;

  while (stack.length) {
    const before  = stack.map((item) => item.node);
    const { node: current, parent: currParent } = stack.pop();
    operations += 1;
    if (visited.has(current)) {
      steps.push({
        node:            current,
        parent:          currParent,
        structure:       stack.map((item) => item.node),
        structureBefore: before,
        added:           [],
        removed:         current,
        level:           null,
        operations,
        skipped:         true
      });
      continue;
    }

    visited.add(current);
    const pushed = [];
    [...adj.get(current)].reverse().forEach((neighbor) => {
      operations += 1;
      if (!visited.has(neighbor)) {
        stack.push({ node: neighbor, parent: current });
        pushed.push(neighbor);
      }
    });

    steps.push({
      node:            current,
      parent:          currParent,
      structure:       stack.map((item) => item.node),
      structureBefore: before,
      added:           pushed,
      removed:         current,
      level:           null,
      operations
    });
  }
  return steps;
}

/* ── COMPONENTS ────────────────────────────────────────────────────────── */
function findComponents() {
  const adj     = getAdjacency();
  const visited = new Set();
  const components = [];

  state.nodes.forEach((node) => {
    if (visited.has(node.id)) return;
    const group = [];
    const stack = [node.id];
    visited.add(node.id);
    while (stack.length) {
      const current = stack.pop();
      group.push(current);
      adj.get(current).forEach((neighbor) => {
        if (!visited.has(neighbor)) { visited.add(neighbor); stack.push(neighbor); }
      });
    }
    components.push(group.sort((a, b) => a.localeCompare(b)));
  });

  state.components = components;
  return components;
}

/* ── SHORTEST PATH ─────────────────────────────────────────────────────── */
function shortestPath(source, target) {
  if (!source || !target) return [];
  const adj     = getAdjacency();
  const queue   = [source];
  const visited = new Set([source]);
  const parent  = new Map();

  while (queue.length) {
    const current = queue.shift();
    if (current === target) break;
    adj.get(current).forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    });
  }

  if (!visited.has(target)) return [];
  const path = [target];
  while (path[0] !== source) path.unshift(parent.get(path[0]));
  return path;
}

/* ── FORCE LAYOUT ──────────────────────────────────────────────────────── */
function layoutNodes() {
  const centerX = 520;
  const centerY = 325;
  const components = findComponents();
  const componentByNode = new Map();
  components.forEach((group, index) => group.forEach((id) => componentByNode.set(id, index)));

  if (!state.nodes.length) return;
  if (state.layoutReady && state.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y))) return;

  if (components.length > 1) {
    const clusterRadius = Math.min(260, 110 + state.nodes.length * 6);
    components.forEach((group, ci) => {
      const angle   = (Math.PI * 2 * ci) / components.length - Math.PI / 2;
      const clusterX = centerX + Math.cos(angle) * clusterRadius;
      const clusterY = centerY + Math.sin(angle) * Math.min(clusterRadius, 200);
      const localRadius = Math.max(42, Math.min(120, group.length * 14));
      group.forEach((id, i) => {
        const node = state.nodes.find((n) => n.id === id);
        const na   = (Math.PI * 2 * i) / Math.max(group.length, 1) - Math.PI / 2;
        node.x = clusterX + Math.cos(na) * localRadius;
        node.y = clusterY + Math.sin(na) * localRadius;
        node.component = ci;
      });
    });
  } else {
    state.nodes.forEach((node, i) => {
      const angle  = (Math.PI * 2 * i) / state.nodes.length - Math.PI / 2;
      const radius = Math.min(260, 140 + state.nodes.length * 7) + Math.sin(i * 1.8) * 22;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
      node.component = componentByNode.get(node.id) || 0;
    });
  }

  runForceLayout(components);
  state.layoutReady = true;
}

function runForceLayout(components) {
  const W = 1040, H = 650;
  const nodeById = new Map(state.nodes.map((n) => [n.id, n]));
  const compCenter = new Map();
  const compCount  = Math.max(components.length, 1);

  components.forEach((group, i) => {
    const angle = (Math.PI * 2 * i) / compCount - Math.PI / 2;
    compCenter.set(i, {
      x: 520 + Math.cos(angle) * (compCount > 1 ? 210 : 0),
      y: 325 + Math.sin(angle) * (compCount > 1 ? 150 : 0)
    });
  });

  for (let tick = 0; tick < 280; tick++) {
    state.nodes.forEach((n) => { n.vx = n.vx || 0; n.vy = n.vy || 0; });

    for (let i = 0; i < state.nodes.length; i++) {
      for (let j = i + 1; j < state.nodes.length; j++) {
        const a = state.nodes[i];
        const b = state.nodes[j];
        const dx = a.x - b.x || 0.01;
        const dy = a.y - b.y || 0.01;
        const distSq = Math.max(dx * dx + dy * dy, 900);
        const force  = 15000 / distSq;
        const dist   = Math.sqrt(distSq);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!a.fixed) { a.vx += fx; a.vy += fy; }
        if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
      }
    }

    state.edges.forEach((edge) => {
      const from = nodeById.get(edge.from);
      const to   = nodeById.get(edge.to);
      if (!from || !to) return;
      const dx   = to.x - from.x;
      const dy   = to.y - from.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const desired = 176;
      const force   = (dist - desired) * 0.014;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (!from.fixed) { from.vx += fx; from.vy += fy; }
      if (!to.fixed)   { to.vx -= fx; to.vy -= fy; }
    });

    state.nodes.forEach((node) => {
      const target = compCenter.get(node.component) || { x: 520, y: 325 };
      if (!node.fixed) {
        node.vx += (target.x - node.x) * 0.0035;
        node.vy += (target.y - node.y) * 0.0035;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x = clamp(node.x + node.vx, 62, W - 62);
        node.y = clamp(node.y + node.vy, 62, H - 62);
      }
    });
  }
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* ── TRAVERSAL STATE HELPERS ───────────────────────────────────────────── */
function currentVisitedSet() {
  return new Set(state.traversal.slice(0, state.activeStep + 1).filter((s) => !s.skipped).map((s) => s.node));
}
function activeEdgeSet() {
  return new Set(
    state.traversal.slice(0, state.activeStep + 1)
      .filter((s) => s.parent && !s.skipped)
      .map((s) => [s.node, s.parent].sort().join("::"))
  );
}
function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ── SVG RENDERING ─────────────────────────────────────────────────────── */
function renderGraph() {
  layoutNodes();
  const visited    = currentVisitedSet();
  const activeEdges = activeEdgeSet();
  const currentNode = state.traversal[state.activeStep]?.node;
  const path        = shortestPath(state.source, state.target);
  const pathEdges   = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    pathEdges.add([path[i], path[i + 1]].sort().join("::"));
  }

  svg.innerHTML = "";

  if (!state.nodes.length) {
    setToast("Paste graph data or load the sample to begin.", false);
    return;
  }

  /* ── Defs ── */
  const defs = svgEl("defs");
  defs.innerHTML = `
    <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="arrowActive" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,1 L5,3 L0,5 Z" class="arrow-active"></path>
    </marker>
    <marker id="arrowPath" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,1 L5,3 L0,5 Z" class="arrow-path"></path>
    </marker>
    <radialGradient id="nodeGrad0" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#7ab3ff"/>
      <stop offset="100%" stop-color="#2457e6"/>
    </radialGradient>
    <radialGradient id="nodeGrad1" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#50f0cc"/>
      <stop offset="100%" stop-color="#00a880"/>
    </radialGradient>
    <radialGradient id="nodeGrad2" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#c993ff"/>
      <stop offset="100%" stop-color="#7c3fd1"/>
    </radialGradient>
    <radialGradient id="nodeGrad3" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#ff9b9b"/>
      <stop offset="100%" stop-color="#d84040"/>
    </radialGradient>
    <radialGradient id="nodeGrad4" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#ffd97a"/>
      <stop offset="100%" stop-color="#c98200"/>
    </radialGradient>
    <radialGradient id="nodeGradSource" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#ffb4b4"/>
      <stop offset="100%" stop-color="#d63031"/>
    </radialGradient>
    <radialGradient id="nodeGradTarget" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#d0a0ff"/>
      <stop offset="100%" stop-color="#8420d4"/>
    </radialGradient>
    <radialGradient id="nodeGradVisited" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#40c4a0"/>
      <stop offset="100%" stop-color="#0d7a60"/>
    </radialGradient>
    <radialGradient id="nodeGradCurrent" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#ffe08a"/>
      <stop offset="100%" stop-color="#d4920a"/>
    </radialGradient>
    <radialGradient id="nodeGradUnvisited" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#3a4f65"/>
      <stop offset="100%" stop-color="#1a2d42"/>
    </radialGradient>`;
  svg.appendChild(defs);

  /* ── Edges ── */
  const edgeGroup = svgEl("g");
  edgeGroup.classList.add("relationship-layer");

  const pathDirected = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    pathDirected.add(path[i] + "::" + path[i + 1]);
  }

  state.edges.forEach((edge) => {
    const from = state.nodes.find((n) => n.id === edge.from);
    const to   = state.nodes.find((n) => n.id === edge.to);
    if (!from || !to) return;

    const edgeKey  = [edge.from, edge.to].sort().join("::");
    const isActive = activeEdges.has(edgeKey);
    const isPath   = pathEdges.has(edgeKey) && state.activeStep < 0;

    let startNode = from;
    let endNode   = to;

    if (isActive) {
      const step = state.traversal.slice(0, state.activeStep + 1).find(
        (s) => s.parent && [s.node, s.parent].sort().join("::") === edgeKey
      );
      if (step) {
        startNode = state.nodes.find((n) => n.id === step.parent);
        endNode   = state.nodes.find((n) => n.id === step.node);
      }
    } else if (isPath) {
      if (pathDirected.has(to.id + "::" + from.id)) {
        startNode = to;
        endNode   = from;
      }
    }

    const pathData = relationshipPath(startNode, endNode, 16);

    const pathEl = svgEl("path");
    pathEl.setAttribute("d", pathData.d);
    pathEl.classList.add("edge");
    if (isActive) {
      pathEl.classList.add("active", "shimmer");
      pathEl.setAttribute("marker-end", "url(#arrowActive)");
    } else if (isPath) {
      pathEl.classList.add("shortest-path");
      pathEl.setAttribute("marker-end", "url(#arrowPath)");
    }
    edgeGroup.appendChild(pathEl);

    if (isActive) {
      const lg = svgEl("g");
      lg.classList.add("relationship-label");
      lg.setAttribute("transform", `translate(${pathData.labelX},${pathData.labelY}) rotate(${pathData.angle})`);
      const rect = svgEl("rect");
      rect.setAttribute("x", "-22"); rect.setAttribute("y", "-9");
      rect.setAttribute("width", "44"); rect.setAttribute("height", "18");
      rect.setAttribute("rx", "9");
      const txt = svgEl("text");
      txt.textContent = "PATH";
      lg.appendChild(rect); lg.appendChild(txt);
      edgeGroup.appendChild(lg);
    }
  });
  svg.appendChild(edgeGroup);

  /* ── Nodes ── */
  const nodeGroup = svgEl("g");

  state.nodes.forEach((node) => {
    const deg   = state.edges.filter((e) => e.from === node.id || e.to === node.id).length;
    const group = svgEl("g");
    group.classList.add("node", COLOR_CLASSES[node.component % COLOR_CLASSES.length]);
    if (node.id === state.target)   group.classList.add("target");
    if (node.id === state.source)   group.classList.add("source");
    if (visited.has(node.id))       group.classList.add("visited");
    if (node.id === currentNode)    group.classList.add("current");
    if (node.id === state.selectedNode) group.classList.add("selected");
    if (!visited.has(node.id) && state.activeStep >= 0) group.classList.add("unvisited");

    group.setAttribute("transform", `translate(${node.x},${node.y})`);
    group.style.cursor = "pointer";

    /* Pulse ring on current */
    if (node.id === currentNode) {
      const ring = svgEl("circle");
      ring.classList.add("pulse-ring");
      ring.setAttribute("r", "26");
      group.appendChild(ring);

      const ring2 = svgEl("circle");
      ring2.classList.add("pulse-ring");
      ring2.setAttribute("r", "26");
      ring2.style.animationDelay = "0.55s";
      group.appendChild(ring2);
    }

    /* Halo */
    const halo = svgEl("circle");
    halo.classList.add("node-halo");
    halo.setAttribute("r", "38");
    group.appendChild(halo);

    /* Main circle */
    const r = node.id === currentNode ? 30 : 26;
    const circle = svgEl("circle");
    circle.setAttribute("r", String(r));

    // Set gradient fill via inline style (beats CSS specificity)
    let gradId = `nodeGrad${node.component % 5}`;
    if (node.id === currentNode)                            gradId = "nodeGradCurrent";
    else if (node.id === state.source)                      gradId = "nodeGradSource";
    else if (node.id === state.target)                      gradId = "nodeGradTarget";
    else if (visited.has(node.id))                          gradId = "nodeGradVisited";
    else if (!visited.has(node.id) && state.activeStep >= 0) gradId = "nodeGradUnvisited";
    circle.style.fill = `url(#${gradId})`;

    group.appendChild(circle);

    /* Initials text */
    const txt = svgEl("text");
    txt.textContent = initials(node.id);
    txt.setAttribute("y", "1");
    group.appendChild(txt);

    /* Label pill background */
    const labelY = r + 16;
    const labelText = node.id.length > 10 ? node.id.slice(0, 9) + "…" : node.id;
    const pillW = Math.max(labelText.length * 6.5 + 16, 40);

    const pill = svgEl("rect");
    pill.classList.add("label-pill");
    pill.setAttribute("x", String(-pillW / 2));
    pill.setAttribute("y", String(labelY - 9));
    pill.setAttribute("width", String(pillW));
    pill.setAttribute("height", "17");
    pill.setAttribute("rx", "8");
    group.appendChild(pill);

    /* Label text */
    const label = svgEl("text");
    label.classList.add("node-label");
    label.setAttribute("y", String(labelY + 0.5));
    label.textContent = labelText;
    group.appendChild(label);

    /* Events */
    group.addEventListener("click", () => selectSource(node.id));
    group.addEventListener("mousedown", (e) => startDrag(e, node.id));
    group.addEventListener("mouseenter", (e) => showTooltip(e, node.id, deg));
    group.addEventListener("mouseleave", hideTooltip);

    nodeGroup.appendChild(group);
  });
  svg.appendChild(nodeGroup);
}

function svgEl(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function relationshipPath(from, to, curve) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
  const nx = dx / dist;
  const ny = dy / dist;
  const startX = from.x + nx * 29;
  const startY = from.y + ny * 29;
  const endX   = to.x - nx * 33;
  const endY   = to.y - ny * 33;
  const midX   = (startX + endX) / 2;
  const midY   = (startY + endY) / 2;
  const normalX = -ny;
  const normalY = nx;
  const curveAmt = Math.min(curve, dist * 0.18);
  const controlX = midX + normalX * curveAmt;
  const controlY = midY + normalY * curveAmt;
  const labelX   = midX + normalX * (curveAmt + 5);
  const labelY   = midY + normalY * (curveAmt + 5);
  let angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  if (angle > 90 || angle < -90) angle += 180;
  return { d: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`, labelX, labelY, angle };
}

/* ── TOOLTIP ───────────────────────────────────────────────────────────── */
function showTooltip(event, id, degree) {
  nodeTooltip.textContent = `${id}  ·  ${degree} connection${degree !== 1 ? "s" : ""}`;
  nodeTooltip.style.left = (event.clientX + 14) + "px";
  nodeTooltip.style.top  = (event.clientY - 42) + "px";
  nodeTooltip.classList.add("visible");
}
function hideTooltip() {
  nodeTooltip.classList.remove("visible");
}

/* ── DRAG ──────────────────────────────────────────────────────────────── */
function svgPoint(event) {
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function startDrag(event, id) {
  event.preventDefault();
  state.dragNode = state.nodes.find((n) => n.id === id);
  if (state.dragNode) state.dragNode.fixed = true;
}

/* ── TOAST ─────────────────────────────────────────────────────────────── */
function setToast(message, active = true) {
  toastText.textContent = message;
  graphToast.classList.toggle("toast-active", active);
}

/* ── STRUCTURE VISUALIZATION ───────────────────────────────────────────── */
function renderStructure(step) {
  const isBfs = state.algorithm === "BFS";

  /* Toggle panels */
  queueViewport.style.display = isBfs ? "" : "none";
  stackViewport.style.display = isBfs ? "none" : "";

  /* Update header */
  structureTitle.textContent = isBfs ? "Queue Visualization" : "Stack Visualization";
  structureBadge.textContent = isBfs ? "FIFO" : "LIFO";
  structureBadge.className   = `structure-badge ${isBfs ? "badge-fifo" : "badge-lifo"}`;

  /* Direction labels */
  if (isBfs) {
    dirDequeueLabel.textContent = "DEQUEUE";
    dirEnqueueLabel.textContent = "ENQUEUE";
    dirDequeue.textContent = "⟵";
    dirEnqueue.textContent = "⟶";
  } else {
    dirDequeueLabel.textContent = "POP";
    dirEnqueueLabel.textContent = "PUSH";
    dirDequeue.textContent = "↑";
    dirEnqueue.textContent = "↓";
  }

  if (!step) {
    queueTrack.innerHTML = `<div class="empty-structure">Run BFS to see enqueue / dequeue operations.</div>`;
    stackTrack.innerHTML = `<div class="empty-structure">Run DFS to see push / pop operations.</div>`;
    structureMeta.textContent = isBfs
      ? "BFS uses FIFO: enqueue at rear, dequeue from front."
      : "DFS uses LIFO: push and pop from the top.";
    return;
  }

  const added = new Set(step.added);

  if (isBfs) {
    /* Queue: show structure items left (front) to right (rear) */
    const items = step.structure;
    if (!items.length) {
      queueTrack.innerHTML = `<div class="empty-structure">Queue is empty after dequeuing ${escHtml(step.removed)}.</div>`;
    } else {
      queueTrack.innerHTML = items.map((item, i) => {
        const tag = i === 0
          ? `<span class="item-tag tag-front">Front</span>`
          : i === items.length - 1
            ? `<span class="item-tag tag-rear">Rear</span>`
            : "";
        return `
          <div class="structure-item ${added.has(item) ? "just-added" : i === 0 ? "next-out" : ""}">
            ${tag}
            <strong class="item-initials">${escHtml(initials(item))}</strong>
            <span class="item-name">${escHtml(item)}</span>
          </div>`;
      }).join("");
    }
    structureMeta.textContent =
      `Dequeue: ${step.removed}. Enqueue: ${step.added.length ? step.added.join(", ") : "none"}. Queue size: ${step.structure.length}.`;

  } else {
    /* Stack: show items top (last element, index 0 in reversed display) to bottom */
    const items = [...step.structure].reverse();
    if (!items.length) {
      stackTrack.innerHTML = `<div class="empty-structure">Stack is empty after popping ${escHtml(step.removed)}.</div>`;
    } else {
      stackTrack.innerHTML = items.map((item, i) => {
        const tag = i === 0 ? `<span class="item-tag tag-top">Top</span>` : "";
        return `
          <div class="structure-item ${added.has(item) ? "just-added" : i === 0 ? "next-out" : ""}">
            <strong class="item-initials">${escHtml(initials(item))}</strong>
            <span class="item-name">${escHtml(item)}</span>
            ${tag}
          </div>`;
      }).join("");
    }
    structureMeta.textContent =
      `Pop: ${step.removed}. Push: ${step.added.length ? step.added.join(", ") : "none"}. Stack size: ${step.structure.length}.`;
  }
}

/* ── NARRATION ─────────────────────────────────────────────────────────── */
function setNarration() {
  const step = state.traversal[state.activeStep];
  if (!step) {
    stepText.innerHTML = "Run <strong>BFS</strong> or <strong>DFS</strong> to see the data structure state and traversal explanation here.";
    setToast(state.nodes.length ? "Ready. Choose source, target, and algorithm." : "Paste graph data or load the sample to begin.", false);
    renderStructure(null);
    return;
  }

  const sName  = state.algorithm === "BFS" ? "Queue" : "Stack";
  const structTxt  = step.structure.length ? step.structure.map(escHtml).join(" → ") : "empty";

  if (step.skipped) {
    stepText.innerHTML = `
      Popped <strong style="color:var(--coral)">${escHtml(step.node)}</strong> from Stack.
      <br>User has already been visited; skipping to prevent duplicate processing.
      <br><span style="color:var(--ink-subtle);font-size:12px;">${sName}: ${structTxt}</span>`;
    setToast(`Step ${state.activeStep + 1}/${state.traversal.length}: DFS skipping ${step.node} (already visited)`, true);
    renderStructure(step);
    return;
  }

  const action = state.algorithm === "BFS"
    ? `Dequeued <strong>${escHtml(step.removed)}</strong>; enqueued ${step.added.length ? step.added.map(escHtml).join(", ") : "no new users"}.`
    : `Popped <strong>${escHtml(step.removed)}</strong>; pushed ${step.added.length ? step.added.map(escHtml).join(", ") : "no new users"}.`;
  const levelText  = state.algorithm === "BFS" ? ` Influence level: <strong>${step.level}</strong>.` : "";
  const parentText = step.parent ? ` Discovered from <strong>${escHtml(step.parent)}</strong>.` : " This is the source user.";

  stepText.innerHTML = `
    Visiting <strong style="color:var(--teal)">${escHtml(step.node)}</strong>.${parentText}${levelText}
    <br>${action}
    <br><span style="color:var(--ink-subtle);font-size:12px;">${sName}: ${structTxt}</span>`;

  setToast(`Step ${state.activeStep + 1}/${state.traversal.length}: ${state.algorithm} visiting ${step.node}`, true);
  renderStructure(step);
}

/* ── METRICS & CHARTS ──────────────────────────────────────────────────── */
function buildLevels() {
  const levels = new Map();
  state.traversal.slice(0, state.activeStep + 1).forEach((s) => {
    if (s.skipped || s.level === null || s.level === undefined) return;
    if (!levels.has(s.level)) levels.set(s.level, []);
    levels.get(s.level).push(s.node);
  });
  return levels;
}

function renderBarChart(containerId, rows, emptyText) {
  const container = document.getElementById(containerId);
  if (!rows.length) {
    container.innerHTML = `<p style="font-size:13px;color:var(--ink-subtle);">${emptyText}</p>`;
    return;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  container.innerHTML = rows.map((row, i) => `
    <div class="bar-row">
      <span class="bar-label">${escHtml(row.label)}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${Math.max(4, (row.value / max) * 100)}%;animation-delay:${i * 60}ms"></div>
      </div>
      <span class="bar-value">${row.value}</span>
    </div>`).join("");
}

function animateCounter(el, to) {
  const from     = parseFloat(el.textContent) || 0;
  const isFloat  = String(to).includes(".");
  const duration = 500;
  const start    = performance.now();
  function tick(now) {
    const t   = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val  = from + (to - from) * ease;
    el.textContent = isFloat ? val.toFixed(2) : Math.round(val);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updatePathResult() {
  const path   = shortestPath(state.source, state.target);
  if (!state.source || !state.target) {
    pathResult.textContent = "Choose source and target to calculate social distance.";
    pathResult.className   = "path-result";
  } else if (state.source === state.target) {
    pathResult.textContent = "Source and target are the same user. Distance is 0.";
    pathResult.className   = "path-result";
  } else if (!path.length) {
    pathResult.textContent = `${state.source} cannot reach ${state.target}. They are in different communities.`;
    pathResult.className   = "path-result";
  } else {
    pathResult.innerHTML   = `<strong>${escHtml(state.source)}</strong> → <strong>${escHtml(state.target)}</strong> in <strong style="color:var(--teal)">${path.length - 1} hop${path.length - 1 === 1 ? "" : "s"}</strong>: ${path.map(escHtml).join(" → ")}`;
    pathResult.className   = "path-result has-path";
  }
}

function updateMetrics() {
  const components = findComponents();
  const nodeCount  = state.nodes.length;
  const edgeCount  = state.edges.length;
  const possible   = nodeCount * (nodeCount - 1) / 2;
  const density    = possible ? edgeCount / possible : 0;
  const visited    = currentVisitedSet();
  const levels     = buildLevels();

  /* Animate KPI counters */
  const heroNodes      = document.getElementById("heroNodes");
  const heroEdges      = document.getElementById("heroEdges");
  const heroDensity    = document.getElementById("heroDensity");
  const heroComponents = document.getElementById("heroComponents");
  if (Number(heroNodes.textContent) !== nodeCount)           animateCounter(heroNodes, nodeCount);
  if (Number(heroEdges.textContent) !== edgeCount)           animateCounter(heroEdges, edgeCount);
  if (parseFloat(heroDensity.textContent) !== density)       animateCounter(heroDensity, density);
  if (Number(heroComponents.textContent) !== components.length) animateCounter(heroComponents, components.length);

  document.getElementById("connectedStatus").textContent =
    !nodeCount ? "No graph" : components.length === 1 ? "Connected" : "Disconnected";
  document.getElementById("componentSummary").textContent = nodeCount
    ? `${components.length} connected component${components.length === 1 ? "" : "s"}. Largest: ${Math.max(...components.map((g) => g.length))} users.`
    : "Enter data to analyze communities.";
  document.getElementById("orderCount").textContent = `${visited.size} visited`;
  document.getElementById("orderList").textContent = state.traversal.length
    ? state.traversal.slice(0, state.activeStep + 1)
        .filter((s) => !s.skipped)
        .map((s, idx) => `${idx + 1}. ${s.node}`).join("  ·  ")
    : "Run an algorithm to see the visit sequence.";
  document.getElementById("operationCount").textContent = state.activeStep >= 0
    ? `${state.traversal[state.activeStep].operations} vertex/edge checks. V=${nodeCount}, E=${edgeCount}.`
    : `V=${nodeCount}, E=${edgeCount} → traversal is O(${nodeCount} + ${edgeCount}).`;

  renderBarChart(
    "levelChart",
    [...levels.entries()].map(([lvl, names]) => ({ label: `Level ${lvl}`, value: names.length })),
    "Run BFS to visualize influence levels."
  );
  renderBarChart(
    "componentChart",
    components.map((g, i) => ({ label: `Community ${i + 1}`, value: g.length })),
    "Enter graph data to detect communities."
  );
  updatePathResult();
}

const traversalProgress     = document.getElementById("traversalProgress");
const traversalProgressFill = document.getElementById("traversalProgressFill");

function updateProgress() {
  if (!state.traversal.length) {
    traversalProgress.style.opacity = "0";
    traversalProgressFill.style.width = "0%";
    return;
  }
  const pct = ((state.activeStep + 1) / state.traversal.length) * 100;
  traversalProgress.style.opacity = "1";
  traversalProgressFill.style.width = Math.max(0, pct) + "%";
}

/* ── TRAVERSAL CONTROL ─────────────────────────────────────────────────── */
function prepareTraversal() {
  state.traversal = state.algorithm === "BFS" ? bfs(state.source) : dfs(state.source);
  state.activeStep = -1;
}

function stepTraversal() {
  if (!state.nodes.length) return;
  if (!state.traversal.length) prepareTraversal();

  if (state.activeStep < state.traversal.length - 1) {
    state.activeStep += 1;
    setNarration();
    renderGraph();
    updateMetrics();
    updateProgress();
  } else {
    stopTimer();
    setToast(`${state.algorithm} complete — ${state.traversal.length} user${state.traversal.length === 1 ? "" : "s"} reached from ${state.source}.`, true);
  }
}

function runTraversal() {
  if (!state.nodes.length) return;
  stopTimer();
  if (!state.traversal.length || state.activeStep >= state.traversal.length - 1) prepareTraversal();
  stepTraversal();
  state.timer = setInterval(stepTraversal, Number(speedRange.value));
}

function stopTimer() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

function resetTraversal() {
  stopTimer();
  state.traversal = [];
  state.activeStep = -1;
  setNarration();
  renderGraph();
  updateMetrics();
  updateProgress();
}

/* ── GRAPH LOADING ─────────────────────────────────────────────────────── */
function loadGraphFromText(text) {
  const graph = parseGraphText(text);
  state.nodes = graph.nodes;
  state.edges = graph.edges;
  state.layoutReady = false;
  state.source = state.nodes[0]?.id || "";
  state.target = state.nodes[1]?.id || state.source;
  state.selectedNode = state.source;
  populateSelects();
  resetTraversal();
  setToast(
    state.nodes.length
      ? `Loaded ${state.nodes.length} users and ${state.edges.length} connections. Ready.`
      : "No valid graph found. Try: Ayesha-Bilal or Ayesha: Bilal, Hina.",
    !!state.nodes.length
  );
}

function populateSelects() {
  const opts = state.nodes.map((n) => `<option value="${escHtml(n.id)}">${escHtml(n.id)}</option>`).join("");
  [sourceSelect, targetSelect, edgeFrom, edgeTo].forEach((sel) => { sel.innerHTML = opts; });
  if (!state.source && state.nodes[0])  state.source = state.nodes[0].id;
  if (!state.target && state.nodes[1])  state.target = state.nodes[1].id;
  sourceSelect.value = state.source;
  targetSelect.value = state.target;
  edgeFrom.value = state.nodes[0]?.id || "";
  edgeTo.value   = state.nodes[1]?.id || "";
}

function selectSource(id) {
  state.source = id;
  state.selectedNode = id;
  sourceSelect.value = id;
  resetTraversal();
}

function escHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ── GRAPH BUILDER ─────────────────────────────────────────────────────── */
function edgeExists(from, to) {
  return state.edges.some((e) => [e.from, e.to].sort().join("::") === [from, to].sort().join("::"));
}
function addNode(id) {
  const clean = normalizeName(id);
  if (!clean) return;
  if (!state.nodes.some((n) => n.id.toLowerCase() === clean.toLowerCase())) {
    state.nodes.push({ id: clean });
    state.layoutReady = false;
    if (!state.source) state.source = clean;
    if (!state.target) state.target = clean;
  }
  populateSelects();
  resetTraversal();
}
function addEdge(from, to) {
  if (!from || !to || from === to) return;
  if (!edgeExists(from, to)) {
    state.edges.push({ from, to });
    state.layoutReady = false;
  }
  resetTraversal();
}

/* ── EVENT LISTENERS ───────────────────────────────────────────────────── */

/* Algorithm segmented control */
document.querySelectorAll(".segment").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((s) => { s.classList.remove("active"); s.setAttribute("aria-pressed", "false"); });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    state.algorithm = btn.dataset.algorithm;
    resetTraversal();
  });
});

/* Nav active state */
document.querySelectorAll(".navbar nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".navbar nav a").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

/* Controls */
sourceSelect.addEventListener("change", (e) => selectSource(e.target.value));
targetSelect.addEventListener("change", (e) => { state.target = e.target.value; resetTraversal(); });

document.getElementById("runBtn").addEventListener("click", runTraversal);
document.getElementById("stepBtn").addEventListener("click", stepTraversal);
document.getElementById("pauseBtn").addEventListener("click", () => {
  stopTimer();
  setToast("Traversal paused. Continue with Step or Start.", false);
});
document.getElementById("resetBtn").addEventListener("click", resetTraversal);

speedRange.addEventListener("input", () => {
  updateSpeedLabel();
  if (state.timer) runTraversal();
});

/* Data input */
document.getElementById("loadCustomBtn").addEventListener("click", () => loadGraphFromText(edgeInput.value));
document.getElementById("sampleBtn").addEventListener("click", () => {
  edgeInput.value = SAMPLE_TEXT;
  loadGraphFromText(SAMPLE_TEXT);
});
document.getElementById("clearBtn").addEventListener("click", () => {
  stopTimer();
  state.nodes = [];
  state.edges = [];
  state.layoutReady = false;
  state.source = "";
  state.target = "";
  state.traversal = [];
  state.activeStep = -1;
  populateSelects();
  setNarration();
  renderGraph();
  updateMetrics();
  setToast("Graph cleared. Paste data or add users manually.", false);
});

/* Manual builder */
document.getElementById("addUserBtn").addEventListener("click", () => {
  addNode(newUserInput.value);
  newUserInput.value = "";
});
newUserInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { addNode(newUserInput.value); newUserInput.value = ""; }
});
document.getElementById("addEdgeBtn").addEventListener("click", () => addEdge(edgeFrom.value, edgeTo.value));
document.getElementById("removeEdgeBtn").addEventListener("click", () => {
  const from = edgeFrom.value;
  const to   = edgeTo.value;
  state.edges = state.edges.filter((e) => [e.from, e.to].sort().join("::") !== [from, to].sort().join("::"));
  state.layoutReady = false;
  resetTraversal();
});

/* Drag */
svg.addEventListener("mousemove", (e) => {
  if (!state.dragNode) return;
  const pt = svgPoint(e);
  state.dragNode.x = clamp(pt.x, 62, 978);
  state.dragNode.y = clamp(pt.y, 62, 588);
  state.layoutReady = true;
  renderGraph();
});
svg.addEventListener("mouseup",    () => { state.dragNode = null; });
svg.addEventListener("mouseleave", () => { state.dragNode = null; });

/* ── BOOT ──────────────────────────────────────────────────────────────── */
loadGraphFromText(edgeInput.value);
