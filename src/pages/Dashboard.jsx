import Error from "@/components/common/Error";
import Loader from "@/components/common/Loader";
import { getDashboardDetail } from "@/api/adminApi";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMove,
  FiPlusCircle,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const STAT_ORDER_STORAGE_KEY = "dashboard-stat-order";
const ACTION_ORDER_STORAGE_KEY = "dashboard-action-order";
const HERO_ORDER_STORAGE_KEY = "dashboard-hero-order";
const LOWER_SECTION_ORDER_STORAGE_KEY = "dashboard-lower-section-order";
const MIX_ORDER_STORAGE_KEY = "dashboard-mix-order";
const WIDGET_SIZE_STORAGE_KEY = "dashboard-widget-sizes";

const DEFAULT_STAT_ORDER = ["total-employees", "present", "late", "half-day", "absent"];
const DEFAULT_ACTION_ORDER = ["create-employee", "review-leaves", "wifi-system", "notice-board", "browse-employees"];
const DEFAULT_HERO_ORDER = ["hero-copy", "hero-spotlight"];
const DEFAULT_LOWER_SECTION_ORDER = ["attendance-mix", "quick-actions"];
const DEFAULT_MIX_ORDER = ["present", "late", "half-day", "absent"];

function formatPercent(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function normalizeStoredOrder(storedOrder, defaultOrder) {
  const validItems = Array.isArray(storedOrder)
    ? storedOrder.filter((item) => defaultOrder.includes(item))
    : [];
  const missingItems = defaultOrder.filter((item) => !validItems.includes(item));
  return [...validItems, ...missingItems];
}

function getStoredOrder(storageKey, defaultOrder) {
  try {
    const savedOrder = localStorage.getItem(storageKey);
    if (!savedOrder) {
      return defaultOrder;
    }

    return normalizeStoredOrder(JSON.parse(savedOrder), defaultOrder);
  } catch {
    return defaultOrder;
  }
}

function getStoredWidgetSizes() {
  try {
    const savedSizes = localStorage.getItem(WIDGET_SIZE_STORAGE_KEY);
    if (!savedSizes) {
      return {};
    }

    const parsedSizes = JSON.parse(savedSizes);
    if (!parsedSizes || typeof parsedSizes !== "object") {
      return {};
    }

    return Object.entries(parsedSizes).reduce((accumulator, [key, value]) => {
      const width = Number(value?.width);
      const height = Number(value?.height);
      const nextSize = {};

      if (Number.isFinite(width) && width > 0) {
        nextSize.width = width;
      }

      if (Number.isFinite(height) && height > 0) {
        nextSize.height = height;
      }

      if (Object.keys(nextSize).length) {
        accumulator[key] = nextSize;
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

function reorderItems(items, draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) {
    return items;
  }

  const nextItems = [...items];
  const draggedIndex = nextItems.indexOf(draggedId);
  const targetIndex = nextItems.indexOf(targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return items;
  }

  nextItems.splice(draggedIndex, 1);
  nextItems.splice(targetIndex, 0, draggedId);
  return nextItems;
}

function ResizableShell({
  widgetId,
  widgetSizes,
  setWidgetSizes,
  className,
  sizeMode = "both",
  style,
  draggableProps,
  isDragging,
  children,
}) {
  const shellRef = useRef(null);
  const savedSize = widgetSizes[widgetId] || {};

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      const nextSize = {
        height: Math.round(shell.offsetHeight),
      };

      if (sizeMode === "both") {
        nextSize.width = Math.round(shell.offsetWidth);
      }

      setWidgetSizes((currentSizes) => {
        const currentWidgetSize = currentSizes[widgetId] || {};

        if (
          currentWidgetSize.width === nextSize.width &&
          currentWidgetSize.height === nextSize.height
        ) {
          return currentSizes;
        }

        return {
          ...currentSizes,
          [widgetId]: nextSize,
        };
      });
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [setWidgetSizes, sizeMode, widgetId]);

  const resizeStyle = {
    ...style,
    ...(sizeMode === "both" && savedSize.width ? { width: `${savedSize.width}px`, maxWidth: "100%" } : {}),
    ...(savedSize.height ? { height: `${savedSize.height}px` } : {}),
  };

  return (
    <div
      ref={shellRef}
      className={`dashboard-resizable dashboard-resizable--${sizeMode} ${className} ${isDragging ? "is-dragging" : ""}`}
      style={resizeStyle}
      {...draggableProps}
    >
      {children}
    </div>
  );
}

function StatCard({
  widgetId,
  label,
  value,
  accentClass,
  icon,
  note,
  onView,
  widgetSizes,
  setWidgetSizes,
  draggableProps,
  isDragging,
}) {
  const Icon = icon;

  return (
    <ResizableShell
      widgetId={widgetId}
      widgetSizes={widgetSizes}
      setWidgetSizes={setWidgetSizes}
      className={`dashboard-stat-card ${accentClass}`}
      draggableProps={draggableProps}
      isDragging={isDragging}
    >
      <div className="dashboard-stat-top">
        <div>
          <div className="dashboard-stat-label">{label}</div>
          <div className="dashboard-stat-value">{value}</div>
        </div>
        <div className="dashboard-stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <div className="dashboard-stat-bottom">
        <span className="dashboard-drag-hint">
          <FiMove size={14} /> Drag to reorder
        </span>
        <span>{note}</span>
        <button type="button" className="dashboard-inline-button" onClick={onView}>
          Explore <FiArrowRight size={15} />
        </button>
      </div>
    </ResizableShell>
  );
}

function QuickAction({
  widgetId,
  title,
  description,
  icon,
  onClick,
  widgetSizes,
  setWidgetSizes,
  draggableProps,
  isDragging,
}) {
  const Icon = icon;

  return (
    <ResizableShell
      widgetId={widgetId}
      widgetSizes={widgetSizes}
      setWidgetSizes={setWidgetSizes}
      className="dashboard-action-shell"
      draggableProps={draggableProps}
      isDragging={isDragging}
    >
      <button type="button" className="dashboard-action-card" onClick={onClick}>
        <div className="dashboard-action-icon">
          <Icon size={18} />
        </div>
        <div>
          <div className="dashboard-action-title">{title}</div>
          <div className="dashboard-action-description">{description}</div>
          <div className="dashboard-action-drag">
            <FiMove size={14} /> Drag to reorder
          </div>
        </div>
        <FiArrowRight size={16} className="dashboard-action-arrow" />
      </button>
    </ResizableShell>
  );
}

function DashboardSection({
  widgetId,
  widgetSizes,
  setWidgetSizes,
  children,
  draggableProps,
  isDragging,
}) {
  return (
    <ResizableShell
      widgetId={widgetId}
      widgetSizes={widgetSizes}
      setWidgetSizes={setWidgetSizes}
      className="dashboard-glass-card"
      sizeMode="vertical"
      draggableProps={draggableProps}
      isDragging={isDragging}
    >
      {children}
    </ResizableShell>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployee: 0,
    totalPresent: 0,
    totalLate: 0,
    totalHalfDay: 0,
    totalAbsent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statOrder, setStatOrder] = useState(() => getStoredOrder(STAT_ORDER_STORAGE_KEY, DEFAULT_STAT_ORDER));
  const [actionOrder, setActionOrder] = useState(() => getStoredOrder(ACTION_ORDER_STORAGE_KEY, DEFAULT_ACTION_ORDER));
  const [heroOrder, setHeroOrder] = useState(() => getStoredOrder(HERO_ORDER_STORAGE_KEY, DEFAULT_HERO_ORDER));
  const [lowerSectionOrder, setLowerSectionOrder] = useState(() => getStoredOrder(LOWER_SECTION_ORDER_STORAGE_KEY, DEFAULT_LOWER_SECTION_ORDER));
  const [mixOrder, setMixOrder] = useState(() => getStoredOrder(MIX_ORDER_STORAGE_KEY, DEFAULT_MIX_ORDER));
  const [widgetSizes, setWidgetSizes] = useState(() => getStoredWidgetSizes());
  const [draggingItem, setDraggingItem] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboardDetail();
        setStats({
          totalEmployee: data?.data?.totalEmployee || 0,
          totalPresent: data?.data?.totalPresent || 0,
          totalLate: data?.data?.totalLate || 0,
          totalHalfDay: data?.data?.totalHalfDay || 0,
          totalAbsent: data?.data?.totalAbsent || 0,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    localStorage.setItem(STAT_ORDER_STORAGE_KEY, JSON.stringify(statOrder));
  }, [statOrder]);

  useEffect(() => {
    localStorage.setItem(ACTION_ORDER_STORAGE_KEY, JSON.stringify(actionOrder));
  }, [actionOrder]);

  useEffect(() => {
    localStorage.setItem(HERO_ORDER_STORAGE_KEY, JSON.stringify(heroOrder));
  }, [heroOrder]);

  useEffect(() => {
    localStorage.setItem(LOWER_SECTION_ORDER_STORAGE_KEY, JSON.stringify(lowerSectionOrder));
  }, [lowerSectionOrder]);

  useEffect(() => {
    localStorage.setItem(MIX_ORDER_STORAGE_KEY, JSON.stringify(mixOrder));
  }, [mixOrder]);

  useEffect(() => {
    localStorage.setItem(WIDGET_SIZE_STORAGE_KEY, JSON.stringify(widgetSizes));
  }, [widgetSizes]);

  const dashboardSummary = useMemo(() => {
    const totalEmployees = Number(stats.totalEmployee) || 0;
    const totalPresent = Number(stats.totalPresent) || 0;
    const totalLate = Number(stats.totalLate) || 0;
    const totalHalfDay = Number(stats.totalHalfDay) || 0;
    const totalAbsent = Number(stats.totalAbsent) || 0;
    const engagedCount = totalPresent + totalLate + totalHalfDay;
    const attendanceMix = [
      {
        key: "present",
        label: "Present",
        value: totalPresent,
        accentClass: "is-present",
        route: "/dashboard/attendance?status=Present",
      },
      {
        key: "late",
        label: "Late",
        value: totalLate,
        accentClass: "is-late",
        route: "/dashboard/attendance?status=Late",
      },
      {
        key: "half-day",
        label: "Half Day",
        value: totalHalfDay,
        accentClass: "is-halfday",
        route: "/dashboard/attendance?status=Half Day",
      },
      {
        key: "absent",
        label: "Absent",
        value: totalAbsent,
        accentClass: "is-absent",
        route: "/dashboard/attendance?status=Absent",
      },
    ];

    const spotlightLabel = attendanceMix.reduce((best, item) => (
      item.value > best.value ? item : best
    ), attendanceMix[0]);

    return {
      totalEmployees,
      totalPresent,
      totalLate,
      totalHalfDay,
      totalAbsent,
      engagedCount,
      attendanceMix,
      engagedRate: formatPercent(engagedCount, totalEmployees),
      absentRate: formatPercent(totalAbsent, totalEmployees),
      spotlightLabel,
    };
  }, [stats]);

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statCards = useMemo(() => ({
    "total-employees": {
      label: "Total Employees",
      value: String(dashboardSummary.totalEmployees),
      accentClass: "accent-amber",
      icon: FiUsers,
      note: "Complete workforce count",
      onView: () => navigate("/dashboard/employees"),
    },
    present: {
      label: "Present Today",
      value: String(dashboardSummary.totalPresent),
      accentClass: "accent-green",
      icon: FiCheckCircle,
      note: `${formatPercent(dashboardSummary.totalPresent, dashboardSummary.totalEmployees)} of total team`,
      onView: () => navigate("/dashboard/attendance?status=Present"),
    },
    late: {
      label: "Late Check-ins",
      value: String(dashboardSummary.totalLate),
      accentClass: "accent-blue",
      icon: FiClock,
      note: "Requires timing review",
      onView: () => navigate("/dashboard/attendance?status=Late"),
    },
    "half-day": {
      label: "Half Day",
      value: String(dashboardSummary.totalHalfDay),
      accentClass: "accent-orange",
      icon: FiCalendar,
      note: "Partial attendance records",
      onView: () => navigate("/dashboard/attendance?status=Half Day"),
    },
    absent: {
      label: "Absent",
      value: String(dashboardSummary.totalAbsent),
      accentClass: "accent-rose",
      icon: FiAlertCircle,
      note: `${dashboardSummary.absentRate} of total team`,
      onView: () => navigate("/dashboard/attendance?status=Absent"),
    },
  }), [dashboardSummary, navigate]);

  const quickActions = useMemo(() => ({
    "create-employee": {
      title: "Create employee",
      description: "Add a new team member profile and onboarding details.",
      icon: FiPlusCircle,
      onClick: () => navigate("/dashboard/employees/new"),
    },
    "review-leaves": {
      title: "Review leaves",
      description: "Handle pending leave requests and decisions.",
      icon: FiCalendar,
      onClick: () => navigate("/dashboard/leaves"),
    },
    "wifi-system": {
      title: "Wifi system",
      description: "Manage wifi records separately from attendance.",
      icon: FiActivity,
      onClick: () => navigate("/dashboard/wifi-system"),
    },
    "notice-board": {
      title: "Open notice board",
      description: "Publish important updates for the organization.",
      icon: FiFileText,
      onClick: () => navigate("/dashboard/notice"),
    },
    "browse-employees": {
      title: "Browse employees",
      description: "Inspect the full directory and employee records.",
      icon: FiUsers,
      onClick: () => navigate("/dashboard/employees"),
    },
  }), [navigate]);

  const orderedStatCards = statOrder.filter((key) => statCards[key]).map((key) => ({ key, ...statCards[key] }));
  const orderedQuickActions = actionOrder.filter((key) => quickActions[key]).map((key) => ({ key, ...quickActions[key] }));
  const orderedAttendanceMix = mixOrder
    .filter((key) => dashboardSummary.attendanceMix.some((item) => item.key === key))
    .map((key) => dashboardSummary.attendanceMix.find((item) => item.key === key))
    .filter(Boolean);

  const createDragHandlers = (group, itemKey, setOrder) => ({
    draggable: true,
    onDragStart: () => setDraggingItem({ group, itemKey }),
    onDragOver: (event) => event.preventDefault(),
    onDrop: (event) => {
      event.preventDefault();

      if (!draggingItem || draggingItem.group !== group) {
        return;
      }

      setOrder((current) => reorderItems(current, draggingItem.itemKey, itemKey));
      setDraggingItem(null);
    },
    onDragEnd: () => setDraggingItem(null),
  });

  const heroSections = {
    "hero-copy": (
      <ResizableShell
        key="hero-copy"
        widgetId="hero-copy"
        widgetSizes={widgetSizes}
        setWidgetSizes={setWidgetSizes}
        className="dashboard-hero-copy"
        sizeMode="vertical"
        draggableProps={createDragHandlers("hero", "hero-copy", setHeroOrder)}
        isDragging={draggingItem?.group === "hero" && draggingItem?.itemKey === "hero-copy"}
      >
        <div className="dashboard-chip">HR Command Center</div>
        <h1 className="dashboard-hero-title">Attendance pulse, team movement, and next actions in one place.</h1>
        <p className="dashboard-hero-text">
          Track today&apos;s workforce rhythm, jump into high-priority actions, and keep the entire employee flow moving.
        </p>

        <div className="dashboard-hero-actions">
          <button type="button" className="btn btn-light dashboard-hero-button" onClick={() => navigate("/dashboard/employees/new")}>
            <FiPlusCircle size={17} /> Add Employee
          </button>
          <button type="button" className="btn btn-outline-light dashboard-hero-button" onClick={() => navigate("/dashboard/attendance")}>
            <FiActivity size={17} /> View Attendance
          </button>
        </div>

        <div className="dashboard-hero-tags">
          <span>{dashboardSummary.totalEmployees} employees</span>
          <span>{dashboardSummary.engagedRate} engagement</span>
          <span>{todayLabel}</span>
        </div>

        <div className="dashboard-hero-drag">
          <FiMove size={14} /> Drag to reorder and resize from the corner
        </div>

        {error && (
          <div className="dashboard-error-wrap">
            <Error message={error} />
          </div>
        )}
      </ResizableShell>
    ),
    "hero-spotlight": (
      <ResizableShell
        key="hero-spotlight"
        widgetId="hero-spotlight"
        widgetSizes={widgetSizes}
        setWidgetSizes={setWidgetSizes}
        className="dashboard-hero-panel"
        sizeMode="vertical"
        draggableProps={createDragHandlers("hero", "hero-spotlight", setHeroOrder)}
        isDragging={draggingItem?.group === "hero" && draggingItem?.itemKey === "hero-spotlight"}
      >
        <div className="dashboard-panel-label">Today&apos;s Spotlight</div>
        <div className="dashboard-panel-value">{dashboardSummary.spotlightLabel.label}</div>
        <p className="dashboard-panel-text">
          {dashboardSummary.spotlightLabel.value} team members are currently in the {dashboardSummary.spotlightLabel.label.toLowerCase()} segment.
        </p>

        <div className="dashboard-spotlight-list">
          <div className="dashboard-spotlight-item">
            <span>Engaged Team</span>
            <strong>{dashboardSummary.engagedCount}</strong>
          </div>
          <div className="dashboard-spotlight-item">
            <span>Absence Rate</span>
            <strong>{dashboardSummary.absentRate}</strong>
          </div>
          <div className="dashboard-spotlight-item">
            <span>Present Count</span>
            <strong>{dashboardSummary.totalPresent}</strong>
          </div>
        </div>

        <div className="dashboard-hero-drag dashboard-hero-drag--light">
          <FiMove size={14} /> Drag to reorder and resize from the corner
        </div>
      </ResizableShell>
    ),
  };

  const lowerSections = {
    "attendance-mix": (
      <DashboardSection
        key="attendance-mix"
        widgetId="attendance-mix-section"
        widgetSizes={widgetSizes}
        setWidgetSizes={setWidgetSizes}
        draggableProps={createDragHandlers("lower-sections", "attendance-mix", setLowerSectionOrder)}
        isDragging={draggingItem?.group === "lower-sections" && draggingItem?.itemKey === "attendance-mix"}
      >
        <div className="dashboard-section-head">
          <div>
            <div className="dashboard-section-kicker">Attendance Mix</div>
            <h5 className="dashboard-section-title">Team energy breakdown</h5>
          </div>
          <button type="button" className="dashboard-pill-button" onClick={() => navigate("/dashboard/attendance")}>
            Open full attendance
          </button>
        </div>

        <div className="dashboard-metric-ribbon">
          <div>
            <span className="dashboard-ribbon-label">Coverage</span>
            <strong>{dashboardSummary.engagedRate}</strong>
          </div>
          <div>
            <span className="dashboard-ribbon-label">Headcount</span>
            <strong>{dashboardSummary.totalEmployees}</strong>
          </div>
        </div>

        <div className="dashboard-bars">
          {orderedAttendanceMix.map((item) => (
            <ResizableShell
              key={item.key}
              widgetId={`mix-${item.key}`}
              widgetSizes={widgetSizes}
              setWidgetSizes={setWidgetSizes}
              className="dashboard-bar-shell"
              draggableProps={createDragHandlers("mix", item.key, setMixOrder)}
              isDragging={draggingItem?.group === "mix" && draggingItem?.itemKey === item.key}
            >
              <button
                type="button"
                className="dashboard-bar-card"
                onClick={() => navigate(item.route)}
              >
                <div className="dashboard-bar-top">
                  <span className={`dashboard-bar-dot ${item.accentClass}`} />
                  <span className="dashboard-bar-label">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="dashboard-bar-track">
                  <div
                    className={`dashboard-bar-fill ${item.accentClass}`}
                    style={{ width: formatPercent(item.value, dashboardSummary.totalEmployees) }}
                  />
                </div>
                <div className="dashboard-bar-foot">{formatPercent(item.value, dashboardSummary.totalEmployees)} of employees</div>
              </button>
            </ResizableShell>
          ))}
        </div>
      </DashboardSection>
    ),
    "quick-actions": (
      <DashboardSection
        key="quick-actions"
        widgetId="quick-actions-section"
        widgetSizes={widgetSizes}
        setWidgetSizes={setWidgetSizes}
        draggableProps={createDragHandlers("lower-sections", "quick-actions", setLowerSectionOrder)}
        isDragging={draggingItem?.group === "lower-sections" && draggingItem?.itemKey === "quick-actions"}
      >
        <div className="dashboard-section-head">
          <div>
            <div className="dashboard-section-kicker">Quick Actions</div>
            <h5 className="dashboard-section-title">Move faster from the dashboard</h5>
          </div>
        </div>

        <div className="dashboard-action-grid">
          {orderedQuickActions.map((action) => (
            <QuickAction
              key={action.key}
              widgetId={`action-${action.key}`}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              widgetSizes={widgetSizes}
              setWidgetSizes={setWidgetSizes}
              draggableProps={createDragHandlers("actions", action.key, setActionOrder)}
              isDragging={draggingItem?.group === "actions" && draggingItem?.itemKey === action.key}
            />
          ))}
        </div>
      </DashboardSection>
    ),
  };

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        {heroOrder.map((key) => heroSections[key])}
      </div>

      <div className="dashboard-stats-grid">
        {orderedStatCards.map((card) => (
          <StatCard
            key={card.key}
            widgetId={`stat-${card.key}`}
            label={card.label}
            value={card.value}
            accentClass={card.accentClass}
            icon={card.icon}
            note={card.note}
            onView={card.onView}
            widgetSizes={widgetSizes}
            setWidgetSizes={setWidgetSizes}
            draggableProps={createDragHandlers("stats", card.key, setStatOrder)}
            isDragging={draggingItem?.group === "stats" && draggingItem?.itemKey === card.key}
          />
        ))}
      </div>

      <div className="dashboard-lower-grid">
        {lowerSectionOrder.map((key) => lowerSections[key])}
      </div>
    </div>
  );
}
