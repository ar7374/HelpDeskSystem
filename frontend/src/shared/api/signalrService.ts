import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7167';

/**
 * Creates and configures a SignalR HubConnection for the Dashboard Hub.
 */
export const createDashboardConnection = () => {
  return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/dashboard`, {
      accessTokenFactory: () => localStorage.getItem('accessToken') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
};

/**
 * Creates and configures a SignalR HubConnection for the Comments Hub.
 */
export const createCommentConnection = () => {
  return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/comments`, {
      accessTokenFactory: () => localStorage.getItem('accessToken') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
};
