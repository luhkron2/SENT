import { logger } from '@/lib/logger';

const GEARBOX_BASE_URL = 'https://api.gearbox.com.au/public';

interface GearboxAuthConfig {
  clientId: string;
  clientSecret: string;
}

interface GearboxTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GearboxVehicle {
  id: string;
  fleet_number: string;
  prime_rego: string;
  trailer_a?: string;
  trailer_b?: string;
  make?: string;
  model?: string;
  year?: number;
}

interface GearboxService {
  id: string;
  service_number: number;
  fleet_number: string;
  date_open: string;
  date_closed?: string;
  closed: boolean;
  service_type: string;
  description?: string;
}

interface GearboxFaultReport {
  id: string;
  fleet_number: string;
  report_date: string;
  description: string;
  severity?: string;
  status?: string;
}

class GearboxClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: GearboxAuthConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  async authenticate(): Promise<string> {
    try {
      const response = await fetch('https://api.gearbox.com.au/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as GearboxTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      logger.info('Successfully authenticated with Gearbox API');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to authenticate with Gearbox API:', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
    if (!this.accessToken) {
      throw new Error('Failed to obtain access token');
    }
    return this.accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${GEARBOX_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getVehicles(params?: { filter?: string }): Promise<GearboxVehicle[]> {
    const query = params?.filter ? `?filter=${encodeURIComponent(params.filter)}` : '';
    return this.request<GearboxVehicle[]>(`/v1/vehicles${query}`);
  }

  async getServices(params?: { filter?: string }): Promise<GearboxService[]> {
    const query = params?.filter ? `?filter=${encodeURIComponent(params.filter)}` : '';
    return this.request<GearboxService[]>(`/v1/services${query}`);
  }

  async getFaultReports(params?: { filter?: string }): Promise<GearboxFaultReport[]> {
    const query = params?.filter ? `?filter=${encodeURIComponent(params.filter)}` : '';
    return this.request<GearboxFaultReport[]>(`/v1/fault_reports${query}`);
  }

  async createService(serviceData: Partial<GearboxService>): Promise<GearboxService> {
    return this.request<GearboxService>('/v1/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async createFaultReport(reportData: Partial<GearboxFaultReport>): Promise<GearboxFaultReport> {
    return this.request<GearboxFaultReport>('/v1/fault_reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }
}

let clientInstance: GearboxClient | null = null;

export function getGearboxClient(): GearboxClient {
  if (!clientInstance) {
    const clientId = process.env.GEARBOX_CLIENT_ID;
    const clientSecret = process.env.GEARBOX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Gearbox credentials not configured. Please set GEARBOX_CLIENT_ID and GEARBOX_CLIENT_SECRET environment variables.');
    }

    clientInstance = new GearboxClient({ clientId, clientSecret });
  }

  return clientInstance;
}

export type {
  GearboxVehicle,
  GearboxService,
  GearboxFaultReport,
  GearboxAuthConfig,
};
