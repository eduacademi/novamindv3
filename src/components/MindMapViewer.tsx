import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Network,
  Brain,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Calendar,
  Eye,
  FolderTree,
  Folder,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Check,
  Feather,
  Cpu,
  Info,
  X,
  PenTool,
  Paperclip,
  Bookmark,
  Tag
} from "lucide-react";
import { Card, MindMapData, MindMapNode, Platform } from "../types";
import { getCachedMindMap, saveCachedMindMap } from "../lib/storage";
import { decodeHTMLEntities } from "../lib/textHelper";
import { PLATFORMS } from "../lib/platformHelper";

interface MindMapViewerProps {
  cards: Card[];
  selectedCardIds: string[];
  onClearSelectedCards: () => void;
  onOpenPreview?: (card: Card) => void;
  onOpenReader?: (card: Card) => void;
}

interface DateGroup {
  dateKey: string;
  displayDate: string;
  cards: Card[];
}

// Graph Node representation for Canvas Neural Physics
interface GraphNode {
  id: string;
  label: string;
  type: "root" | "category" | "card";
  category?: string;
  platform?: Platform;
  card?: Card;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connections: string[]; // Connected Node IDs
  note?: string;
  author?: string;
  url?: string;
  parentId?: string;
  childCount?: number;
  isPinned?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export const MindMapViewer: React.FC<MindMapViewerProps> = ({
  cards,
  selectedCardIds,
  onOpenPreview,
  onOpenReader,
}) => {
  const [mindmapData, setMindmapData] = useState<MindMapData | null>(getCachedMindMap());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Active selected node for side drawer preview
  const [selectedGraphNode, setSelectedGraphNode] = useState<GraphNode | null>(null);
  const [selectedAiNode, setSelectedAiNode] = useState<MindMapNode | null>(null);

  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  // Controls for View Mode: "neural" (Nöral İnteraktif Canvas) | "ai" (AI Hiyerarşik) | "date" (Zaman Çizelgesi) | "sketch" (Elde Çizilmiş Sketch Defteri)
  const [viewMode, setViewMode] = useState<"neural" | "ai" | "date" | "sketch">("neural");

  // Expanded dates in Date view mode
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Filter & Search & Scalability
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>("all");
  const [nodeLimitFilter, setNodeLimitFilter] = useState<number>(0); // 0 = all
  const [clusteringEnabled, setClusteringEnabled] = useState<boolean>(false);
  const [isNeo4jActive, setIsNeo4jActive] = useState<boolean | null>(null);

  // Sync cards with Neo4j Graph DB in the background
  useEffect(() => {
    if (cards.length > 0) {
      fetch("/api/graph/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      })
        .then((res) => res.json())
        .then((data) => {
          setIsNeo4jActive(!!data.success);
        })
        .catch(() => {
          setIsNeo4jActive(false);
        });
    }
  }, [cards]);

  // Canvas State & Controls
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hoveredNodeIdRef = useRef<string | null>(null);
  const selectedGraphNodeRef = useRef<GraphNode | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Sync refs to avoid re-triggering main canvas render useEffect
  useEffect(() => {
    hoveredNodeIdRef.current = hoveredNodeId;
  }, [hoveredNodeId]);

  useEffect(() => {
    selectedGraphNodeRef.current = selectedGraphNode;
  }, [selectedGraphNode]);

  // Interactive Balloon Branch Expansion (default expands root)
  const [expandedGraphNodeIds, setExpandedGraphNodeIds] = useState<Set<string>>(new Set(["root-brain"]));

  // Interaction Refs to prevent React re-renders during mouse move/drag
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Custom user dragged & pinned node positions map
  const positionsRef = useRef<Map<string, { x: number; y: number; isPinned?: boolean }>>(new Map());

  // Mouse click vs drag detection
  const clickStartRef = useRef<{ mouseX: number; mouseY: number; time: number }>({ mouseX: 0, mouseY: 0, time: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  // Helper functions for Balloon Expansion and Position Reset
  const toggleGraphNodeExpand = (nodeId: string) => {
    setExpandedGraphNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAllGraphNodes = () => {
    const allIds = new Set<string>();
    graphNodes.forEach((n) => {
      if (n.childCount && n.childCount > 0) {
        allIds.add(n.id);
      }
    });
    allIds.add("root-brain");
    setExpandedGraphNodeIds(allIds);
  };

  const collapseAllGraphNodes = () => {
    setExpandedGraphNodeIds(new Set(["root-brain"]));
  };

  const resetNodePositions = () => {
    positionsRef.current.clear();
    graphNodes.forEach((n) => {
      n.isPinned = false;
    });
  };

  // Generate initial mindmap if none exists
  useEffect(() => {
    if (!mindmapData && cards.length >= 2 && !isLoading) {
      handleGenerateMindMap();
    }
  }, []);

  useEffect(() => {
    const dateGroups = groupCardsByDate(cards);
    const recentKeys = dateGroups.slice(0, 3).map((g) => g.dateKey);
    setExpandedDates(new Set(recentKeys));
  }, [cards]);

  const handleGenerateMindMap = async (useSelectedOnly = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    const targetCards = useSelectedOnly && selectedCardIds.length > 0
      ? cards.filter((c) => selectedCardIds.includes(c.id))
      : cards;

    if (targetCards.length === 0) {
      setErrorMsg("Analiz edilecek kart bulunamadı.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/gemini/mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || ""
        },
        body: JSON.stringify({ cards: targetCards }),
      });

      const resText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch (e) {
        throw new Error("Lütfen Ayarlar sayfasından Gemini API anahtarınızı tanımlayın.");
      }
      if (!response.ok || data.error) {
        throw new Error(data.error || "Lütfen Ayarlar sayfasından Gemini API anahtarınızı tanımlayın.");
      }

      setMindmapData(data);
      saveCachedMindMap(data);
    } catch (err: any) {
      console.error("Mind map generation failed", err);
      setErrorMsg(err.message || "Lütfen Ayarlar sayfasından Gemini API anahtarınızı tanımlayın.");
    } finally {
      setIsLoading(false);
    }
  };

  // Build Graph Nodes & Links for Neural Canvas View
  const { graphNodes, graphLinks, categories } = useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];
    const catSet = new Set<string>();

    // 1. Root Node (NovaMind Synapse Core)
    const rootId = "root-brain";
    const savedRootPos = positionsRef.current.get(rootId);
    nodesMap.set(rootId, {
      id: rootId,
      label: "NovaMind Zihin Merkezi",
      type: "root",
      x: savedRootPos ? savedRootPos.x : 0,
      y: savedRootPos ? savedRootPos.y : 0,
      vx: 0,
      vy: 0,
      radius: 30,
      color: "#6366F1", // Indigo
      connections: [],
      note: "Tüm kişisel zihinsel bağlantılarınızın ve içeriklerinizin merkezi nöronal düğümü.",
      childCount: 0,
      isPinned: savedRootPos ? savedRootPos.isPinned : false
    });

    // 2. Category Hub Nodes
    cards.forEach((card) => {
      const catRaw = card.category || (card.platform === "poem" ? "Şiir & Edebiyat" : "Genel Fikirler");
      const cat = decodeHTMLEntities(catRaw);
      catSet.add(cat);
    });

    const categoryList = Array.from(catSet);
    const catColors = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#14B8A6", "#6366F1"];

    nodesMap.get(rootId)!.childCount = categoryList.length;

    categoryList.forEach((catName, idx) => {
      const catId = `cat-${catName}`;
      const color = catColors[idx % catColors.length];
      const angle = (idx / Math.max(1, categoryList.length)) * Math.PI * 2;
      const dist = 180;
      const savedCatPos = positionsRef.current.get(catId);

      const catCardsCount = cards.filter((c) => {
        const cCat = c.category || (c.platform === "poem" ? "Şiir & Edebiyat" : "Genel Fikirler");
        return decodeHTMLEntities(cCat) === catName;
      }).length;

      nodesMap.set(catId, {
        id: catId,
        label: decodeHTMLEntities(catName),
        type: "category",
        category: catName,
        x: savedCatPos ? savedCatPos.x : Math.cos(angle) * dist,
        y: savedCatPos ? savedCatPos.y : Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 20,
        color,
        connections: [rootId],
        note: `"${catName}" kategorisine ait tüm kayıtlı fikir ve medya bağlantıları.`,
        parentId: rootId,
        childCount: catCardsCount,
        isPinned: savedCatPos ? savedCatPos.isPinned : false
      });

      // Link category to root
      links.push({
        source: rootId,
        target: catId,
        strength: 0.8,
        color
      });

      nodesMap.get(rootId)!.connections.push(catId);
    });

    // 3. Card Nodes
    let targetCardsList = cards;
    if (selectedPlatformFilter !== "all") {
      targetCardsList = targetCardsList.filter((c) => c.platform === selectedPlatformFilter);
    }
    if (nodeLimitFilter > 0) {
      targetCardsList = targetCardsList.slice(0, nodeLimitFilter);
    }

    targetCardsList.forEach((card, i) => {
      const catRaw = card.category || (card.platform === "poem" ? "Şiir & Edebiyat" : "Genel Fikirler");
      const cat = decodeHTMLEntities(catRaw);
      const catId = `cat-${cat}`;
      const parentNode = nodesMap.get(catId);
      const savedCardPos = positionsRef.current.get(card.id);

      // Position around category hub
      const angle = (i / Math.max(1, targetCardsList.length)) * Math.PI * 2 + (Math.random() * 0.4);
      const dist = 320 + (Math.random() * 120);
      const defaultX = parentNode ? parentNode.x + Math.cos(angle) * 140 : Math.cos(angle) * dist;
      const defaultY = parentNode ? parentNode.y + Math.sin(angle) * 140 : Math.sin(angle) * dist;

      // Platform color lookup
      let cardColor = "#3B82F6";
      if (card.platform === "youtube") cardColor = "#EF4444";
      if (card.platform === "instagram" || card.platform === "threads") cardColor = "#EC4899";
      if (card.platform === "poem") cardColor = "#A855F7";
      if (card.platform === "x") cardColor = "#06B6D4";
      if (card.platform === "document") cardColor = "#F43F5E";

      const cardTitleDecoded = decodeHTMLEntities(card.title) || "İsimsiz İçerik";

      const cardNode: GraphNode = {
        id: card.id,
        label: cardTitleDecoded,
        type: "card",
        category: cat,
        platform: card.platform,
        card,
        x: savedCardPos ? savedCardPos.x : defaultX,
        y: savedCardPos ? savedCardPos.y : defaultY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 12,
        color: cardColor,
        connections: [catId],
        note: decodeHTMLEntities(card.note),
        author: card.author ? decodeHTMLEntities(card.author) : undefined,
        url: card.url,
        parentId: catId,
        childCount: 0,
        isPinned: savedCardPos ? savedCardPos.isPinned : false
      };

      nodesMap.set(card.id, cardNode);

      // Link to Category
      if (parentNode) {
        links.push({
          source: catId,
          target: card.id,
          strength: 0.5,
          color: cardColor
        });
        parentNode.connections.push(card.id);
      }
    });

    // 4. Inter-card cross connections based on shared tags
    const cardArray = Array.from(nodesMap.values()).filter((n) => n.type === "card");
    for (let i = 0; i < cardArray.length; i++) {
      for (let j = i + 1; j < cardArray.length; j++) {
        const c1 = cardArray[i].card;
        const c2 = cardArray[j].card;
        if (c1 && c2 && c1.tags && c2.tags) {
          const sharedTags = c1.tags.filter((t) => c2.tags.includes(t) && t !== "genel");
          if (sharedTags.length > 0) {
            links.push({
              source: c1.id,
              target: c2.id,
              strength: 0.2,
              color: "#10B981" // emerald tag bridge
            });
            nodesMap.get(c1.id)?.connections.push(c2.id);
            nodesMap.get(c2.id)?.connections.push(c1.id);
          }
        }
      }
    }

    return {
      graphNodes: Array.from(nodesMap.values()),
      graphLinks: links,
      categories: categoryList
    };
  }, [cards, selectedPlatformFilter, nodeLimitFilter]);

