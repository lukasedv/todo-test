export interface SourceMeta {
  type: 'email' | 'teams' | 'planner';
  messageId: string;
  sourceUrl: string;
  sender?: string;
  subject?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  order?: number;
  source?: SourceMeta;
  weatherSensitive?: boolean;
}

export type TemperatureUnit = 'C' | 'F';

export interface WeatherCondition {
  temperature: number;
  temperatureUnit: TemperatureUnit;
  conditionCode: number;
  conditionText: string;
  icon: string;
  high?: number;
  low?: number;
}

export interface WeatherForecastDay {
  date: string;
  condition: WeatherCondition;
}

export interface WeatherData {
  location: string;
  current: WeatherCondition;
  forecast: WeatherForecastDay[];
  fetchedAt: string;
}

export interface WeatherPreferences {
  latitude?: number;
  longitude?: number;
  cityName?: string;
  unit: TemperatureUnit;
}

export type Filter = 'all' | 'active' | 'completed';
export type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title' | 'manual';
export type Priority = 'low' | 'medium' | 'high';

export interface Suggestion {
  id: string;
  sourceType: 'email' | 'teams' | 'planner';
  messageId: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedPriority: Priority;
  suggestedDueDate?: string;
  suggestedTags: string[];
  sourceUrl: string;
  senderName: string;
  senderEmail: string;
  emailSubject: string;
  emailDate: string;
  snippet: string;
  actionPhrase: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'dismissed';
}

export type TimeWindow = '1d' | '3d' | '7d' | '30d';

export interface M365Config {
  enabled: boolean;
  folders: string[];
  timeWindow: TimeWindow;
  importFlagged: boolean;
  autoSyncInterval: number;
  customKeywords: string[];
}

export interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  flag: {
    flagStatus: 'notFlagged' | 'flagged' | 'complete';
  };
  importance: 'low' | 'normal' | 'high';
  isRead: boolean;
}

export interface ActionItem {
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string;
  actionPhrase: string;
  snippet: string;
}

export interface MailFolder {
  id: string;
  displayName: string;
  totalItemCount: number;
}
