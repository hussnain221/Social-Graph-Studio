# SocialGraph Studio

Design and Analysis of Algorithms project for:

**Project 12: Graph Traversal Algorithms for Social Network and Connectivity Analysis**

## How to Run

Open `index.html` in a browser.

No package installation, build command, or backend server is required.

## What Makes It Stronger

This project does not depend on random values. The main graph is created from user-entered social network data.

The graph scene is styled after modern graph database explorers such as Neo4j Browser and Neo4j Bloom: labeled nodes, subtle relationships, active traversal highlights, draggable nodes, community colors, and an exploration-focused canvas.

Users can:

- Paste an edge list or adjacency list.
- Add users manually.
- Add or remove social connections.
- Select a source user and target user.
- Run BFS or DFS with animation.
- Watch the real queue for BFS or real stack for DFS update with enqueue/dequeue and push/pop operations.
- See traversal order, visited users, social distance, components, graph density, and operation estimates.

## Input Formats

Edge list:

```text
Ayesha-Bilal
Bilal-Hina
Hina-Sara
```

Adjacency list:

```text
Ayesha: Bilal, Hina, Sara
Bilal: Usman, Zain
Sara: Noor, Laiba
```

If a name contains spaces, separate neighbors with commas so the parser can distinguish each user clearly.

The app treats every user as a vertex and every relationship as an undirected edge.

## Features

- Interactive social network graph visualization.
- BFS and DFS traversal animation.
- Start, pause, reset, next-step, and speed controls.
- User-entered graph parser.
- Manual graph builder.
- Source-to-target social distance finder.
- Connectivity analysis using connected components.
- Community visualization through graph clustering.
- Influence propagation chart using BFS levels.
- Component size chart.
- Traversal order, operation estimate, density, node count, and edge count.
- Built-in DAA explanation, complexity analysis, and pseudocode.
- Real SVG interface icons inspired by open icon systems, not AI-generated images.

## Presentation Flow

1. Explain that a social network is modeled as a graph.
2. Users are vertices and relationships are edges.
3. Paste a custom graph entered by the teacher or students.
4. Run BFS from a selected user to show influence propagation level by level.
5. Use the target selector to show shortest social distance.
6. Run DFS to show deep exploration and component discovery.
7. Explain that both algorithms run in `O(V + E)` time.
8. Use the charts to discuss graph density, communities, and traversal behavior.

## Final Demo Checklist

- Open `index.html` before the evaluation starts.
- Press **Load sample** if the graph is empty.
- Show that custom data can be pasted in the Data Input section.
- Select **Ayesha** as source and another user as target.
- Run **BFS** first to explain influence propagation.
- Point to the queue panel and explain FIFO behavior.
- Press **Reset**, then run **DFS** to explain deep traversal.
- Point to the stack panel and explain LIFO behavior.
- Point to the complexity report: both algorithms are `O(V + E)`.
- Use the component chart to explain community detection.

## Algorithms

BFS uses a queue and is best for shortest social distance and influence spread.

DFS uses a stack or recursion and is best for deep exploration and connected component analysis.

Neighbor processing is sorted alphabetically in the app. This makes BFS and DFS output deterministic, so the same input graph always produces the same traversal order.