  // CANVAS ANIMATION & PHYSICS SIMULATION
  useEffect(() => {
    if (viewMode !== "neural" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const nodes = [...graphNodes];
    const links = [...graphLinks];

    // Background floating dust particles
    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1200,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.1
    }));

    // Synaptic pulses traveling along links & entrance wave animation
    const pulseOffset = { current: 0 };
    let entranceT = 0; // Starts at 0 when effect mounts or state updates

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Adaptive Physics constants scaling with node count N
    const REPULSION = Math.max(1400, 800 + nodes.length * 16);
    const SPRING_LEN = Math.max(70, 130 - Math.min(50, nodes.length * 0.25));
    const SPRING_STIFFNESS = 0.04;
    const DAMPING = 0.85;

    // Helper: Check if a node is visible based on expanded parent branches
    const isNodeVisible = (node: GraphNode): boolean => {
      if (node.type === "root") return true;
      if (!node.parentId) return true;
      const parentNode = nodes.find((n) => n.id === node.parentId);
      if (!parentNode) return true;
      return isNodeVisible(parentNode) && expandedGraphNodeIds.has(node.parentId);
    };

    const render = () => {
      pulseOffset.current += 0.015;
      if (entranceT < 1) {
        entranceT = Math.min(1, entranceT + 0.018); // ~1 sec smooth 60fps entrance wave
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const centerX = width / 2 + panOffsetRef.current.x;
      const centerY = height / 2 + panOffsetRef.current.y;

      const currentDraggedNode = draggedNodeRef.current;

      // Filter visible nodes & links for current expansion state
      const visibleNodes = nodes.filter(isNodeVisible);
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      const visibleLinks = links.filter((l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target));

      // 1. Physics Step for Visible Nodes
      for (let i = 0; i < visibleNodes.length; i++) {
        const n1 = visibleNodes[i];
        if (n1 === currentDraggedNode || n1.isPinned) continue;

        // Repulsion between visible nodes
        for (let j = i + 1; j < visibleNodes.length; j++) {
          const n2 = visibleNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 350) {
            const force = REPULSION / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!n1.isPinned) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (!n2.isPinned && n2 !== currentDraggedNode) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }

        // Center gravity
        const distToCenterSq = n1.x * n1.x + n1.y * n1.y;
        if (distToCenterSq > 100) {
          n1.vx -= (n1.x * 0.0003);
          n1.vy -= (n1.y * 0.0003);
        }
      }

      // Link spring attraction for visible links
      visibleLinks.forEach((link) => {
        const sourceNode = visibleNodes.find((n) => n.id === link.source);
        const targetNode = visibleNodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
        const delta = dist - SPRING_LEN;

        const fx = (dx / dist) * delta * SPRING_STIFFNESS * link.strength;
        const fy = (dy / dist) * delta * SPRING_STIFFNESS * link.strength;

        if (sourceNode !== currentDraggedNode && !sourceNode.isPinned) {
          sourceNode.vx += fx;
          sourceNode.vy += fy;
        }
        if (targetNode !== currentDraggedNode && !targetNode.isPinned) {
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // Update positions with damping
      visibleNodes.forEach((n) => {
        if (n === currentDraggedNode || n.isPinned) {
          n.vx = 0;
          n.vy = 0;
          return;
        }
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        if (Math.abs(n.vx) < 0.01) n.vx = 0;
        if (Math.abs(n.vy) < 0.01) n.vy = 0;
        n.x += n.vx;
        n.y += n.vy;
      });

      // 2. Canvas Drawing
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr); // Normalise DPR to CSS pixels

      // Background color (Warm Parşömen Dot Grid)
      ctx.fillStyle = "#E9DFC4";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid dots
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      const dotSpacing = 20;
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          ctx.fillRect(x, y, 1.2, 1.2);
        }
      }

      // Apply Zoom & Pan Transformations in CSS pixel space
      ctx.translate(centerX, centerY);
      ctx.scale(zoomLevel, zoomLevel);

      // Search & Category Filter Matching
      const isMatchingFilter = (n: GraphNode) => {
        if (selectedCategoryFilter !== "all" && n.category !== selectedCategoryFilter && n.type !== "root") {
          return false;
        }
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          n.label.toLowerCase().includes(q) ||
          (n.note && n.note.toLowerCase().includes(q)) ||
          (n.author && n.author.toLowerCase().includes(q))
        );
      };

