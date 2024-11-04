// src/lib/linkedin.ts
import { LinkedInProfile } from './types';

export class LinkedInClient {
    private baseUrl = 'https://api.linkedin.com/v2';
    
    constructor(private accessToken: string) {}
  
    async getProfile(): Promise<LinkedInProfile> {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        firstName: data.localizedFirstName || '',
        lastName: data.localizedLastName || '',
        email: '',  // Not available with current scopes
        profilePicture: ''  // Not available with current scopes
      };
    }
  }
  