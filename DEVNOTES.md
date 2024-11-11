Key findings during development of bug fixing for Auth and other functionality: 

- Originally, codebase was using old deprecated Supabase Auth library. https://github.com/supabase/auth-helpers 
- Replacing with the new library, supabase/ssr https://github.com/supabase/ssr, was a multistep process:
    - Next.js 15 has a breaking change where any dynamic server APIs like cookies need to be awaited first 
    - The original pattern of wrapping the entire app in a Supabase auth context was brittle, since state changes relied on rerenders instead of fresh data
    - Alongside this, I also moved most code to SSR + server actions
        - The primary benefit here is data fetching can easily be done per-request and doesn't rely on client-side state
        - Debugging requests through the server is a bit easier since we can more easily see the request context
- Other changes that aren't directly noticable in the codebase:
    - Instead of having the route handler at app/auth/callback handle creating and updating users, there's now a database trigger for this called `handle_user_auth` that lives on the 
    `auth` schema, which triggers a function called `add_public_user_on_auth` that lives on the `public` schema
        - If we try to do it through code, we have to create an 'admin' user by using your secret key vs. the anon/service role keys, which is a security risk (not a huge one, since th ecode is on the server but still a best practice)
        - Triggers could also be made for updating social_profiles, but this is slightlymore complex since you have to handle upserts for refresh tokens 
    - Instead of `window.location` to find the URL to redirect to, I'm using `NEXT_PUBLIC_BASE_URL` instead. **You will need to make sure this is properly configered in Vercel for it to work on prod**

- Here are links discussion the potential issue (Supabase bug?) that appears to occur after 24 hours of auth:
    - https://www.reddit.com/r/Supabase/comments/1g76vfr/supabase_auth_is_not_refresing_my_auth_cookies/?rdt=64688
    - https://github.com/supabase/ssr/issues/68
    - https://github.com/supabase/supabase/issues/30218

Important note on OAuth data: 
Here's what some sample data looks like with some notes that are important. Highly recommend remembering these details, as it will help you later: 

```
{
  access_token: 'verylongstring',
  token_type: 'bearer',
```
**`This is token expiry time. As mentioned in our Upwork convo, there appears to be a bug where after 24 hours, the token expires and you have to re-authenticate. Keep an eye on this.`**
```
  expires_in: 3600,
  expires_at: 1731301055,
  refresh_token: 'jAlAlvL-ldaviBVxAJzENA',
  user: {
    id: 'bc2abdd6-1614-41ef-8817-72d5a0f81f93',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'femiorokunle@gmail.com',
    email_confirmed_at: '2024-11-11T02:53:40.883752Z',
    phone: '',
    confirmed_at: '2024-11-11T02:53:40.883752Z',
    last_sign_in_at: '2024-11-11T03:57:35.62602501Z',
```
**`To see which provider the user JUST added, DON'T use `user.app_metadata.provider` even though that seems intuitive. Instead, use `user.user_metadata.iss` to see which url was used. There's no field that gets returned in the session that only returns the provider name, unfortunately.`**
```
    app_metadata: { provider: 'linkedin_oidc', providers: ['linkedin_oidc', 'google'] },
    user_metadata: {
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocLab5NVh7qP0P71bmVEh7roVRgAhm-TkKQBH_UsA7h2kfPTKUkr=s96-c',
      email: 'femiorokunle@gmail.com',
      email_verified: true,
      family_name: 'Orokunle',
      full_name: 'Femi Orokunle',
      given_name: 'Femi',
```
**`Use this URL to find the provider with .includes() or something similar.`**
```
      iss: 'https://accounts.google.com',
      locale: 'en_US',
      name: 'Femi Orokunle',
      phone_verified: false,
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocLab5NVh7qP0P71bmVEh7roVRgAhm-TkKQBH_UsA7h2kfPTKUkr=s96-c',
      provider_id: '114417347604883397027',
      sub: '114417347604883397027'
    },
    identities: [
      {
```
**`Data on a per-identity basis. This is ONLY safe to use if you check the user's session first, to make sure they're authenticated.`**
**`Note: each `id` is unique to each user, per platform. So if you and I login via Google, we'll have different `id`s.`**
```
        identity_id: 'b99d0738-96f6-44d5-bf6f-e8fcc7064fad',
        id: '114417347604883397027',
```
**`The `user_id` is the same as the user's `id` field in the `users` table on the auth schema. Important: Supabase controls your auth schema, so be careful when querying it to avoid leaking other users' data. Right now RLS dictates that users can only see their own data, but if you ever allow public access to the public.users table (such as accidentally passing an object with props that has other people's `user_id`s), a bad actor could discover other user's data.`**

