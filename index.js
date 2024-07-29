const grid_div = document.querySelector(".board");
const grid = [];
const starting_node = [8, 10];
const delay = 20;
const target_node = [8, 33];
let change_pos = false;
let node_selected;
let clicked = false;

document.addEventListener("mouseup", () => {
  clicked = false;
});

document.addEventListener("mousedown", () => {
  clicked = true;
});

function Node(element) {
  this.element = element;
  this.wall = false;
  this.start = false;
  this.target = false;
  this.r;
  this.c;

  this.turnWall = () => {
    if (this.start || this.target) return;
    this.element.classList.add("wall");
    this.wall = true;
  };

  this.undoWall = () => {
    if (this.start) return;
    this.element.classList.remove("wall");
    this.wall = false;
  };
}

function PriorityQueue(c) {
  this.collection = [];
  this.c = c;

  this.enqueue = function (newItem) {
    if (this.isEmpty()) {
      return this.collection.push(newItem);
    }

    let target = newItem[this.c];

    const search = () => {
      let left = 0;
      let right = this.size() - 1;

      while (left < right) {
        let mid = Math.floor((left + right) / 2);

        if (target < this.collection[mid][this.c]) {
          right = mid - 1;
        } else if (target > this.collection[mid][this.c]) {
          left = mid + 1;
        } else {
          return mid;
        }
      }

      if (target > this.collection[left][this.c]) {
        return left + 1;
      }

      return left;
    };

    if (target <= this.collection[0][this.c]) {
      this.collection.unshift(newItem);
    } else if (target >= this.collection[this.size() - 1][this.c]) {
      this.collection.push(newItem);
    } else {
      this.collection.splice(search(), 0, newItem);
    }
  };

  this.dequeue = function () {
    if (!this.isEmpty()) return this.collection.shift();
    return false;
  };

  this.pop = function () {
    if (!this.isEmpty()) return this.collection.pop();
    return false;
  };
  this.size = function () {
    return this.collection.length;
  };
  this.front = function () {
    return this.collection[0][0];
  };
  this.isEmpty = function () {
    return this.size() > 0 ? false : true;
  };
}

//Init and interactions
function createBoard(r, c) {
  for (let i = 0; i < r; i++) {
    let row = document.createElement("div");
    let row_grid = [];
    row.className = "row";

    for (let j = 0; j < c; j++) {
      let node_div = document.createElement("div");
      node_div.className = "node";
      node_div.setAttribute("data_row", i);
      node_div.setAttribute("data_col", j);

      let node = new Node(node_div);

      node.element.addEventListener("click", function () {
        if (change_pos) {
          if (node.wall) return;

          let [get_row_id, get_col_id] = getDivId(this);

          if (node_selected.start) {
            changeStartingNode([get_row_id, get_col_id]);
          } else {
            changeTargetNode([get_row_id, get_col_id]);
          }

          node_selected.element.classList.remove("selected");
          grid[get_row_id][get_col_id].element.classList.remove("picked");
          change_pos = false;
        } else if (node.start || node.target) {
          change_pos = true;
          node_selected = node;
          node_selected.element.classList.add("selected");
        } else {
          if (!node.wall) {
            node.turnWall();
          } else {
            node.undoWall();
          }
        }
      });

      node.element.addEventListener("mouseenter", function () {
        if (change_pos) {
          if (!checkIfValidHover(this)) return;
          this.classList.add("picked");
          return;
        }

        if (!clicked || node.target || node.start) return;

        if (!node.wall) {
          node.turnWall();
        } else {
          node.undoWall();
        }
      });

      node.element.addEventListener("mouseleave", function () {
        this.classList.remove("picked");
      });

      node.r = i;
      node.c = j;

      row_grid.push(node);
      row.appendChild(node.element);
    }
    grid.push(row_grid);
    grid_div.appendChild(row);
  }
}

function checkIfValidHover(element) {
  let get_id = getDivId(element);
  let node_based_on_id = grid[get_id[0]][get_id[1]];
  return !node_based_on_id.wall;
}

function getDivId(element) {
  let get_row_id = parseInt(element.getAttribute("data_row"));
  let get_col_id = parseInt(element.getAttribute("data_col"));
  return [get_row_id, get_col_id];
}

