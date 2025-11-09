import { Tile, Unit, GameState } from '../types';

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost
  parent: PathNode | null;
}

export class Pathfinding {
  // A* pathfinding algorithm
  static findPath(
    start: {x: number; y: number},
    end: {x: number; y: number},
    unit: Unit,
    state: GameState
  ): Array<{x: number; y: number}> {
    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      const currentKey = `${current.x},${current.y}`;

      // Reached destination
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      // Check neighbors
      const neighbors = this.getNeighbors(current, state, unit);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(neighborKey)) {
          continue;
        }

        const moveCost = this.getMoveCost(
          state.map[neighbor.y][neighbor.x],
          unit
        );
        const tentativeG = current.g + moveCost;

        const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existingNode) {
          const h = this.heuristic(neighbor, end);
          const newNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current
          };
          openSet.push(newNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }

    // No path found
    return [];
  }

  private static heuristic(a: {x: number; y: number}, b: {x: number; y: number}): number {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private static reconstructPath(node: PathNode): Array<{x: number; y: number}> {
    const path: Array<{x: number; y: number}> = [];
    let current: PathNode | null = node;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    // Remove starting position
    path.shift();

    return path;
  }

  private static getNeighbors(
    node: PathNode,
    state: GameState,
    unit: Unit
  ): Array<{x: number; y: number}> {
    const neighbors: Array<{x: number; y: number}> = [];
    const directions = [
      [0, -1], [1, 0], [0, 1], [-1, 0] // 4-directional movement
    ];

    for (const [dx, dy] of directions) {
      const x = node.x + dx;
      const y = node.y + dy;

      if (x >= 0 && x < state.config.mapWidth && y >= 0 && y < state.config.mapHeight) {
        const tile = state.map[y][x];

        // Check if tile is passable
        if (this.isPassable(tile, unit, state)) {
          neighbors.push({ x, y });
        }
      }
    }

    return neighbors;
  }

  private static isPassable(tile: Tile, unit: Unit, state: GameState): boolean {
    // Mountains are impassable (except for special units)
    if (tile.terrain === 'mountains') {
      return false;
    }

    // Ocean is impassable for land units (for now)
    if (tile.terrain === 'ocean') {
      return false;
    }

    // Can't move through enemy units (except combat)
    if (tile.unitId) {
      const tileUnit = state.players
        .flatMap(p => p.units)
        .find(u => u.id === tile.unitId);

      if (tileUnit && tileUnit.ownerId !== unit.ownerId) {
        return false;
      }
    }

    return true;
  }

  private static getMoveCost(tile: Tile, unit: Unit): number {
    // Base cost
    let cost = 1;

    // Terrain modifiers
    switch (tile.terrain) {
      case 'hills':
      case 'forest':
      case 'jungle':
        cost = 2;
        break;
      case 'desert':
      case 'tundra':
        cost = 1.5;
        break;
    }

    // Rivers add extra cost
    if (tile.hasRiver) {
      cost += 0.5;
    }

    return cost;
  }

  // Calculate valid move range for a unit
  static getValidMoves(unit: Unit, state: GameState): Set<string> {
    const validMoves = new Set<string>();
    const queue: Array<{x: number; y: number; movesLeft: number}> = [];
    const visited = new Set<string>();

    queue.push({ x: unit.x, y: unit.y, movesLeft: unit.movement });

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (current.x !== unit.x || current.y !== unit.y) {
        validMoves.add(key);
      }

      if (current.movesLeft <= 0) continue;

      const neighbors = this.getNeighbors(current, state, unit);

      for (const neighbor of neighbors) {
        const tile = state.map[neighbor.y][neighbor.x];
        const moveCost = this.getMoveCost(tile, unit);

        if (current.movesLeft >= moveCost) {
          queue.push({
            x: neighbor.x,
            y: neighbor.y,
            movesLeft: current.movesLeft - moveCost
          });
        }
      }
    }

    return validMoves;
  }
}
