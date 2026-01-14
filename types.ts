
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface Budget {
  category: string;
  limit: number;
}

export enum Tab {
  Dashboard = 'Dashboard',
  Budgeting = 'Budgeting',
  Analysis = 'Analysis',
  ImageTools = 'Image Tools',
  Chatbot = 'Chatbot',
}