function changeStartingNode(new_pos) {
  node_selected.element.classList.remove("start");
  node_selected.start = false;
  let [new_row, new_col] = new_pos;

  grid[new_row][new_col].element.classList.add("start");
  grid[new_row][new_col].start = true;

  starting_node[0] = new_row;
  starting_node[1] = new_col;
}

function changeTargetNode(new_pos) {
  node_selected.element.classList.remove("target");
  node_selected.target = false;
  let [new_row, new_col] = new_pos;

  grid[new_row][new_col].element.classList.add("target");
  grid[new_row][new_col].target = true;

  target_node[0] = new_row;
  target_node[1] = new_col;
}

function clearPath() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (
        grid[i][j].element.classList.contains("visited") ||
        grid[i][j].element.classList.contains("path")
      ) {
        grid[i][j].element.classList = "node";
      }
    }
  }
}

function clearBoard() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (!(grid[i][j].start || grid[i][j].target)) {
        grid[i][j].element.classList = "node";
      }
      grid[i][j].wall = false;
    }
  }
}

function visualizeAlgo() {
  clearPath();
  let getVal = document.querySelector(".algos");
  switch (getVal.value) {
    case "a_star":
      A_star();
      break;
    case "dijkstra":
      dijkstra();
      break;
    case "bfs":
      bfs();
      break;
  }
}

async function generateMaze() {
  clearBoard();
  let getVal = document.querySelector(".mazes");
  switch (getVal.value) {
    case "r_division":
      await recursiveDivision();
      break;
    case "prim":
      await prims_maze();
      break;
    case "r_backtracker":
      await dfs_maze();
      break;
  }
}

//Algorithms
function explore_neigh(r, c, visited = null) {
  let dr = [-1, 1, 0, 0];
  let dc = [0, 0, 1, -1];
  let result = [];
  for (let i = 0; i < 4; i++) {
    let rr = r + dr[i];
    let cc = c + dc[i];
    if (rr < 0 || rr >= grid.length || cc < 0 || cc >= grid[0].length) continue;
    if (grid[rr][cc].wall) continue;
    if (visited != null && visited[rr][cc] == true) {
      continue;
    }
    result.push(grid[rr][cc]);
  }

  return result;
}

//Breadth first search
async function bfs() {
  const queue = [[grid[starting_node[0]][starting_node[1]]]];
  const visited = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(false));
  let result;
  let reached_end = false;
  while (queue.length) {
    let size = queue.length;

    for (let i = 0; i < size; i++) {
      let curr = queue.shift();
      let front = curr[curr.length - 1];
      if (front.target) {
        reached_end = true;
        result = curr;
        break;
      }

      let neigh = explore_neigh(front.r, front.c, visited);

      for (let n of neigh) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, delay)
        );

        if (
          !(n.r == starting_node[0] && n.c == starting_node[1]) &&
          !(n.r == target_node[0] && n.c == target_node[1])
        )
          n.element.classList.add("visited");
        visited[n.r][n.c] = true;
        queue.push([...curr, n]);
      }
    }

    if (reached_end) break;
  }

  for (let i = 1; i < result.length - 1; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay)
    );

    result[i].element.classList.remove("visited");
    result[i].element.classList.add("path");
  }

  return result;
}

//Dijkstra
function construct_parents_path(parents) {
  let result = [];
  let curr = parents[target_node[0]][target_node[1]];
  while (curr != null) {
    result.unshift(curr);
    curr = parents[curr.r][curr.c];
  }
  return result;
}

async function dijkstra() {
  const distances = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(Infinity));

  const parents = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(null));

  const visited = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(false));

  const queue = new PriorityQueue(1);

  let reached_end = false;

  distances[starting_node[0]][starting_node[1]] = 0;

  queue.enqueue([grid[starting_node[0]][starting_node[1]], 0]);

  while (!queue.isEmpty()) {
    let [node, node_distance] = queue.dequeue();

    let neigh = explore_neigh(node.r, node.c, visited);
    4;
    for (let n of neigh) {
      let new_distance = node_distance + 1;

      if (new_distance < distances[n.r][n.c]) {
        distances[n.r][n.c] = new_distance;
        parents[n.r][n.c] = node;
      }

      await new Promise((resolve) =>
        setTimeout(() => {
          resolve();
        }, delay)
      );

      if (n.target) {
        reached_end = true;
        break;
      }

      if (
        !(n.r == starting_node[0] && n.c == starting_node[1]) &&
        !(n.r == target_node[0] && n.c == target_node[1])
      )
        n.element.classList.add("visited");
      visited[n.r][n.c] = true;
      queue.enqueue([n, distances[n.r][n.c]]);
    }

    if (reached_end) break;
  }

  let path = construct_parents_path(parents);
  for (let i = 1; i < path.length; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay)
    );
    path[i].element.classList.remove("visited");
    path[i].element.classList.add("path");
  }
}

