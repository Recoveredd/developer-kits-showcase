import type {
  HexCoordinateFormat,
  HexGridMountOptions,
  HexShape,
  MountedHexGrid
} from 'hex-grid-kit';
import { createHexGrid, formatHexCoord, mountHexGrid } from 'hex-grid-kit';
import { byId } from '../shared';

const terrainByAxis = {
  center: '#f8fafc',
  forest: '#86efac',
  clay: '#fed7aa',
  water: '#bfdbfe',
  ridge: '#d8b4fe',
  plain: '#e5e7eb'
} as const;

type Terrain = keyof typeof terrainByAxis;

const capitalImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="#111827"/><path d="M25 61h46v10H25zM31 61V40l17-12 17 12v21" fill="#f8fafc"/><path d="M42 61V47h12v14" fill="#2563eb"/></svg>'
  );

export function renderDemo(): string {
  return `
    <div class="panel input-panel">
      <label for="hex-shape">Shape</label>
      <select id="hex-shape">
        <option value="hexagon" selected>Hexagon</option>
        <option value="rectangle">Rectangle</option>
        <option value="parallelogram">Parallelogram</option>
        <option value="custom">Custom partial board</option>
      </select>
      <div class="control-row">
        <label for="hex-radius">Radius</label>
        <div class="range-control">
          <input id="hex-radius" type="range" min="1" max="5" value="3" />
          <output id="hex-radius-value">3</output>
        </div>
      </div>
      <div class="control-row">
        <label for="hex-cell-size">Cell size</label>
        <div class="range-control">
          <input id="hex-cell-size" type="range" min="18" max="46" value="30" />
          <output id="hex-cell-size-value">30</output>
        </div>
      </div>
      <div class="control-row">
        <label for="hex-orientation">Orientation</label>
        <select id="hex-orientation">
          <option value="pointy" selected>Pointy</option>
          <option value="flat">Flat</option>
        </select>
      </div>
      <div class="control-row">
        <label for="hex-format">Coordinate labels</label>
        <select id="hex-format">
          <option value="cube" selected>Cube q,r,s</option>
          <option value="axial">Axial q,r</option>
        </select>
      </div>
      <label class="check-control">
        <input id="hex-show-labels" type="checkbox" checked />
        <span>Show coordinates</span>
      </label>
      <label class="check-control">
        <input id="hex-fixed-size" type="checkbox" />
        <span>Fixed SVG size</span>
      </label>
    </div>
    <div class="panel output-panel hex-grid-demo-panel">
      <div class="panel-title">Interactive board</div>
      <div id="hex-board" class="hex-grid-board"></div>
      <div id="hex-stats" class="hex-grid-stats"></div>
      <pre id="hex-output" class="code-output small-code"></pre>
    </div>
  `;
}