      // 3. Draw Visible Links as Red Threads (Detektif Panosu Kırmızı İpleri)
      visibleLinks.forEach((link) => {
        const sourceNode = visibleNodes.find((n) => n.id === link.source);
        const targetNode = visibleNodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const isSourceHovered = hoveredNodeIdRef.current === sourceNode.id || selectedGraphNodeRef.current?.id === sourceNode.id;
        const isTargetHovered = hoveredNodeIdRef.current === targetNode.id || selectedGraphNodeRef.current?.id === targetNode.id;
        const isHighlighted = isSourceHovered || isTargetHovered;

        const isSourceMatch = isMatchingFilter(sourceNode);
        const isTargetMatch = isMatchingFilter(targetNode);
        const isDimmed = !isSourceMatch || !isTargetMatch;

        const depthDelay = sourceNode.type === "root" ? 0 : 0.22;
        const duration = 0.55;
        const rawLinkProgress = Math.min(1, Math.max(0, (entranceT - depthDelay) / duration));
        const linkGrowth = 1 - Math.pow(1 - rawLinkProgress, 3);

        if (linkGrowth <= 0) return;

        const currentX = sourceNode.x + (targetNode.x - sourceNode.x) * linkGrowth;
        const currentY = sourceNode.y + (targetNode.y - sourceNode.y) * linkGrowth;

        // Draw Thread Shadow
        ctx.beginPath();
        ctx.moveTo(sourceNode.x + 2, sourceNode.y + 3);
        ctx.lineTo(currentX + 2, currentY + 3);
        ctx.strokeStyle = "rgba(40, 30, 15, 0.15)";
        ctx.lineWidth = isHighlighted ? 3 : 2;
        ctx.stroke();

        // Draw Crimson Red Thread Line
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = isDimmed ? "rgba(169, 50, 38, 0.2)" : (isHighlighted ? "#C0392B" : "#A93226");
        ctx.lineWidth = isHighlighted ? 2.5 : 1.8;
        ctx.stroke();
      });

