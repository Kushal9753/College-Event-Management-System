import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  PlusSquare,
  UserCircle,
  Compass,
  Ticket,
  GraduationCap,
  CreditCard,
  Award,
  MessageSquare,
  BarChart3,
  Users2,
  CalendarDays
} from 'lucide-react';

/**
 * Sidebar Configuration
 * ---------------------
 * Config-driven sidebar menus — one entry per role.
 * Each item has: label, path (relative to the panel root), and an icon.
 * To add a new page, just add an entry here and create the corresponding page component.
 */

const icons = {
 dashboard: LayoutDashboard,
 users: Users,
 calendar: Calendar,
 settings: Settings,
 create: PlusSquare,
 profile: UserCircle,
 browse: Compass,
 ticket: Ticket,
 faculty: GraduationCap,
 payments: CreditCard,
 results: Award,
 feedback: MessageSquare,
 reports: BarChart3,
 participants: Users2,
 communication: MessageSquare,
 schedule: CalendarDays,
};


// --- Sidebar menus per role ---
const sidebarConfig = {
 admin: [
 { label: 'Dashboard', path: '', icon: icons.dashboard },
 { label: 'Manage Faculty', path: 'faculty', icon: icons.faculty },
 { label: 'Manage Events', path: 'events', icon: icons.calendar },
 { label: 'Payments', path: 'payments', icon: icons.payments },
 { label: 'Results', path: 'results', icon: icons.results },
 { label: 'Reports', path: 'reports', icon: icons.reports },
 { label: 'Feedback / Messages', path: 'communication', icon: icons.communication },
 ],
 faculty: [
 { label: 'Dashboard', path: '', icon: icons.dashboard },
 { label: 'Create Event', path: 'create-event', icon: icons.create },
 { label: 'Assigned Events', path: 'my-events', icon: icons.calendar },
 { label: 'Participants', path: 'participants', icon: icons.participants },
 { label: 'Results', path: 'results', icon: icons.results },

 { label: 'Communication', path: 'communication', icon: icons.communication },
 { label: 'Profile', path: 'profile', icon: icons.profile },
 ],
 student: [
 { label: 'Dashboard', path: '', icon: icons.dashboard },
 { label: 'Available Events', path: 'available-events', icon: icons.browse },
 { label: 'My Events', path: 'my-events', icon: icons.ticket },
 { label: 'Payments', path: 'payments', icon: icons.payments },
 { label: 'My Result', path: 'my-result', icon: icons.results },
 { label: 'Profile', path: 'profile', icon: icons.profile },
 ],
};

export default sidebarConfig;
