**SocialGraph Studio Presentation Script**

**Project:** SocialGraph Studio  
**Course:** Design and Analysis of Algorithms (DAA)  
**Teacher:** Mam Mehmona Salam

**Group Members:**

1. Muhammad Umar Javed  
2. Muhammad Husnain  
3. Sunil Romi

---

# Presentation Plan

This project presentation is divided into three equal parts so that each member can present one major section of the project. The parts are balanced in content, technical depth, and algorithm analysis.

- **Member 1** will introduce the project, explain the problem, describe the graph model, and present the input and manual-building features.
- **Member 2** will explain BFS and DFS in detail, including the algorithm logic, traversal steps, queue and stack behavior, and time complexity analysis.
- **Member 3** will demonstrate the interface, analytics, testing, limitations, and conclusion, while also connecting the algorithms to the final output of the system.

---

# 1. Member 1 Presentation Script

## Presenter: Muhammad Umar Javed

## Time Share: About One-Third of the Presentation

### Opening Script

Good morning respected teacher and classmates. I am Muhammad Umar Javed, and I will present the first part of our project, **SocialGraph Studio**.

Our project is an interactive graph visualization system designed for the subject of Design and Analysis of Algorithms. The purpose of this project is to help users understand how graph traversal algorithms work in a social-network style graph. Instead of studying BFS and DFS only from theory, we made a visual tool where a user can create a graph, run algorithms, and see the live result on screen.

### Project Introduction

In a social network, every person can be treated as a **vertex**, and every relationship between two people can be treated as an **edge**. This idea is a real-world example of graph theory. We used this concept to build our application because graphs are one of the most important data structures in DAA.

The main problem we wanted to solve was that students often find graph traversal difficult when they only see it in text or static diagrams. So we created a browser-based tool that makes the traversal process visible and interactive.

### Problem Statement

Our project solves the following problem:

When we have a social network graph, how can we visually explore the relationships, find connected communities, calculate shortest social distance, and observe BFS or DFS step by step?

To answer this, we created an application that:

- reads custom graph input,
- allows manual graph building,
- shows the graph in a live SVG workspace,
- and prepares the graph for traversal and analysis.

### Graph Model Explanation

The graph in our project is **undirected**, which means if one user is connected to another, the relationship is treated as mutual in the visual model. We chose this because social relationships are often better represented as two-way links in classroom examples.

The application accepts two types of input:

1. **Edge list format** like `Ayesha-Bilal`
2. **Adjacency list format** like `Ayesha: Bilal, Hina`

This makes the project flexible and easy to use during a presentation.

### Input and Manual Builder

One of the most useful parts of the project is the **data input section**. In this section, the user can paste a graph or load the sample graph already included in the app.

We also added a **manual builder** where the user can:

- add new users,
- add edges between users,
- remove edges,
- and immediately see the updated graph.

This part is important because it shows that the graph is not random. The system works directly on the data provided by the user.

### Algorithm-Related Analysis for This Part

Even in the input stage, algorithmic thinking is present:

- The parser converts text into nodes and edges.
- Duplicate edges are ignored.
- Self-loops are removed.
- Names are normalized by trimming extra spaces.
- Neighbor order is sorted alphabetically so the output is deterministic.

This is important because graph algorithms like BFS and DFS should behave consistently for the same input during demonstrations.

### Transition to Member 2

After preparing the graph, the next step is to run the traversal algorithms. My teammate will now explain how BFS and DFS work inside the project, how the queue and stack are used, and how the algorithm complexity is analyzed.

---

# 2. Member 2 Presentation Script

## Presenter: Muhammad Husnain

## Time Share: About One-Third of the Presentation

### Opening Script

Thank you. I am Muhammad Husnain, and I will explain the algorithmic core of our project. This part focuses on **Breadth-First Search** and **Depth-First Search**, which are the main algorithms used in SocialGraph Studio.

### BFS Explanation

BFS stands for **Breadth-First Search**. It explores the graph level by level. In our project, BFS is used when we want to understand how influence spreads through the social graph or when we need the shortest path in an unweighted network.

We used a **queue** for BFS because a queue follows **FIFO**:

- the first node added is the first one removed,
- and this makes BFS explore nearby nodes before going deeper.

### BFS Working in Our Project

In our implementation:

1. The source user is placed in the queue.
2. The algorithm removes the front node.
3. It checks all unvisited neighbors.
4. Newly discovered neighbors are added to the queue.
5. Every step is stored so the interface can show the current traversal state.

This is why the app can display:

- the current node,
- the queue contents,
- the visited nodes,
- and the BFS level chart.

### BFS Algorithm Analysis

BFS is useful for:

- shortest path in an unweighted graph,
- influence propagation,
- friend-of-friend discovery,
- and level-order exploration.

Its time complexity is:

**O(V + E)**

because:

- every vertex is visited at most once,
- and every edge is checked a limited number of times.

The space complexity is also important because BFS stores the queue and visited nodes. In worst cases, this can grow with the size of the graph.

### DFS Explanation

DFS stands for **Depth-First Search**. It explores one branch deeply before backtracking. In our project, DFS is used to show long chain traversal and connected component discovery.

We used a **stack** for DFS because a stack follows **LIFO**:

- the last node pushed is the first one removed,
- which makes the algorithm go deeper before moving sideways.

### DFS Working in Our Project

In our implementation:

1. The source user is pushed onto the stack.
2. The top node is removed.
3. If the node is not visited, it is marked as visited.
4. Its neighbors are pushed onto the stack.
5. The full stack state is recorded for animation.

This is why the interface shows:

- the stack contents,
- push and pop actions,
- current step narration,
- and the traversal path.

### DFS Algorithm Analysis

DFS is useful for:

- deep exploration,
- connected component detection,
- cycle understanding,
- and structural analysis of the graph.

Its time complexity is also:

**O(V + E)**

because the algorithm processes each vertex and edge in a systematic traversal.

### Shortest Path and Connected Components

Our project also uses BFS to calculate the **shortest social distance** between a source and a target user. If a path exists, it displays the number of hops and the full path sequence.

For **connected components**, DFS is very useful because it helps us discover groups of users that are internally connected. These groups appear in the analytics panel as communities.

### Transition to Member 3

Now that the algorithm logic is clear, the final part will cover the interface demonstration, analytics, testing, limitations, and conclusion.

---

# 3. Member 3 Presentation Script

## Presenter: Sunil Romi

## Time Share: About One-Third of the Presentation

### Opening Script

Thank you. I am Sunil Romi, and I will present the final part of our project, which focuses on the interface, output, testing, and final evaluation of SocialGraph Studio.

### Interface Demonstration

Our project has four main sections:

- **Studio View** for graph exploration,
- **Data Input View** for pasting or building the graph,
- **Analytics View** for results and charts,
- and **Theory View** for explaining BFS and DFS.

The studio section is the most interactive part. It includes:

- source and target selection,
- BFS and DFS mode switching,
- speed control,
- start, step, pause, and reset buttons,
- queue and stack visualization,
- and current step narration.

### Visualization and Analytics

The graph is drawn using **SVG**, which gives a smooth and scalable visual layout. Nodes are interactive and can be dragged, and the graph highlights source, target, visited, and current nodes clearly.

The analytics section shows:

- number of users,
- number of connections,
- graph density,
- number of communities,
- BFS level chart,
- component chart,
- traversal order,
- and complexity report.

This helps us explain the graph not only visually but also mathematically.


### How the Algorithms Appear in the Interface

When we run BFS:

- the queue is shown live,
- the graph expands level by level,
- and the influence propagation chart is updated.

When we run DFS:

- the stack is shown live,
- the traversal goes deep first,
- and the current step narration explains the backtracking process.

This connection between theory and visual output is the strongest part of our project.

### Testing and Evaluation

We tested the project with different graphs and verified that:

- the graph loads correctly,
- BFS and DFS run correctly,
- shortest path calculation works,
- connected components are detected,
- manual node and edge creation works,
- and the interface updates after each action.

Our observations showed that the project is useful for classroom teaching because students can actually see how graph algorithms behave instead of only reading about them.

### Limitations

The current version has some limitations:

- it supports only unweighted graphs,
- it is undirected,
- it does not save data permanently,
- and it is mainly designed for learning and demonstration.

### Future Improvements

In the future, this project can be improved by:

- adding weighted graphs,
- supporting directed graphs,
- storing graphs in a database,
- adding more algorithms,
- and allowing import/export of graph files.

### Conclusion

In conclusion, SocialGraph Studio is a complete educational DAA project that demonstrates graph traversal in an interactive and easy-to-understand way. It brings together graph modeling, BFS, DFS, shortest path, connected components, and live visualization in one application.

Thank you for listening to our presentation.

---

# Summary of Work Division

| Member | Main Responsibility | Key Algorithm Focus |
| --- | --- | --- |
| Muhammad Umar Javed | Introduction, problem statement, graph model, input system | Graph parsing and deterministic graph preparation |
| Muhammad Husnain | BFS, DFS, queue, stack, traversal logic | O(V + E) analysis, shortest path, connected components |
| Sunil Romi | UI demo, analytics, testing, limitations, conclusion | Practical effect of BFS/DFS in the interface |

---

# Short Delivery Notes

- Speak slowly and clearly.
- Keep the demo balanced so each person gets equal time.
- While one member is speaking, the next member should be ready to take over smoothly.
- If the teacher asks about complexity, mention that both BFS and DFS are **O(V + E)**.
- If asked why the project is strong, explain that it combines theory, visualization, and live interaction in one system.

