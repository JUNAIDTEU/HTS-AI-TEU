
export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  sources?: Source[];
  isCached?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
  requiresCountry?: boolean;
  selectedCountry?: string;
  waitingForCountry?: boolean;
}

export interface AdminSettings {
  systemInstruction: string;
  temperature?: number;
  maxTokens?: number;
  useCache?: boolean;
  apiEndpoint?: string;
  // Preferred default theme for the user (optional)
  defaultTheme?: 'light' | 'dark';
  // Add any other custom settings here
}
