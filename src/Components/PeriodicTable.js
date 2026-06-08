import React, {
  useState,
  useMemo,
  useCallback,
  useRef
} from "react";
import elementsData from "../Data/elementsData";
import "./PeriodicTable.css";
import getBlockColor from "./blockColor";
import SmallBox from "./SmallBox";
import SearchBar from "./SearchBar";
import AdvancedFilterPanel, { classifyElement } from "./AdvancedFilterPanel";
import { useElement } from "../contexts/ElementContext";

import {
  getMainElements,
  getLanthanides,
  getActinides,
} from "./filterBlocks";


const PeriodicTable = ({ temperature = 300 }) => {
  const { selectedElement, setSelectedElement } = useElement();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    period: "all",
    group: "all",
    phases: [],
    electronAffinity: "all",
    category: "all",
    classify: classifyElement,
  });

  const [hoveredBlock, setHoveredBlock] = useState(null);

  // Tooltip state
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: "top" });
  const hoverTimeoutRef = useRef(null);
  const elementRefs = useRef({});
  const tableRef = useRef(null);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSelectElement = useCallback((element) => {
    setSelectedElement(element);
    const ref = elementRefs.current[element.number];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      ref.classList.add("element-pulse");
      setTimeout(() => ref.classList.remove("element-pulse"), 1200);
    }
  }, [setSelectedElement]);

  // Tooltip handlers
  const showTooltip = useCallback((element, event) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    const rect = event.currentTarget.getBoundingClientRect();
    const tableRect = tableRef.current?.getBoundingClientRect();

    if (!tableRect) return;

    const tooltipWidth = 240;
    const tooltipHeight = 120;
    const gap = 12;

    let x = rect.left + rect.width / 2 - tableRect.left;
    let y = rect.top - tableRect.top - gap;
    let placement = "top";

    if (rect.top - tableRect.top < tooltipHeight + 10) {
      y = rect.bottom - tableRect.top + gap;
      placement = "bottom";
    }

    x = Math.max(
      tooltipWidth / 2 + 8,
      Math.min(x, tableRect.width - tooltipWidth / 2 - 8)
    );

    setHoveredElement(element);
    setTooltipPosition({ x, y, placement });
    setTooltipVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setTooltipVisible(false);
    setHoveredElement(null);
  }, []);

  const getElementGalleryUrl = useCallback((element) => {
    const query = encodeURIComponent(`${element.name} element`);
    return `https://commons.wikimedia.org/w/index.php?search=${query}&title=Special:MediaSearch&type=image`;
  }, []);

  const getPhase = useCallback((element) => {
    if (element.melt == null || element.boil == null) {
      return "unknown";
    }

    if (temperature < element.melt) {
      return "solid";
    }

    if (temperature < element.boil) {
      return "liquid";
    }

    return "gas";
  }, [temperature]);

  const matchesElectronAffinity = useCallback((element, range) => {
    if (!range || range === "all") return true;
    if (element.electron_affinity == null) return false;

    switch (range) {
      case "high-positive":
        return element.electron_affinity > 100;
      case "positive":
        return element.electron_affinity >= 0 && element.electron_affinity <= 100;
      case "low":
        return element.electron_affinity < 0;
      default:
        return true;
    }
  }, []);

  // Determine if an element matches current search + filters
  const isElementVisible = useCallback(
    (element) => {
      const isBlockMatched = !hoveredBlock || element.block === hoveredBlock;
      if (!isBlockMatched) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          element.name.toLowerCase().includes(q) ||
          element.symbol.toLowerCase().includes(q) ||
          element.number.toString() === q;
        if (!matchesSearch) return false;
      }

      if (filters.type !== "all") {
        const classification = filters.classify(element.category);
        if (classification !== filters.type) return false;
      }

      if (filters.period !== "all") {
        if (element.period !== filters.period) return false;
      }

      if (filters.group !== "all") {
        if (element.group !== filters.group) return false;
      }

      // Physical phase filter
      if (filters.phases?.length) {
        if (!filters.phases.includes(getPhase(element))) return false;
      }

      // Electron affinity filter
      if (!matchesElectronAffinity(element, filters.electronAffinity)) {
        return false;
      }

      // Category filter
      if (filters.category && filters.category !== "all") {
        if (element.category !== filters.category) return false;
      }

      return true;
    },
    [searchQuery, filters, hoveredBlock, getPhase, matchesElectronAffinity]
  );

  const mainElements = useMemo(() => getMainElements(elementsData), []);
  const lanthanides = useMemo(() => getLanthanides(elementsData), []);
  const actinides = useMemo(() => getActinides(elementsData), []);

  const visibleCount = useMemo(() => {
    return elementsData.filter(isElementVisible).length;
  }, [isElementVisible]);

  const hasActiveFilters =
    searchQuery ||
    filters.type !== "all" ||
    filters.period !== "all" ||
    filters.group !== "all" ||
    filters.phases?.length > 0 ||
    filters.electronAffinity !== "all" ||
    filters.category !== "all";

  // Render element cell