//A*
function calc_heuristic(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

async function A_star() {
  const openSet = new PriorityQueue(1);
  const els_in_set = new Set();

  const start = grid[starting_node[0]][starting_node[1]];
  const end = grid[target_node[0]][target_node[1]];

  const parents = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(null));

  const gScore = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(Infinity));

  gScore[start.r][start.c] = 0;

  const fScore = new Array(grid.length)
    .fill(0)
    .map((e) => new Array(grid[0].length).fill(Infinity));

  fScore[start.r][start.c] = calc_heuristic(start, end);

  openSet.enqueue([start, 0]);
  els_in_set.add(start.r + "," + start.c);

  while (!openSet.isEmpty()) {
    let [node, f_score] = openSet.dequeue();

    if (node.target) {
      let path = construct_parents_path(parents);
      for (let i = 1; i < path.length; i++) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, delay)
        );

        path[i].element.classList.remove("visited");
        path[i].element.classList.add("path");
      }
      return;
    }

    els_in_set.delete(node.r + "," + node.c);

    let neigh = explore_neigh(node.r, node.c);

    for (let n of neigh) {
      let tentative_g_score = gScore[node.r][node.c] + 1;

      if (tentative_g_score < gScore[n.r][n.c]) {
        parents[n.r][n.c] = node;
        gScore[n.r][n.c] = tentative_g_score;
        fScore[n.r][n.c] = gScore[n.r][n.c] + calc_heuristic(n, end);
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, delay)
        );
        if (
          !(n.r == starting_node[0] && n.c == starting_node[1]) &&
          !(n.r == target_node[0] && n.c == target_node[1])
        )
          n.element.classList.add("visited");
        if (!els_in_set.has(n.r + "," + n.c)) {
          openSet.enqueue([n, fScore[n.r][n.c]]);
          els_in_set.add(n.r + "," + n.c);
        }
      }
    }
  }
  return;
}

//Maze generator algorithm

//Recursive division
async function recursiveDivision() {
  for (let i = 0; i < grid[0].length; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay)
    );

    grid[0][i].turnWall();
    grid[grid.length - 1][i].turnWall();
  }

  for (let i = 1; i < grid.length - 1; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay)
    );
    grid[i][0].turnWall();
    grid[i][grid[0].length - 1].turnWall();
  }

  addInnerWalls(
    Math.floor(Math.random() * 2),
    1,
    grid[0].length - 2,
    1,
    grid.length - 2
  );
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function addInnerWalls(h, minX, maxX, minY, maxY) {
  if (h) {
    if (maxX - minX + 1 < 2) {
      return;
    }

    var y = Math.floor(randomNumber(minY, maxY) / 2) * 2;
    await addHWall(minX, maxX, y);

    addInnerWalls(!h, minX, maxX, minY, y - 1);
    addInnerWalls(!h, minX, maxX, y + 1, maxY);
  } else {
    if (maxY - minY + 1 < 2) {
      return;
    }

    var x = Math.floor(randomNumber(minX, maxX) / 2) * 2;
    await addVWall(minY, maxY, x);

    addInnerWalls(!h, minX, x - 1, minY, maxY);
    addInnerWalls(!h, x + 1, maxX, minY, maxY);
  }
}

async function addHWall(minX, maxX, y) {
  var hole = Math.floor(randomNumber(minX, maxX) / 2) * 2 + 1;

  for (var i = minX; i <= maxX; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay)
    );
    if (i == hole) {
      grid[y][i].undoWall();
    } else if (grid[y][i].target || grid[y][i].start) {
      continue;
    } else {
      grid[y][i].turnWall();
    }
  }
}

async function addVWall(minY, maxY, x) {
  var hole = Math.floor(randomNumber(minY, maxY) / 2) * 2 + 1;

  for (var i = minY; i <= maxY; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, delay)
    );
    if (i == hole) {
      grid[i][x].undoWall();
    } else if (grid[i][x].target || grid[i][x].start) {
      continue;
    } else {
      grid[i][x].turnWall();
    }
  }
}

