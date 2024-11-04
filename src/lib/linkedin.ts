// src/lib/linkedin.ts
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
      
      return this.transformProfileData(await response.json());
    }
  
    async getPositions() {
      const response = await fetch(
        `${this.baseUrl}/me/positions?projection=(*)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      return response.json();
    }
  
    async getSkills() {
      const response = await fetch(
        `${this.baseUrl}/me/skills`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      return response.json();
    }
  
    private transformProfileData(raw: any): LinkedInProfile {
      // Transform LinkedIn's raw response into our LinkedInProfile type
      return {
        id: raw.id,
        firstName: raw.localizedFirstName,
        lastName: raw.localizedLastName,
        // ... transform other fields
      };
    }
  }
  