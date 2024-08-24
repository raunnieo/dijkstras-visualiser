const rows = 48;
const cols = 64;
const grid = [];
let startCell = null;
let endCell = null;
let isRunning = false;
let startTime = 0;
let animationSpeed = 100; // Default speed

// Initialize grid
function createGrid() {
    const gridElement = document.getElementById('grid');
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            gridElement.appendChild(cell);
            row.push(cell);
        }
        grid.push(row);
    }
}

// Handle cell clicks
function handleCellClick(event) {
    const cell = event.target;

    if (!startCell) {
        startCell = cell;
        cell.classList.add('start');
    } else if (!endCell) {
        endCell = cell;
        cell.classList.add('end');
    } else {
        cell.classList.toggle('wall');
    }
}

// Dijkstra's Algorithm with Animation
async function dijkstra() {
    if (!startCell || !endCell || isRunning) return;
    
    isRunning = true;
    const queue = [startCell];
    const visited = new Set();
    const prev = new Map();

    const [startRow, startCol] = [parseInt(startCell.dataset.row), parseInt(startCell.dataset.col)];
    const [endRow, endCol] = [parseInt(endCell.dataset.row), parseInt(endCell.dataset.col)];

    visited.add(startCell);
    startTime = performance.now();

    while (queue.length > 0) {
        const current = queue.shift();
        const [row, col] = [parseInt(current.dataset.row), parseInt(current.dataset.col)];

        if (current === endCell) {
            let temp = current;
            while (prev.has(temp)) {
                temp.classList.add('path');
                temp = prev.get(temp);
                await delay(calculateDelay()); // Animation for path tracing
            }
            endCell.classList.add('end'); // Reapply end color
            showTime();
            isRunning = false;
            return;
        }

        const neighbors = getNeighbors(row, col);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && !neighbor.classList.contains('wall')) {
                visited.add(neighbor);
                prev.set(neighbor, current);
                queue.push(neighbor);
                neighbor.classList.add('visited');
                await delay(calculateDelay()); // Animation delay
            }
        }
    }

    alert('No solution found');
    isRunning = false;
}

// Get valid neighbors
function getNeighbors(row, col) {
    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]); // Up
    if (row < rows - 1) neighbors.push(grid[row + 1][col]); // Down
    if (col > 0) neighbors.push(grid[row][col - 1]); // Left
    if (col < cols - 1) neighbors.push(grid[row][col + 1]); // Right
    return neighbors;
}

// Reset grid
function resetGrid() {
    if (isRunning) return;
    for (const row of grid) {
        for (const cell of row) {
            cell.className = 'cell';
        }
    }
    startCell = null;
    endCell = null;
    document.getElementById('time').textContent = '0';
}

// Display time taken
function showTime() {
    const endTime = performance.now();
    const timeTaken = Math.round(endTime - startTime);
    document.getElementById('time').textContent = timeTaken;
}


// Calculate delay based on speed slider
function calculateDelay() {
    return 30 - animationSpeed; // Invert the scale so higher value means faster
}

// Delay function for animation
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update animation speed
function updateSpeed() {
    animationSpeed = parseInt(document.getElementById('speed').value);
}

// Event listeners
document.getElementById('reset').addEventListener('click', resetGrid);
document.getElementById('solve').addEventListener('click', dijkstra);
document.getElementById('speed').addEventListener('input', updateSpeed);

// Initialize the grid when the page loads
createGrid();
updateSpeed();
