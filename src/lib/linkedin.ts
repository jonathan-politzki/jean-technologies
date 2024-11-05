// src/lib/linkedin.ts
import { LinkedInProfile } from './types';

export class LinkedInClient {
    private baseUrl = 'https://api.linkedin.com/v2/userinfo';
    
    constructor(private accessToken: string) {}
    
    async getProfile(): Promise<LinkedInProfile> {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Fetching LinkedIn OIDC profile`);
        
        const response = await fetch(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });
        
        if (!response.ok) {
            console.error(`[${timestamp}] LinkedIn profile fetch failed:`, {
                status: response.status,
                statusText: response.statusText
            });
            throw new Error('Failed to fetch LinkedIn profile');
        }
        
        const data = await response.json();
        console.log(`[${timestamp}] LinkedIn profile data received:`, {
            hasId: !!data.sub,
            hasEmail: !!data.email,
            hasPicture: !!data.picture
        });
        
        return {
            id: data.sub || data.id || '',
            firstName: data.given_name || '',
            lastName: data.family_name || '',
            email: data.email || '',
            profilePicture: data.picture || ''
        };
    }
}
  