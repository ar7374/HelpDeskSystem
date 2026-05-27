import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const BASE_URL = 'https://localhost:7167'; // Matches axiosClient.ts and Program.cs SSL port

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