```
        user_id: 'bc2abdd6-1614-41ef-8817-72d5a0f81f93',
        identity_data: {
          avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocLab5NVh7qP0P71bmVEh7roVRgAhm-TkKQBH_UsA7h2kfPTKUkr=s96-c',
          email: 'femiorokunle@gmail.com',
          email_verified: true,
          full_name: 'Femi Orokunle',
          iss: 'https://accounts.google.com',
          name: 'Femi Orokunle',
          phone_verified: false,
          picture: 'https://lh3.googleusercontent.com/a/ACg8ocLab5NVh7qP0P71bmVEh7roVRgAhm-TkKQBH_UsA7h2kfPTKUkr=s96-c',
          provider_id: '114417347604883397027',
          sub: '114417347604883397027'
        },
        provider: 'google',
        last_sign_in_at: '2024-11-11T02:53:40.876094Z',
        created_at: '2024-11-11T02:53:40.876155Z',
        updated_at: '2024-11-11T04:25:32.139838Z',
        email: 'femiorokunle@gmail.com'
      },
      {
        identity_id: '9ae475d4-18b5-4391-b8ba-f59640b8c631',
        id: 'KYs098ERNb',
        user_id: 'bc2abdd6-1614-41ef-8817-72d5a0f81f93',
        identity_data: {
          email: 'femiorokunle@gmail.com',
          email_verified: true,
          family_name: 'Orokunle',
          given_name: 'Femi',
          iss: 'https://www.linkedin.com/oauth',
          locale: 'en_US',
          name: 'Femi Orokunle',
          phone_verified: false,
          picture: 'https://media.licdn.com/dms/image/v2/C5603AQF95GfERF2yUQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1627535615419?e=2147483647&v=beta&t=ooMIrPKagMtFICuBBe1dFVltGm1hCyQFhZ9_nEwXLtE',
          provider_id: 'KYs098ERNb',
          sub: 'KYs098ERNb'
        },
        provider: 'linkedin_oidc',
        last_sign_in_at: '2024-11-11T02:54:09.227438Z',
        created_at: '2024-11-11T02:54:09.22749Z',
        updated_at: '2024-11-11T03:04:45.196252Z',
        email: 'femiorokunle@gmail.com'
      }
    ],
    created_at: '2024-11-11T02:53:40.864992Z',
    updated_at: '2024-11-11T03:57:35.630817Z',
    is_anonymous: false
  },
  provider_token: 'anotherlongstring'
}
```
# Final notes, thoughts, suggestions

## Edge Functions & Profiles
- I can't see your edge functions, but one of them is failing; if you're trying to query a user's profile, you may need to double check what data we're passing to it. I don't think we can construct the profile URL based on what we have unless you're searching for the name. 

## State Management
- If you need app-wide state, think about `zustand` since the overhead is much lower than React Context. 
- Strongly recommend using as much serverside code as possible. Rule of thumb: it only needs to be a client component if it needs client-interaction (scrolling, clicking, etc). AI will try to default to fetching data with useEffect and storing it in state all the time, which isn't idiomatic anymore.

## Library recommendations
- React Query: data fetching + state management
- Zustand: straightforward app-wide state management
- Nuqs: URL state management (very underrated, useful if you ever see yourself using the URL for handling behavior such as /user/123?data=linkedin&data=google, etc)

## My suggestions
### NextAuth Considerations
- Consider using NextAuth in the future, because it maintains pretty much every OAuth provider you could ever think of; from there your only concern is uploading data to your database. It's also more configurable on behavior and easier to debug.
  - However, it's tricky to use with username/password, so keep that in mind.
  - The time/investment is only worth it if you want to add, say, a dozen OAuth providers and not all of them are supported by Supabase.

### Infrastructure & Development
- If you're hosting on Vercel, keep an eye on your middleware usage. We're using it to check auth on each request (besides images and /login), so theoretically you could hit high usage if your traffic spikes. 
- Keep in mind that 99% of the time, AI will try to go back to old patterns for React and Next.js. Even if you give it explicit instructions, it can still fallback to old behavior. I've generated a "best practices" file that you can use as a reference, but you'll probably want to modify it to your liking.
- Always use XML tags e.g. <requirements>...</requirements> for for AI instructions. This advice comes straight from Anthropic and makes a huge difference