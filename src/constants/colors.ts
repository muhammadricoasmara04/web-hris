export const EMPLOYEE_ATTENDANCE_COLORS = {
  screen: {
    base: "#05070E",
    mapOverlay: "linear-gradient(to top, rgba(5, 8, 20, 0.78), rgba(5, 8, 20, 0))",
  },
  panel: {
    borderTop: "rgba(236, 242, 255, 0.2)",
    insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.28)",
  },
  toggle: {
    background: "#F8B400",
    text: "#FFFFFF",
    shadow: "0 12px 28px rgba(248,180,0,0.42)",
  },
  heading: {
    overline: "#7C8799",
    time: "#101522",
    date: "#4B5568",
  },
  actions: {
    clockIn: {
      background: "linear-gradient(135deg, #34F5B5 0%, #12C98E 100%)",
      text: "#053226",
      shadow: "0 14px 30px rgba(18, 201, 142, 0.28)",
    },
    clockOut: {
      background: "linear-gradient(135deg, #FF7A98 0%, #FF4F7D 100%)",
      text: "#4B1023",
      shadow: "0 14px 30px rgba(255, 79, 125, 0.27)",
    },
  },
  history: {
    title: "#9AA5B6",
    viewAll: "#00A8FF",
    card: {
      background: "rgba(255, 255, 255, 0.46)",
      border: "rgba(255, 255, 255, 0.56)",
      time: "#111827",
      title: "#1F2937",
      subtitle: "#5D687A",
      status: "#0FB66E",
    },
    cardMuted: {
      background: "rgba(255, 255, 255, 0.3)",
      border: "rgba(255, 255, 255, 0.4)",
      title: "#80889A",
      subtitle: "#A0A8B8",
    },
    iconIn: {
      background: "#DCFDF1",
      text: "#10B981",
    },
    iconOut: {
      background: "rgba(203, 213, 225, 0.5)",
      text: "#6B7280",
    },
  },
  collapsed: {
    overline: "#7C8799",
    time: "#101522",
    date: "#4B5568",
  },
} as const;