//Prim algorithm
async function fillWalls() {
  for (let i = 0; i < grid.length; i++) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, 150)
    );
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j].start || grid[i][j].target) continue;
      grid[i][j].turnWall();
    }
  }
}

async function prims_explore_neighbours(r, c, pathSet) {
  let neigh = 0;
  let dr = [-2, 2, 0, 0];
  let dc = [0, 0, 2, -2];

  for (let i = 0; i < 4; i++) {
    let rr = r + dr[i];
    let cc = c + dc[i];
    if (rr < 0 || rr >= grid.length || cc < 0 || cc >= grid[0].length) continue;
    if (!grid[rr][cc].wall) continue;

    neigh++;

    if (randomNumber(0, 1) == 1) {
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve();
        }, 30)
      );

      grid[rr][cc].undoWall();
      pathSet.push(grid[rr][cc]);
      if (dr[i] != 0) {
        if (dr[i] < 0) {
          grid[rr + 1][cc].undoWall();
        } else {
          grid[rr - 1][cc].undoWall();
        }
      } else {
        if (dc[i] < 0) {
          grid[rr][cc + 1].undoWall();
        } else {
          grid[rr][cc - 1].undoWall();
        }
      }

      break;
    }
  }
  return neigh;
}

function pickRandomNode() {
  let random_row = Math.floor(Math.random() * grid.length);
  let random_col = Math.floor(Math.random() * grid[0].length);

  while (
    grid[random_row][random_col].start ||
    grid[random_row][random_col].target
  ) {
    random_row = Math.floor(Math.random() * grid.length);
    random_col = Math.floor(Math.random() * grid[0].length);
  }

  return grid[random_row][random_col];
}

async function prims_maze() {
  const random_start = pickRandomNode();

  await fillWalls();

  const pathSet = [random_start];

  random_start.undoWall();

  while (pathSet.length) {
    let random_idx = randomNumber(0, pathSet.length - 1);
    let random_cell = pathSet[random_idx];
    let neigh = await prims_explore_neighbours(
      random_cell.r,
      random_cell.c,
      pathSet
    );
    if (neigh == 0) {
      pathSet.splice(random_idx, 1);
    }
  }
  grid[starting_node[0]][starting_node[1]].wall = false;
  grid[starting_node[0]][starting_node[1]].element.classList.remove("wall");

  grid[target_node[0]][target_node[1]].wall = false;
  grid[target_node[0]][target_node[1]].element.classList.remove("wall");
}

//Recurivve backtracking
async function dfs(curr) {
  curr.undoWall();

  const neigh = [];

  let dr = [-2, 2, 0, 0];
  let dc = [0, 0, 2, -2];

  for (let i = 0; i < 4; i++) {
    let rr = curr.r + dr[i];
    let cc = curr.c + dc[i];
    if (rr < 0 || rr >= grid.length || cc < 0 || cc >= grid[0].length) continue;
    if (!grid[rr][cc].wall) continue;
    if (dr[i] != 0) {
      if (dr[i] < 0) {
        neigh.push([grid[rr][cc], grid[rr + 1][cc]]);
      } else {
        neigh.push([grid[rr][cc], grid[rr - 1][cc]]);
      }
    } else {
      if (dc[i] < 0) {
        neigh.push([grid[rr][cc], grid[rr][cc + 1]]);
      } else {
        neigh.push([grid[rr][cc], grid[rr][cc - 1]]);
      }
    }
  }

  while (neigh.length) {
    let random_idx = randomNumber(0, neigh.length - 1);
    let random_neigh = neigh[random_idx];
    neigh.splice(random_idx, 1);

    if (!random_neigh[0].wall) continue;

    await new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, 30)
    );

    random_neigh[1].undoWall();
    await dfs(random_neigh[0]);
  }
}

async function dfs_maze() {
  const random_node = pickRandomNode();
  await fillWalls();
  await dfs(random_node);
}

createBoard(19, 45);

grid[starting_node[0]][starting_node[1]].start = true;
grid[starting_node[0]][starting_node[1]].element.classList.add("start");

grid[target_node[0]][target_node[1]].target = true;
grid[target_node[0]][target_node[1]].element.classList.add("target");