export function bindDemo(): void {
  const shape = byId<HTMLSelectElement>('hex-shape');
  const radius = byId<HTMLInputElement>('hex-radius');
  const radiusValue = byId<HTMLOutputElement>('hex-radius-value');
  const cellSize = byId<HTMLInputElement>('hex-cell-size');
  const cellSizeValue = byId<HTMLOutputElement>('hex-cell-size-value');
  const orientation = byId<HTMLSelectElement>('hex-orientation');
  const format = byId<HTMLSelectElement>('hex-format');
  const showLabels = byId<HTMLInputElement>('hex-show-labels');
  const fixedSize = byId<HTMLInputElement>('hex-fixed-size');
  const board = byId<HTMLDivElement>('hex-board');
  const stats = byId<HTMLDivElement>('hex-stats');
  const output = byId<HTMLElement>('hex-output');
  let selectedId = '0,0,0';
  let mounted: MountedHexGrid | undefined;

  const update = (): void => {
    radiusValue.value = radius.value;
    cellSizeValue.value = cellSize.value;

    const gridOptions = optionsForShape(shape.value as HexShape, Number(radius.value), Number(cellSize.value));
    const previewGrid = createHexGrid(gridOptions);

    if (!previewGrid.ids.has(selectedId)) {
      selectedId = previewGrid.cells[0]?.id ?? '';
    }

    const mountOptions: HexGridMountOptions = {
      ...gridOptions,
      selectable: true,
      selectedIds: selectedId ? [selectedId] : [],
      showCoordinates: showLabels.checked,
      coordinateFormat: format.value as HexCoordinateFormat,
      svgSize: fixedSize.checked ? 'fixed' : 'responsive',
      cellFill(cell) {
        const terrain = terrainForCell(cell.coord.q, cell.coord.r, cell.coord.s);
        if (terrain === 'center') {
          return { type: 'image', href: capitalImage };
        }
        return terrainByAxis[terrain];
      },
      renderLabel(cell) {
        if (!showLabels.checked) {
          return undefined;
        }
        return formatHexCoord(cell.coord, format.value as HexCoordinateFormat);
      },
      onCellClick(cell) {
        selectedId = cell.id;
        update();
      }
    };

    if (mounted) {
      mounted.update(mountOptions);
    } else {
      mounted = mountHexGrid(board, mountOptions);
    }
    mounted.setSelected(selectedId ? [selectedId] : []);
    renderStats(mounted.grid, selectedId, stats, output);
  };

  shape.addEventListener('change', update);
  radius.addEventListener('input', update);
  cellSize.addEventListener('input', update);
  orientation.addEventListener('change', update);
  format.addEventListener('change', update);
  showLabels.addEventListener('change', update);
  fixedSize.addEventListener('change', update);
  update();

  function optionsForShape(selectedShape: HexShape, selectedRadius: number, selectedCellSize: number): HexGridMountOptions {
    const base = {
      cellSize: selectedCellSize,
      spacing: 1.04,
      orientation: orientation.value as 'pointy' | 'flat',
      data: (coord: { q: number; r: number; s: number }) => ({
        terrain: terrainForCell(coord.q, coord.r, coord.s)
      })
    };

    if (selectedShape === 'rectangle') {
      return { ...base, shape: 'rectangle', columns: selectedRadius + 3, rows: selectedRadius + 2 };
    }

    if (selectedShape === 'parallelogram') {
      return { ...base, shape: 'parallelogram', columns: selectedRadius + 3, rows: selectedRadius + 2 };
    }

    if (selectedShape === 'custom') {
      return {
        ...base,
        shape: 'custom',
        coordinates: [
          { q: 0, r: 0, s: 0, data: { terrain: 'center' } },
          { q: 1, r: -1, s: 0 },
          { q: 1, r: 0, s: -1 },
          { q: 0, r: 1, s: -1 },
          { q: -1, r: 1, s: 0 },
          { q: -1, r: 0, s: 1 },
          { q: 0, r: -1, s: 1 },
          { q: 2, r: -1, s: -1 },
          { q: 2, r: -2, s: 0 },
          { q: -2, r: 1, s: 1 },
          { q: -2, r: 2, s: 0 }
        ]
      };
    }

    return { ...base, shape: 'hexagon', radius: selectedRadius };
  }
}

function terrainForCell(q: number, r: number, s: number): Terrain {
  if (q === 0 && r === 0 && s === 0) {
    return 'center';
  }
  if (q === 0) {
    return 'forest';
  }
  if (r === 0) {
    return 'clay';
  }
  if (s === 0) {
    return 'water';
  }
  if (Math.abs(q) === Math.abs(r)) {
    return 'ridge';
  }
  return 'plain';
}

function renderStats(grid: ReturnType<typeof createHexGrid>, selectedId: string, target: HTMLElement, output: HTMLElement): void {
  const selected = grid.getCell(selectedId);
  const neighbors = selected ? grid.neighborsOf(selected.id) : [];
  const ring = selected ? grid.ring(selected.id, 2) : [];

  target.innerHTML = `
    <span>${grid.cells.length} cells</span>
    <span>${selected ? `Selected ${selected.id}` : 'No selection'}</span>
    <span>${neighbors.length} neighbors</span>
    <span>${ring.length} cells in ring 2</span>
  `;
  output.textContent = JSON.stringify(
    {
      selected: selected
        ? {
            id: selected.id,
            coord: selected.coord,
            data: selected.data,
            center: selected.center
          }
        : null,
      neighbors: neighbors.map((cell) => cell.id),
      lineToOrigin: selected ? grid.line(selected.id, '0,0,0').map((cell) => cell.id) : []
    },
    null,
    2
  );
}