      // 4. Draw Visible Nodes as Pins on Detective Board
      visibleNodes.forEach((node) => {
        const isHovered = hoveredNodeIdRef.current === node.id;
        const isSelected = selectedGraphNodeRef.current?.id === node.id;
        const isMatched = isMatchingFilter(node);

        const nodeStart = node.type === "root" ? 0 : node.type === "category" ? 0.15 : 0.35;
        const rawNodeProg = Math.min(1, Math.max(0, (entranceT - nodeStart) / 0.45));
        
        const popScale = rawNodeProg === 0 ? 0 : rawNodeProg < 1
          ? 1 + 2.2 * Math.pow(rawNodeProg - 1, 3) + 1.2 * Math.pow(rawNodeProg - 1, 2)
          : 1;

        if (popScale <= 0.05) return;

        const baseRadius = (isHovered || isSelected) ? node.radius * 1.08 : node.radius;
        const currentRadius = baseRadius * Math.max(0, popScale);

        // Node Paper Shadow
        ctx.beginPath();
        ctx.arc(node.x + 2, node.y + 4, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(40, 30, 15, 0.18)";
        ctx.fill();

        // Node Paper Body (#FBF7EC Cream Paper)
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#F4EFE6" : "#FBF7EC";
        if (!isMatched) ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.lineWidth = isHovered || isSelected ? 2.5 : 1.5;
        ctx.strokeStyle = isSelected ? "#D85A30" : (isHovered ? "#6B5A47" : "#DCD0B9");
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Inner Category Accent Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = node.color || "#D85A30";
        ctx.fill();

        // 3D Red Pushpin at top center of node
        const pinX = node.x;
        const pinY = node.y - currentRadius * 0.85;

        // Pushpin Shadow
        ctx.beginPath();
        ctx.arc(pinX + 1.5, pinY + 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(40, 30, 15, 0.3)";
        ctx.fill();

        // Pushpin Body
        ctx.beginPath();
        ctx.arc(pinX, pinY, 4.5, 0, Math.PI * 2);
        const pinGrad = ctx.createRadialGradient(pinX - 1.5, pinY - 1.5, 0.5, pinX, pinY, 4.5);
        pinGrad.addColorStop(0, "#F0997B");
        pinGrad.addColorStop(0.7, "#D85A30");
        pinGrad.addColorStop(1, "#993C1D");
        ctx.fillStyle = pinGrad;
        ctx.fill();

        // Child Branch Expand / Collapse Badge
        if (node.childCount && node.childCount > 0) {
          const isExpanded = expandedGraphNodeIds.has(node.id);
          const badgeText = isExpanded ? `● ${node.childCount}` : `+${node.childCount}`;

          ctx.font = "bold 9px sans-serif";
          const badgeWidth = ctx.measureText(badgeText).width + 8;
          const badgeX = node.x + currentRadius * 0.75;
          const badgeY = node.y - currentRadius * 0.75;

          ctx.beginPath();
          ctx.roundRect(badgeX - badgeWidth / 2, badgeY - 7, badgeWidth, 14, 7);
          ctx.fillStyle = isExpanded
            ? (isDarkMode ? "#312E81" : "#E0E7FF")
            : (isDarkMode ? "#065F46" : "#D1FAE5");
          ctx.fill();

          ctx.strokeStyle = isExpanded
            ? (isDarkMode ? "#6366F1" : "#4338CA")
            : (isDarkMode ? "#10B981" : "#059669");
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = isExpanded
            ? (isDarkMode ? "#C7D2FE" : "#3730A3")
            : (isDarkMode ? "#A7F3D0" : "#065F46");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, badgeX, badgeY);
        }

        // Level of Detail (LOD) check for text labels
        const isLODHidden = visibleNodes.length > 50 && zoomLevel < 0.85 && node.type === "card" && !isHovered && !isSelected;

        if (!isLODHidden && popScale > 0.5) {
          // Node Label Text Box
          const fullLabel = decodeHTMLEntities(node.label);
          const maxLen = node.type === "root" ? 28 : node.type === "category" ? 20 : 18;
          const labelText = (isHovered || isSelected)
            ? (fullLabel.length > 32 ? fullLabel.slice(0, 32) + "…" : fullLabel)
            : (fullLabel.length > maxLen ? fullLabel.slice(0, maxLen) + "…" : fullLabel);

          ctx.font = node.type === "root" ? "bold 13px sans-serif" : node.type === "category" ? "bold 11px sans-serif" : "10px sans-serif";
          
          const textWidth = ctx.measureText(labelText).width;
          const bgPaddingX = 6;
          const labelY = node.y + currentRadius + 14;

          // Label Background Pill
          ctx.fillStyle = isDarkMode ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.92)";
          ctx.beginPath();
          ctx.roundRect(
            node.x - textWidth / 2 - bgPaddingX,
            labelY - 10,
            textWidth + bgPaddingX * 2,
            16,
            4
          );
          ctx.fill();

          if (isDarkMode) {
            ctx.strokeStyle = isHovered || isSelected ? node.color : "rgba(255, 255, 255, 0.15)";
          } else {
            ctx.strokeStyle = isHovered || isSelected ? node.color : "rgba(0, 0, 0, 0.12)";
          }
          ctx.stroke();

          // Label Text
          ctx.fillStyle = isDarkMode ? (isMatched ? "#F1F5F9" : "#64748B") : (isMatched ? "#0F172A" : "#94A3B8");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, node.x, labelY - 2);
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas Mouse Interactivity in CSS pixels
    const getMouseCanvasPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerX = rect.width / 2 + panOffsetRef.current.x;
      const centerY = rect.height / 2 + panOffsetRef.current.y;

      const graphX = (mouseX - centerX) / zoomLevel;
      const graphY = (mouseY - centerY) / zoomLevel;

      return { graphX, graphY, mouseX, mouseY };
    };

    const onMouseDown = (e: MouseEvent) => {
      const { graphX, graphY, mouseX, mouseY } = getMouseCanvasPos(e);
      clickStartRef.current = { mouseX, mouseY, time: Date.now() };
      hasDraggedRef.current = false;

      // Filter visible nodes to click target
      const visibleNodes = nodes.filter(isNodeVisible);
      const clicked = visibleNodes.find((n) => {
        const dx = n.x - graphX;
        const dy = n.y - graphY;
        return Math.sqrt(dx * dx + dy * dy) <= (n.radius + 12);
      });

      if (clicked) {
        draggedNodeRef.current = clicked;
        clicked.vx = 0;
        clicked.vy = 0;
      } else {
        isPanningRef.current = true;
        dragStartRef.current = {
          x: mouseX - panOffsetRef.current.x,
          y: mouseY - panOffsetRef.current.y
        };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const { graphX, graphY, mouseX, mouseY } = getMouseCanvasPos(e);

      if (draggedNodeRef.current) {
        const distMoved = Math.hypot(
          mouseX - clickStartRef.current.mouseX,
          mouseY - clickStartRef.current.mouseY
        );
        if (distMoved > 4) {
          hasDraggedRef.current = true;
          draggedNodeRef.current.x = graphX;
          draggedNodeRef.current.y = graphY;
          draggedNodeRef.current.vx = 0;
          draggedNodeRef.current.vy = 0;
          draggedNodeRef.current.isPinned = true;
          positionsRef.current.set(draggedNodeRef.current.id, {
            x: graphX,
            y: graphY,
            isPinned: true
          });
          canvas.style.cursor = "grabbing";
        }
        return;
      }

      if (isPanningRef.current) {
        panOffsetRef.current = {
          x: mouseX - dragStartRef.current.x,
          y: mouseY - dragStartRef.current.y
        };
        canvas.style.cursor = "grabbing";
        return;
      }

      // Hover check
      const visibleNodes = nodes.filter(isNodeVisible);
      const hovered = visibleNodes.find((n) => {
        const dx = n.x - graphX;
        const dy = n.y - graphY;
        return Math.sqrt(dx * dx + dy * dy) <= (n.radius + 12);
      });

      const newHoveredId = hovered ? hovered.id : null;
      if (hoveredNodeIdRef.current !== newHoveredId) {
        hoveredNodeIdRef.current = newHoveredId;
        setHoveredNodeId(newHoveredId);
      }
      canvas.style.cursor = hovered ? "pointer" : "grab";
    };

    const onMouseUp = () => {
      if (draggedNodeRef.current) {
        const draggedNode = draggedNodeRef.current;
        if (!hasDraggedRef.current) {
          // IT WAS A CLICK (NO DRAG)
          if (draggedNode.type === "root" || draggedNode.type === "category" || (draggedNode.childCount && draggedNode.childCount > 0)) {
            toggleGraphNodeExpand(draggedNode.id);
          } else {
            // Leaf card node click -> open detail drawer!
            setSelectedGraphNode(draggedNode);
          }
        }
      }
      draggedNodeRef.current = null;
      isPanningRef.current = false;
      if (canvas) canvas.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoomLevel((prev) => Math.min(Math.max(0.4, prev * zoomFactor), 3.0));
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("wheel", onWheel);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [viewMode, graphNodes, graphLinks, zoomLevel, isDarkMode, searchQuery, selectedCategoryFilter, expandedGraphNodeIds]);

  // Group cards by date
  function groupCardsByDate(cardList: Card[]): DateGroup[] {
    const map = new Map<string, Card[]>();

    cardList.forEach((c) => {
      const d = new Date(c.created_at);
      const key = isNaN(d.getTime()) ? "Diğer" : d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });

    const groups: DateGroup[] = [];
    map.forEach((cList, dateKey) => {
      let displayDate = dateKey;
      if (dateKey !== "Diğer") {
        const parts = dateKey.split("-");
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        displayDate = d.toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }
      groups.push({ dateKey, displayDate, cards: cList });
    });

    return groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  const toggleNodeCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(collapsedNodeIds);
    if (newSet.has(nodeId)) newSet.delete(nodeId);
    else newSet.add(nodeId);
    setCollapsedNodeIds(newSet);
  };

  const toggleDateExpand = (dateKey: string) => {
    const newSet = new Set(expandedDates);
    if (newSet.has(dateKey)) newSet.delete(dateKey);
    else newSet.add(dateKey);
    setExpandedDates(newSet);
  };

  // Render tree node recursively (AI Mode - Manila Folder & Index Card Style)
  const renderTreeNodeVertical = (node: MindMapNode, depth = 0) => {
    const isCollapsed = collapsedNodeIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const matchingCards = cards.filter((c) => node.cardIds && node.cardIds.includes(c.id));
    const showCardBadge = matchingCards.length >= 2; // Hide "1 Kart" noise

    return (
      <div key={node.id} className="relative pl-5 sm:pl-7 border-l-2 border-[#DCD0B9] my-2">
        
        {/* Horizontal Connector Arm */}
        <div className="absolute -left-[2px] top-5 w-4 h-0.5 bg-[#DCD0B9]" />

        <div
          onClick={() => setSelectedAiNode(node)}
          className={`group cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            depth === 0
              ? "bg-[#EBE2D0] border-[#DCD0B9] shadow-2xs text-[#3A2E22]"
              : "bg-[#FBF7EC] border-[#DCD0B9] hover:border-[#D85A30] hover:bg-white text-[#3A2E22] shadow-2xs"
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleNodeCollapse(node.id, e)}
                className="p-1 hover:bg-[#E2D6C0] rounded text-[#6B5A47] transition-colors cursor-pointer shrink-0"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-4 h-4 shrink-0" />
            )}

            {/* Folder / Index Card Icon */}
            {depth === 0 ? (
              <FolderTree className="w-4 h-4 text-[#D85A30] shrink-0" />
            ) : hasChildren ? (
              <Folder className="w-4 h-4 text-[#6B5A47] shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-[#8A7B5E] shrink-0" />
            )}

            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h4 className="font-bold text-sm font-sans text-[#3A2E22] group-hover:text-[#D85A30] transition-colors">
                  {decodeHTMLEntities(node.label)}
                </h4>
                {/* Only show badge for 2+ cards */}
                {showCardBadge && (
                  <span className="px-2 py-0.5 text-[10px] bg-[#D85A30] text-[#FBF7EC] font-bold rounded-xs shadow-2xs">
                    {matchingCards.length} Kart
                  </span>
                )}
              </div>
              {node.summary && (
                <p className="text-xs text-[#786958] font-light mt-0.5 line-clamp-1">
                  {decodeHTMLEntities(node.summary)}
                </p>
              )}
            </div>
          </div>

          {/* CTA Button: ONLY show on nodes with matching cards or leaf nodes */}
          {(matchingCards.length > 0 || !hasChildren) && (
            <div className="text-xs text-[#D85A30] font-bold group-hover:underline self-end sm:self-center shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded bg-[#EBE2D0] border border-[#DCD0B9]">
              <span>Kartları İncele</span>
              <Eye className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {!isCollapsed && hasChildren && (
          <div className="space-y-1.5 mt-1.5">
            {node.children!.map((child) => renderTreeNodeVertical(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const dateGroups = groupCardsByDate(cards);

  // Connected Neighbor Nodes for the active Selected Drawer Node
  const connectedNeighborNodes = useMemo(() => {
    if (!selectedGraphNode) return [];
    return graphNodes.filter((n) => selectedGraphNode.connections.includes(n.id) && n.id !== selectedGraphNode.id);
  }, [selectedGraphNode, graphNodes]);

  const filteredCardsForSketch = useMemo(() => {
    return cards.filter((card) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (card.title || "").toLowerCase().includes(q);
        const noteMatch = (card.note || "").toLowerCase().includes(q);
        const authorMatch = (card.author || "").toLowerCase().includes(q);
        const catMatch = (card.category || "").toLowerCase().includes(q);
        const tagMatch = card.tags?.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !noteMatch && !authorMatch && !catMatch && !tagMatch) {
          return false;
        }
      }

      if (selectedPlatformFilter !== "all" && card.platform !== selectedPlatformFilter) {
        return false;
      }

      if (selectedCategoryFilter !== "all") {
        const cardCat = card.category || (card.platform === "poem" ? "Şiir & Edebiyat" : "Genel Fikirler");
        if (decodeHTMLEntities(cardCat) !== selectedCategoryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [cards, searchQuery, selectedPlatformFilter, selectedCategoryFilter]);

  return (
    <div className="space-y-6">
      
      {/* Knowledge Graph Control Header (Modern Analog Paper Theme) */}
      <div className="bg-[#FBF7EC] border border-[#DCD0B9] p-5 rounded-2xl shadow-sm space-y-4 text-[#3A2E22]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#EBE2D0] border border-[#DCD0B9] text-[#D85A30] rounded-xl shadow-2xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif-fraunces text-[#3A2E22] flex items-center space-x-2">
                <span>Fikir Bağlantıları & Detektif Panosu</span>
                {isNeo4jActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded border border-emerald-200">
                    Neo4j Live
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#786958] font-light">
                Kırmızı iplerle birbirine bağlı raptiyeli fikir notlarınızın canlı analizi.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {selectedCardIds.length > 0 && (
              <button
                onClick={() => handleGenerateMindMap(true)}
                disabled={isLoading}
                className="px-3.5 py-2 bg-[#D85A30] hover:bg-[#C84A20] text-[#FBF7EC] font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Seçilen {selectedCardIds.length} Karttan Analiz Et</span>
              </button>
            )}

            <button
              onClick={() => handleGenerateMindMap(false)}
              disabled={isLoading || cards.length === 0}
              className="px-3.5 py-2 bg-[#4A3E31] hover:bg-[#3A2E22] text-[#FBF7EC] font-semibold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Bağlantıları Yenile</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs & Graph Filters */}
        <div className="flex flex-col space-y-3 pt-3 border-t border-[#DCD0B9]">
          
          {/* Row 1: View Mode Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EBE2D0] rounded-xl border border-[#DCD0B9] text-xs font-bold w-full">
            <button
              onClick={() => setViewMode("neural")}
              className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                viewMode === "neural"
                  ? "bg-[#FBF7EC] text-[#3A2E22] shadow-xs font-bold"
                  : "text-[#786958] hover:text-[#3A2E22]"
              }`}
            >
              <Brain className="w-4 h-4 text-[#D85A30]" />
              <span>Detektif Panosu</span>
            </button>

            <button
              onClick={() => setViewMode("ai")}
              className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                viewMode === "ai"
                  ? "bg-[#FBF7EC] text-[#3A2E22] shadow-xs font-bold"
                  : "text-[#786958] hover:text-[#3A2E22]"
              }`}
            >
              <Network className="w-4 h-4 text-[#6B5A47]" />
              <span>Hiyerarşik Şema</span>
            </button>

            <button
              onClick={() => setViewMode("date")}
              className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                viewMode === "date"
                  ? "bg-[#FBF7EC] text-[#3A2E22] shadow-xs font-bold"
                  : "text-[#786958] hover:text-[#3A2E22]"
              }`}
            >
              <Calendar className="w-4 h-4 text-[#6B5A47]" />
              <span>Zaman Çizelgesi</span>
            </button>

            <button
              onClick={() => setViewMode("sketch")}
              className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                viewMode === "sketch"
                  ? "bg-[#FBF7EC] text-[#3A2E22] shadow-xs font-bold"
                  : "text-[#786958] hover:text-[#3A2E22]"
              }`}
            >
              <PenTool className="w-4 h-4 text-[#D85A30]" />
              <span>Defter Notları</span>
            </button>
          </div>

          {/* Row 2: Quick Filters for Graph Search */}
          {viewMode === "neural" && (
            <div className="flex items-center flex-wrap gap-2 w-full pt-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#8A7B5E] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Panoda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-xl text-xs text-[#2C221E] placeholder-[#8A7B5E] focus:outline-none focus:border-[#D85A30]"
                />
              </div>

              {/* Platform Isolator Filter */}
              <select
                value={selectedPlatformFilter}
                onChange={(e) => setSelectedPlatformFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-xl text-xs font-semibold text-[#3A2E22] focus:outline-none cursor-pointer"
              >
                <option value="all">Tüm Platformlar</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="threads">Threads</option>
                <option value="x">X (Twitter)</option>
                <option value="poem">Şiirler</option>
                <option value="article">Makaleler</option>
              </select>

              {/* Node Count Limit Filter */}
              <select
                value={nodeLimitFilter}
                onChange={(e) => setNodeLimitFilter(Number(e.target.value))}
                className="px-3 py-1.5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-xl text-xs font-semibold text-[#3A2E22] focus:outline-none cursor-pointer"
              >
                <option value={0}>Tüm Düğümler ({cards.length})</option>
                <option value={30}>En Aktif 30 Düğüm</option>
                <option value={60}>En Aktif 60 Düğüm</option>
                <option value={100}>En Aktif 100 Düğüm</option>
              </select>

              {/* Category Filter dropdown */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin" />
          <h3 className="font-bold text-sm text-slate-800">
            NovaMind Nöral Ağ Düğümlerini Oluşturuyor...
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Girdiğiniz tüm notlar, başlıklar ve sosyal medya içerikleri işlenerek anlamsal kümelere bağlanıyor.
          </p>
        </div>
      )}

      {/* Error State */}
      {errorMsg && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
          <p className="font-bold">Knowledge Graph Hatası:</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* VIEW MODES CONTAINER WITH FRAMER MOTION TRANSITIONS */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: NEURAL CANVAS INTERACTIVE GRAPH */}
        {!isLoading && viewMode === "neural" && (
          <motion.div
            key="view-neural"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[580px] flex flex-col"
          >
            {/* Floating Canvas Controls Overlay */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="absolute top-4 left-4 z-10 flex items-center flex-wrap gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 border border-slate-700/80 rounded-2xl text-xs text-slate-200 shadow-xl"
            >
              <button
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.2))}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Yakınlaştır"
              >
                <ZoomIn className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Uzaklaştır"
              >
                <ZoomOut className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  panOffsetRef.current = { x: 0, y: 0 };
                }}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Görünümü Sıfırla"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-0.5" />

              {/* Expand / Collapse All Branches */}
              <button
                onClick={expandAllGraphNodes}
                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-bold text-indigo-200 rounded-xl transition-all cursor-pointer"
                title="Tüm Alt Balonları Aç"
              >
                Tümünü Aç
              </button>

              <button
                onClick={collapseAllGraphNodes}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-[11px] font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
                title="Sadece Ana Kategorileri Göster (Minimal Görünüm)"
              >
                Minimal
              </button>

              <button
                onClick={resetNodePositions}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-[11px] font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
                title="Sürüklenen Konumları Sıfırla"
              >
                Konumları Sıfırla
              </button>

              <button
                onClick={() => setShowLegend((v) => !v)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${showLegend ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"}`}
                title="İnteraktif Kontrol İpuçlarını Göster/Gizle"
              >
                <Info className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Canvas Helper Legend Overlay (Dismissible with Framer Motion) */}
            <AnimatePresence>
              {showLegend && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md p-3 border border-slate-700/80 rounded-2xl text-[11px] text-slate-300 space-y-1.5 shadow-2xl max-w-xs"
                >
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>İnteraktif Balon Kontrolleri</span>
                    </div>
                    <button
                      onClick={() => setShowLegend(false)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Açıklamayı Kapat"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-300/90 space-y-1">
                    <p>• <b>Balonu Basılı Tutup Sürükleyin:</b> Konumunu tuval üzerinde serbestçe değiştirin.</p>
                    <p>• <b>Kategori Balonuna Tıklayın:</b> Alt balonları minimalist şekilde açıp kapatın.</p>
                    <p>• <b>Kart Balonuna Tıklayın:</b> Detaylı içerik penceresini açın.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Interactive Canvas Element */}
            <canvas
              ref={canvasRef}
              className="w-full h-[580px] block cursor-grab active:cursor-grabbing"
            />
          </motion.div>
        )}

        {/* VIEW 2: AI HIERARCHICAL SCHEMA */}
        {!isLoading && viewMode === "ai" && mindmapData && mindmapData.root && (
          <motion.div
            key="view-ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#FBF7EC] border border-[#DCD0B9] p-6 rounded-2xl shadow-sm overflow-x-auto text-[#3A2E22]"
          >
            <div className="max-w-4xl mx-auto space-y-1">
              {renderTreeNodeVertical(mindmapData.root)}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: CHRONOLOGICAL TIMELINE */}
        {!isLoading && viewMode === "date" && (
          <motion.div
            key="view-date"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#FBF7EC] border border-[#DCD0B9] p-5 rounded-2xl shadow-sm space-y-3 text-[#3A2E22]"
          >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#D85A30]" />
              <h3 className="text-xs font-bold font-serif-fraunces text-[#3A2E22] uppercase tracking-wider">
                Tarih Bazlı İçerik Çizelgesi
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {dateGroups.map((group) => {
              const isExpanded = expandedDates.has(group.dateKey);

              return (
                <div
                  key={group.dateKey}
                  className="bg-[#FBF7EC] border border-[#DCD0B9] rounded-xl shadow-2xs overflow-hidden"
                >
                  <div
                    onClick={() => toggleDateExpand(group.dateKey)}
                    className="p-3.5 bg-[#EBE2D0] text-[#3A2E22] cursor-pointer hover:bg-[#E2D6C0] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <div>
                        <h4 className="font-bold text-sm">{group.displayDate}</h4>
                        <span className="text-xs text-slate-300">{group.cards.length} Kayıtlı Fikir / Not</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-medium border border-slate-700">
                        {isExpanded ? "Daralt" : "Aç"}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 border-t border-slate-200">
                      {group.cards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedGraphNode({
                              id: card.id,
                              label: decodeHTMLEntities(card.title) || "Not",
                              type: "card",
                              platform: card.platform,
                              card,
                              x: 0,
                              y: 0,
                              vx: 0,
                              vy: 0,
                              radius: 12,
                              color: "#4F46E5",
                              connections: [],
                              note: decodeHTMLEntities(card.note),
                              author: card.author ? decodeHTMLEntities(card.author) : undefined,
                              url: card.url
                            });
                          }}
                          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 shadow-2xs cursor-pointer transition-all space-y-1.5"
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">
                              {decodeHTMLEntities(card.title) || "İsimsiz İçerik"}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                              {card.platform}
                            </span>
                          </div>

                          {card.note && (
                            <p className="text-[11px] text-slate-600 italic line-clamp-2 bg-amber-50/60 p-1.5 rounded border border-amber-200/50">
                              "{decodeHTMLEntities(card.note)}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

        {/* VIEW 4: ELDE ÇİZİLMİŞ SKETCH DEFTERİ (SKETCHBOOK CARD VIEW) */}
        {!isLoading && viewMode === "sketch" && (
          <motion.div
            key="view-sketch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-[#f7f2e6] border-2 border-[#2c2825] p-5 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden space-y-5"
            style={{
              backgroundImage: "radial-gradient(#d5cbba 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          >
            {/* Notebook Header: Clean, Elegant Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-2 border-b-2 border-[#c4b5a0]/70">
              <div className="flex items-center space-x-3">
                {/* Spiral binder rings */}
                <div className="flex space-x-2 select-none">
                  {[1, 2, 3, 4, 5, 6].map((ring) => (
                    <div key={ring} className="w-2.5 h-4 bg-[#3a332d] rounded-full border border-[#1a1613] shadow-inner" />
                  ))}
                </div>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#2a241e] tracking-tight italic">
                  Fikir Defterim ✏️
                </h3>
              </div>
            </div>

            {/* Filter Bar Inside Sketchbook */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#e8ded0]/80 p-3 rounded-2xl border border-[#c4b5a0]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#736352] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Defterde not veya fikir ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#fffdf8] border border-[#a39482] rounded-xl text-xs font-serif text-[#2a241e] placeholder-[#8c7a68] focus:outline-none focus:ring-2 focus:ring-[#8c431d]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPlatformFilter}
                  onChange={(e) => setSelectedPlatformFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#fffdf8] border border-[#a39482] rounded-xl text-xs font-serif font-bold text-[#2a241e] focus:outline-none"
                >
                  <option value="all">Tüm Bağlantılar</option>
                  <option value="youtube">🔴 YouTube</option>
                  <option value="instagram">📸 Instagram</option>
                  <option value="threads">💬 Threads</option>
                  <option value="x">🐦 X (Twitter)</option>
                  <option value="poem">✍️ Şiirler</option>
                  <option value="article">📰 Makaleler</option>
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#fffdf8] border border-[#a39482] rounded-xl text-xs font-serif font-bold text-[#2a241e] focus:outline-none"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SKETCH CARDS GRID */}
            {filteredCardsForSketch.length === 0 ? (
              <div className="p-8 text-center bg-[#fffdf8] border-2 border-dashed border-[#a39482] rounded-2xl">
                <PenTool className="w-8 h-8 text-[#a39482] mx-auto mb-2" />
                <p className="font-serif font-bold text-[#42382e] text-xs">Aranan kriterlerde not veya fikir bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                {filteredCardsForSketch.map((card, idx) => {
                  const rotationClass = idx % 4 === 0 ? "-rotate-1" : idx % 4 === 1 ? "rotate-1" : idx % 4 === 2 ? "rotate-0.5" : "-rotate-0.5";
                  const formattedCardDate = new Date(card.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });

                  // Platform specific sticky note badge colors
                  const getStickyTag = (p?: string) => {
                    switch (p?.toLowerCase()) {
                      case "youtube":
                        return { label: "YouTube", bg: "bg-red-200 border-red-400 text-red-950", icon: "🔴" };
                      case "instagram":
                        return { label: "Instagram", bg: "bg-pink-200 border-pink-400 text-pink-950", icon: "📸" };
                      case "x":
                      case "twitter":
                        return { label: "X (Twitter)", bg: "bg-sky-200 border-sky-400 text-sky-950", icon: "🐦" };
                      case "threads":
                        return { label: "Threads", bg: "bg-stone-300 border-stone-400 text-stone-950", icon: "💬" };
                      case "poem":
                        return { label: "Şiir", bg: "bg-amber-200 border-amber-400 text-amber-950", icon: "✍️" };
                      case "article":
                        return { label: "Makale", bg: "bg-emerald-200 border-emerald-400 text-emerald-950", icon: "📰" };
                      default:
                        return { label: "Not", bg: "bg-yellow-200 border-yellow-400 text-yellow-950", icon: "📌" };
                    }
                  };

                  const stickyTag = getStickyTag(card.platform);

                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedGraphNode({
                          id: card.id,
                          label: decodeHTMLEntities(card.title) || "Not",
                          type: "card",
                          platform: card.platform,
                          card,
                          x: 0,
                          y: 0,
                          vx: 0,
                          vy: 0,
                          radius: 12,
                          color: "#8c431d",
                          connections: [],
                          note: decodeHTMLEntities(card.note),
                          author: card.author ? decodeHTMLEntities(card.author) : undefined,
                          url: card.url
                        });
                      }}
                      className={`group relative bg-[#fffdf8] border-2 border-[#2b2621] p-4 rounded-xs shadow-[4px_4px_0px_0px_#2b2621] hover:shadow-[6px_6px_0px_0px_#8c431d] hover:border-[#8c431d] transition-all cursor-pointer flex flex-col justify-between ${rotationClass} hover:rotate-0 hover:-translate-y-1`}
                    >
                      {/* Platform Sticky Note Label Tag */}
                      <div className={`absolute -top-3.5 left-4 px-2.5 py-0.5 border shadow-xs rounded-xs rotate-[-3deg] z-10 flex items-center space-x-1 text-[10px] font-serif font-bold ${stickyTag.bg}`}>
                        <span className="text-[9px]">{stickyTag.icon}</span>
                        <span>{stickyTag.label}</span>
                      </div>

                      {/* Paper Clip Icon in Corner */}
                      <div className="absolute top-2 right-2.5 z-10 text-[#5c5043]">
                        <Paperclip className="w-4 h-4 text-[#8c431d] transform rotate-45" />
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* Stamp & Category Header */}
                        <div className="flex items-center justify-between text-[10px] font-serif font-bold text-[#6b5b4b] border-b border-dashed border-[#d4c8b8] pb-1.5">
                          <span className="px-2 py-0.5 bg-[#f0e6d5] border border-[#a89882] rounded-2xs text-[#3b3228]">
                            {card.category || "Genel"}
                          </span>
                        </div>

                        {/* Thumbnail in Vintage Polaroid Style Frame if present */}
                        {card.thumbnail_url && (
                          <div className="p-1.5 bg-white border border-[#2b2621] shadow-2xs rounded-3xs overflow-hidden">
                            <img
                              src={card.thumbnail_url}
                              alt={decodeHTMLEntities(card.title)}
                              className="w-full h-28 object-cover rounded-3xs grayscale-[20%] group-hover:grayscale-0 transition-all"
                            />
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="font-serif font-bold text-[#1e1a16] text-sm leading-snug line-clamp-2 group-hover:text-[#8c431d] transition-colors">
                          {decodeHTMLEntities(card.title) || "İsimsiz İçerik"}
                        </h4>

                        {/* Personal Note in Yellow Post-It Pad Style */}
                        {card.note ? (
                          <div className="bg-[#fef3c7] border border-dashed border-[#ca8a04] p-3 rounded-xs text-xs text-[#78350f] font-serif italic relative shadow-2xs space-y-1">
                            <span className="text-[10px] uppercase font-sans font-extrabold text-[#92400e] block tracking-wide">
                              ✍️ Sizin Notunuz:
                            </span>
                            <p className="line-clamp-3 leading-relaxed">
                              "{decodeHTMLEntities(card.note)}"
                            </p>
                          </div>
                        ) : (
                          <div className="bg-[#f5ebd9]/60 border border-dashed border-[#c4b5a0] p-2 rounded-xs text-[11px] text-[#786958] font-serif italic">
                            (Not eklenmemiş)
                          </div>
                        )}
                      </div>

                      {/* Footer Stamp & Action */}
                      <div className="pt-3 mt-2 border-t border-dashed border-[#d4c8b8] flex items-center justify-between text-[11px] font-serif text-[#5c5043]">
                        <span className="font-mono text-[10px] text-[#8c7a68] font-semibold">
                          📅 {formattedCardDate}
                        </span>

                        <span className="inline-flex items-center space-x-1 font-bold text-[#8c431d] group-hover:underline">
                          <span>Aç & İncele</span>
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SELECTED GRAPH NODE DETAILED PREVIEW DRAWER */}
      {selectedGraphNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: selectedGraphNode.color }}
                  />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {selectedGraphNode.type === "root" ? "Zihin Merkezi" : selectedGraphNode.type === "category" ? "Kategori Düğümü" : selectedGraphNode.platform ? PLATFORMS[selectedGraphNode.platform]?.name : "Detay"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif leading-snug">
                  {decodeHTMLEntities(selectedGraphNode.label)}
                </h3>
              </div>

              <button
                onClick={() => setSelectedGraphNode(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Main Card Content Preview if Card Type */}
            {selectedGraphNode.card && (
              <div className="space-y-3">
                {selectedGraphNode.card.thumbnail_url && (
                  <div className="rounded-2xl overflow-hidden max-h-48 bg-slate-100 border border-slate-200">
                    <img
                      src={selectedGraphNode.card.thumbnail_url}
                      alt={decodeHTMLEntities(selectedGraphNode.label)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {selectedGraphNode.card.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 leading-relaxed">
                    {decodeHTMLEntities(selectedGraphNode.card.description)}
                  </p>
                )}
              </div>
            )}

            {/* Note & Custom Text Box */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                <span className="flex items-center space-x-1">
                  <Feather className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kişisel Not / Metin Detayı</span>
                </span>
              </div>

              <p className="text-xs text-slate-800 italic whitespace-pre-wrap leading-relaxed">
                "{decodeHTMLEntities(selectedGraphNode.note) || "Henüz özel not eklenmedi."}"
              </p>
            </div>

            {/* Connected Synaptic Nodes */}
            {connectedNeighborNodes.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bağlı Nöral Düğümler ({connectedNeighborNodes.length}):</span>
                </h4>

                <div className="flex items-center gap-2 flex-wrap">
                  {connectedNeighborNodes.map((neighbor) => (
                    <button
                      key={neighbor.id}
                      onClick={() => {
                        setSelectedGraphNode(neighbor);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-all shadow-2xs"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: neighbor.color }}
                      />
                      <span className="truncate max-w-[160px]">{decodeHTMLEntities(neighbor.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedGraphNode.url ? (
                <a
                  href={selectedGraphNode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <span>Kaynağa Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedGraphNode(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Node Detailed Theme Drawer */}
      {selectedAiNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: selectedAiNode.color || "#6366F1" }}
                />
                <h3 className="font-bold text-white text-base font-sans leading-snug">
                  {decodeHTMLEntities(selectedAiNode.label)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAiNode(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Executive Theme Summary */}
              {selectedAiNode.summary && (
                <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Tema Özeti</span>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    "{decodeHTMLEntities(selectedAiNode.summary)}"
                  </p>
                </div>
              )}

              {/* Connected Cards List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Bu Temaya Bağlı Kartlar</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {cards.filter((c) => selectedAiNode.cardIds?.includes(c.id)).length} Adet
                  </span>
                </h4>

                {cards.filter((c) => selectedAiNode.cardIds?.includes(c.id)).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                    Bu tema hiyerarşisinde doğrudan eşleşen kart bulunamadı.
                  </div>
                ) : (
                  cards
                    .filter((c) => selectedAiNode.cardIds?.includes(c.id))
                    .map((card) => (
                      <div
                        key={card.id}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                              {PLATFORMS[card.platform]?.name || card.platform}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(card.created_at).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {decodeHTMLEntities(card.title || "İsimsiz Kart")}
                          </h5>
                          {card.note && (
                            <p className="text-xs text-slate-400 line-clamp-2 italic">
                              "{decodeHTMLEntities(card.note)}"
                            </p>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          {onOpenReader && (
                            <button
                              onClick={() => {
                                setSelectedAiNode(null);
                                onOpenReader(card);
                              }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                              title="Odak Okuma Modu"
                            >
                              Oku
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedAiNode(null);
                              if (onOpenPreview) {
                                onOpenPreview(card);
                              } else if (card.url) {
                                window.open(card.url, "_blank");
                              }
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>İncele</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAiNode(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