const getPhaseIcon = (phase) => {
  switch (phase) {
    case "solid":
      return "🧊";
    case "liquid":
      return "💧";
    case "gas":
      return "☁️";
    default:
      return "❓";
  }
};
  const renderElement = (element, gridStyle = {}) => {
    const visible = isElementVisible(element);
    const isSelected = selectedElement && selectedElement.number === element.number;
    const phase = getPhase(element);

    return (
      <div
        key={element.number}
        ref={(el) => (elementRefs.current[element.number] = el)}
        className={`element
${!visible ? "element-hidden" : ""}
${isSelected ? "element-selected" : ""}
phase-${phase}`}
        style={{
          ...gridStyle,
          backgroundColor: visible
  ? phase === "solid"
    ? "#bfdbfe"
    : phase === "liquid"
    ? "#a5f3fc"
    : phase === "gas"
    ? "#fed7aa"
    : getBlockColor(element.block)
  : undefined,
        }}
        onClick={() => {
          if (visible) handleElementClick(element);
        }}
        onMouseEnter={visible ? (e) => showTooltip(element, e) : undefined}
        onMouseLeave={hideTooltip}
        onFocus={visible ? (e) => showTooltip(element, e) : undefined}
        onBlur={hideTooltip}
        tabIndex={visible ? 0 : -1}
        title={visible ? `${element.name} (${element.symbol}) - #${element.number}` : ""}
      >
       <strong className={`element-block ${element.block}`}>
  {element.symbol}
</strong>

<span className="atomic-number">
  {element.number}
</span>

<span className="phase-icon">
  {getPhaseIcon(phase)}
</span>
       </div>
    );
  };

  return (
    <div className="periodic-table-wrapper">
      {/* Controls Bar */}
      <div className="controls-bar">
        <SearchBar
          elements={elementsData}
          onSearch={handleSearch}
          onSelectElement={handleSelectElement}
        />
        {hasActiveFilters && (
          <div className="results-count">
            <span className="results-count-number">{visibleCount}</span>
            <span className="results-count-label">
              of {elementsData.length} elements
            </span>
          </div>
        )}
        <AdvancedFilterPanel onFilterChange={handleFilterChange} />
      </div>

      {/* Legend */}
      <div className="box-container">
        <div
          className="legend-item"
          onMouseEnter={() => setHoveredBlock('s')}
          onMouseLeave={() => setHoveredBlock(null)}
          style={{ cursor: 'pointer' }}
        >
          <SmallBox color="skyblue" />
          <span>s block</span>
        </div>
        <div
          className="legend-item"
          onMouseEnter={() => setHoveredBlock('d')}
          onMouseLeave={() => setHoveredBlock(null)}
          style={{ cursor: 'pointer' }}
        >
          <SmallBox color="orange" />
          <span>d block</span>
        </div>
        <div
          className="legend-item"
          onMouseEnter={() => setHoveredBlock('p')}
          onMouseLeave={() => setHoveredBlock(null)}
          style={{ cursor: 'pointer' }}
        >
          <SmallBox color="#4ade80" />
          <span>p block</span>
        </div>
        <div
          className="legend-item"
          onMouseEnter={() => setHoveredBlock('f')}
          onMouseLeave={() => setHoveredBlock(null)}
          style={{ cursor: 'pointer' }}
        >
          <SmallBox color="#a78bfa" />
          <span>f block</span>
        </div>
      </div>

      {/* Main Periodic Table */}
      <div className="periodic-table" ref={tableRef}>
        {mainElements.map((element) =>
          renderElement(element, {
            gridColumn: element.group,
            gridRow: element.period,
          })
        )}
        
        {/* ADVANCED HOVER TOOLTIP */}
        {hoveredElement && tooltipVisible && (
          <div
            className={`element-tooltip ${tooltipPosition.placement}`}
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
            onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)}
            onMouseLeave={hideTooltip}
            role="tooltip"
            aria-label={`${hoveredElement.name} details`}
          >
            <div className="tooltip-header">
              <div className="tooltip-symbol" style={{ backgroundColor: getBlockColor(hoveredElement.block) }}>
                {hoveredElement.symbol}
              </div>
              <div>
                <div className="tooltip-name">{hoveredElement.name}</div>
                <div className="tooltip-number">#{hoveredElement.number}</div>
              </div>
            </div>
            <div className="tooltip-details">
              <div className="tooltip-row">
                <span>Mass:</span>
                <span>{hoveredElement.atomic_mass ? parseFloat(hoveredElement.atomic_mass).toFixed(3) : "—"}</span>
              </div>
              {hoveredElement.category && (
                <div className="tooltip-row">
                  <span>Type:</span>
                  <span>{hoveredElement.category}</span>
                </div>
              )}
              <div className="tooltip-row">
                <span>Block:</span>
                <span>{hoveredElement.block}</span>
              </div>
            </div>
            <div className={`tooltip-arrow ${tooltipPosition.placement}`}></div>
          </div>
        )}
      </div>

      {/* Lanthanides Row */}
      <div className="f-block">
        {lanthanides.map((element, index) =>
          renderElement(element, {
            gridColumn: index + 4,      
          })
        )}
      </div>

      {/* Actinides Row */}
      <div className="f-block">
        {actinides.map((element, index) =>
          renderElement(element, {
            gridColumn: index + 4,
          })
        )}
      </div>
    </div>
  );
};

export default PeriodicTable;
