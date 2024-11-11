Next.js Best Practices
- use server actions within forms and/or buttons in client components instead of route handlers when appropriate
- be careful passing down data from server components to client components, as it can lead to exposing sensitive data to the client
- keep actions in file with "use server" at the top of the file
- use `zustand` for app-wide state management instead of React Context
- revalidate data after mutations
- don't redirect inside try/catch 
- use suspense if you want to lazy load a component. Note: wrapped component MUST be async
- for performance, push all data fetching down as much as possible to keep components static when you can
- server actions are 1) POST requests, so not for fetching data 2) technically code that is used client side, but runs on the server. 
- you only need "use server" if your code is going to be used in a client component
- If you want to pre-load or reuse data, use `React cache` to initialize the promise and pass it down. E.g.:
```
import {cache} from 'react';
import calculateMetrics from 'lib/metrics';

const getMetrics = cache(calculateMetrics);

function Chart({data}) {
  const report = getMetrics(data);
  // ...
}
```
- Keep data fetching as simple as possible.

Next.js 15 breaking changes: 
- await cookies(), searchParams
- by default route handlers aren't cached

# Context

** Below are samples from the Next.js and React docs that can be used for reference and AI context for Cursor/Copilot/etc. **

Server Actions and Mutations
Server Actions are asynchronous functions that are executed on the server. They can be called in Server and Client Components to handle form submissions and data mutations in Next.js applications.

🎥 Watch: Learn more about mutations with Server Actions → YouTube (10 minutes).

Convention
A Server Action can be defined with the React "use server" directive. You can place the directive at the top of an async function to mark the function as a Server Action, or at the top of a separate file to mark all exports of that file as Server Actions.

Server Components
Server Components can use the inline function level or module level "use server" directive. To inline a Server Action, add "use server" to the top of the function body:

app/page.tsx
TypeScript

TypeScript
```
export default function Page() {
  // Server Action
  async function create() {
    'use server'
    // Mutate data
  }
 
  return '...'
}
```
Client Components
To call a Server Action in a Client Component, create a new file and add the "use server" directive at the top of it. All exported functions within the file will be marked as Server Actions that can be reused in both Client and Server Components:

app/actions.ts
TypeScript

TypeScript
```

'use server'
 
export async function create() {}
```
app/ui/button.tsx
TypeScript

TypeScript
```
'use client'
 
import { create } from '@/app/actions'
 
export function Button() {
  return <button onClick={() => create()}>Create</button>
}
```
Passing actions as props
You can also pass a Server Action to a Client Component as a prop:
```

<ClientComponent updateItemAction={updateItem} />
```
app/client-component.tsx
TypeScript

```
'use client'
 
export default function ClientComponent({
  updateItemAction,
}: {
  updateItemAction: (formData: FormData) => void
}) {
  return <form action={updateItemAction}>{/* ... */}</form>
}
```
Usually, the Next.js TypeScript plugin would flag updateItemAction in client-component.tsx since it is a function which generally can't be serialized across client-server boundaries. However, props named action or ending with Action are assumed to receive Server Actions. This is only a heuristic since the TypeScript plugin doesn't actually know if it receives a Server Action or an ordinary function. Runtime type-checking will still ensure you don't accidentally pass a function to a Client Component.

Behavior
Server actions can be invoked using the action attribute in a <form> element:
Server Components support progressive enhancement by default, meaning the form will be submitted even if JavaScript hasn't loaded yet or is disabled.
In Client Components, forms invoking Server Actions will queue submissions if JavaScript isn't loaded yet, prioritizing client hydration.
After hydration, the browser does not refresh on form submission.
Server Actions are not limited to <form> and can be invoked from event handlers, useEffect, third-party libraries, and other form elements like <button>.
Server Actions integrate with the Next.js caching and revalidation architecture. When an action is invoked, Next.js can return both the updated UI and new data in a single server roundtrip.
Behind the scenes, actions use the POST method, and only this HTTP method can invoke them.
The arguments and return value of Server Actions must be serializable by React. See the React docs for a list of serializable arguments and values.
Server Actions are functions. This means they can be reused anywhere in your application.
Server Actions inherit the runtime from the page or layout they are used on.
Server Actions inherit the Route Segment Config from the page or layout they are used on, including fields like maxDuration.
Examples
Forms
React extends the HTML <form> element to allow Server Actions to be invoked with the action prop.

When invoked in a form, the action automatically receives the FormData object. You don't need to use React useState to manage fields, instead, you can extract the data using the native FormData methods:

app/invoices/page.tsx
TypeScript

TypeScript

export default function Page() {
  async function createInvoice(formData: FormData) {
    'use server'
 
    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }
 
    // mutate data
    // revalidate cache
  }
 
  return <form action={createInvoice}>...</form>
}
Good to know:

Example: Form with Loading & Error States
When working with forms that have many fields, you may want to consider using the entries() method with JavaScript's Object.fromEntries(). For example: const rawFormData = Object.fromEntries(formData). One thing to note is that the formData will include additional $ACTION_ properties.
See React <form> documentation to learn more.
Passing additional arguments
You can pass additional arguments to a Server Action using the JavaScript bind method.

app/client-component.tsx
TypeScript

TypeScript

'use client'
 
import { updateUser } from './actions'
 
export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId)
 
  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update User Name</button>
    </form>
  )
}
The Server Action will receive the userId argument, in addition to the form data:

app/actions.ts
TypeScript

TypeScript

'use server'
 
export async function updateUser(userId: string, formData: FormData) {}
Good to know:

An alternative is to pass arguments as hidden input fields in the form (e.g. <input type="hidden" name="userId" value={userId} />). However, the value will be part of the rendered HTML and will not be encoded.
.bind works in both Server and Client Components. It also supports progressive enhancement.
Nested form elements
You can also invoke a Server Action in elements nested inside <form> such as <button>, <input type="submit">, and <input type="image">. These elements accept the formAction prop or event handlers.

This is useful in cases where you want to call multiple server actions within a form. For example, you can create a specific <button> element for saving a post draft in addition to publishing it. See the React <form> docs for more information.

Programmatic form submission
You can trigger a form submission programmatically using the requestSubmit() method. For example, when the user submits a form using the ⌘ + Enter keyboard shortcut, you can listen for the onKeyDown event:

app/entry.tsx
TypeScript

TypeScript
```
'use client'
 
export function Entry() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.key === 'NumpadEnter')
    ) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }
 
  return (
    <div>
      <textarea name="entry" rows={20} required onKeyDown={handleKeyDown} />
    </div>
  )
}
```
This will trigger the submission of the nearest <form> ancestor, which will invoke the Server Action.

Server-side form validation
You can use the HTML attributes like required and type="email" for basic client-side form validation.

For more advanced server-side validation, you can use a library like zod to validate the form fields before mutating the data:

app/actions.ts
TypeScript

TypeScript
```
'use server'
 
import { z } from 'zod'
 
const schema = z.object({
  email: z.string({
    invalid_type_error: 'Invalid Email',
  }),
})
 
export default async function createUser(formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })
 
  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
 
  // Mutate data
}
```
Once the fields have been validated on the server, you can return a serializable object in your action and use the React useFormState hook to show a message to the user.

By passing the action to useFormState, the action's function signature changes to receive a new prevState or initialState parameter as its first argument.
useFormState is a React hook and therefore must be used in a Client Component.
app/actions.ts
TypeScript

TypeScript
```
'use server'
 
import { redirect } from 'next/navigation'
 
export async function createUser(prevState: any, formData: FormData) {
  const res = await fetch('https://...')
  const json = await res.json()
 
  if (!res.ok) {
    return { message: 'Please enter a valid email' }
  }
 
  redirect('/dashboard')
}
```
Then, you can pass your action to the useFormState hook and use the returned state to display an error message.

app/ui/signup.tsx
TypeScript

TypeScript

'use client'
 
import { useFormState } from 'react-dom'
import { createUser } from '@/app/actions'
 
const initialState = {
  message: '',
}
 
export function Signup() {
  const [state, formAction] = useFormState(createUser, initialState)
 
  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input type="text" id="email" name="email" required />
      {/* ... */}
      <p aria-live="polite">{state?.message}</p>
      <button>Sign up</button>
    </form>
  )
}
Good to know:

These examples use React's useFormState hook, which is bundled with the Next.js App Router. If you are using React 19, use useActionState instead. See the React docs for more information.
Pending states
Before mutating data, you should always ensure a user is also authorized to perform the action. See Authentication and Authorization.
The useFormStatus hook exposes a pending boolean that can be used to show a loading indicator while the action is being executed.

app/submit-button.tsx
TypeScript

TypeScript

'use client'
 
import { useFormStatus } from 'react-dom'
 
export function SubmitButton() {
  const { pending } = useFormStatus()
 
  return (
    <button disabled={pending} type="submit">
      Sign Up
    </button>
  )
}
Good to know:

In React 19, useFormStatus includes additional keys on the returned object, like data, method, and action. If you are not using React 19, only the pending key is available.
In React 19, useActionState also includes a pending key on the returned state.
Optimistic updates
You can use the React useOptimistic hook to optimistically update the UI before the Server Action finishes executing, rather than waiting for the response:

app/page.tsx
TypeScript

TypeScript

'use client'
 
import { useOptimistic } from 'react'
import { send } from './actions'
 
type Message = {
  message: string
}
 
export function Thread({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<
    Message[],
    string
  >(messages, (state, newMessage) => [...state, { message: newMessage }])
 
  const formAction = async (formData) => {
    const message = formData.get('message') as string
    addOptimisticMessage(message)
    await send(message)
  }
 
  return (
    <div>
      {optimisticMessages.map((m, i) => (
        <div key={i}>{m.message}</div>
      ))}
      <form action={formAction}>
        <input type="text" name="message" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
Event handlers
While it's common to use Server Actions within <form> elements, they can also be invoked with event handlers such as onClick. For example, to increment a like count:

app/like-button.tsx
TypeScript

TypeScript

'use client'
 
import { incrementLike } from './actions'
import { useState } from 'react'
 
export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)
 
  return (
    <>
      <p>Total Likes: {likes}</p>
      <button
        onClick={async () => {
          const updatedLikes = await incrementLike()
          setLikes(updatedLikes)
        }}
      >
        Like
      </button>
    </>
  )
}
You can also add event handlers to form elements, for example, to save a form field onChange:

app/ui/edit-post.tsx

'use client'
 
import { publishPost, saveDraft } from './actions'
 
export default function EditPost() {
  return (
    <form action={publishPost}>
      <textarea
        name="content"
        onChange={async (e) => {
          await saveDraft(e.target.value)
        }}
      />
      <button type="submit">Publish</button>
    </form>
  )
}
For cases like this, where multiple events might be fired in quick succession, we recommend debouncing to prevent unnecessary Server Action invocations.

useEffect
You can use the React useEffect hook to invoke a Server Action when the component mounts or a dependency changes. This is useful for mutations that depend on global events or need to be triggered automatically. For example, onKeyDown for app shortcuts, an intersection observer hook for infinite scrolling, or when the component mounts to update a view count:

app/view-count.tsx
TypeScript

TypeScript

'use client'
 
import { incrementViews } from './actions'
import { useState, useEffect } from 'react'
 
export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState(initialViews)
 
  useEffect(() => {
    const updateViews = async () => {
      const updatedViews = await incrementViews()
      setViews(updatedViews)
    }
 
    updateViews()
  }, [])
 
  return <p>Total Views: {views}</p>
}
Remember to consider the behavior and caveats of useEffect.

Error Handling
When an error is thrown, it'll be caught by the nearest error.js or <Suspense> boundary on the client. We recommend using try/catch to return errors to be handled by your UI.

For example, your Server Action might handle errors from creating a new item by returning a message:

app/actions.ts
TypeScript

TypeScript

'use server'
 
export async function createTodo(prevState: any, formData: FormData) {
  try {
    // Mutate data
  } catch (e) {
    throw new Error('Failed to create task')
  }
}
Good to know:

Aside from throwing the error, you can also return an object to be handled by useFormState. See Server-side validation and error handling.
Revalidating data
You can revalidate the Next.js Cache inside your Server Actions with the revalidatePath API:

app/actions.ts
TypeScript

TypeScript

'use server'
 
import { revalidatePath } from 'next/cache'
 
export async function createPost() {
  try {
    // ...
  } catch (error) {
    // ...
  }
 
  revalidatePath('/posts')
}
Or invalidate a specific data fetch with a cache tag using revalidateTag:

app/actions.ts
TypeScript

TypeScript

'use server'
 
import { revalidateTag } from 'next/cache'
 
export async function createPost() {
  try {
    // ...
  } catch (error) {
    // ...
  }
 
  revalidateTag('posts')
}
Redirecting
If you would like to redirect the user to a different route after the completion of a Server Action, you can use redirect API. redirect needs to be called outside of the try/catch block:

app/actions.ts
TypeScript

TypeScript

'use server'
 
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
 
export async function createPost(id: string) {
  try {
    // ...
  } catch (error) {
    // ...
  }
 
  revalidateTag('posts') // Update cached posts
  redirect(`/post/${id}`) // Navigate to the new post page
}
Cookies
You can get, set, and delete cookies inside a Server Action using the cookies API:

app/actions.ts
TypeScript

TypeScript

'use server'
 
import { cookies } from 'next/headers'
 
export async function exampleAction() {
  const cookieStore = await cookies()
 
  // Get cookie
  cookieStore.get('name')?.value
 
  // Set cookie
  cookieStore.set('name', 'Delba')
 
  // Delete cookie
  cookieStore.delete('name')
}
See additional examples for deleting cookies from Server Actions.

Security
By default, when a Server Action is created and exported, it creates a public HTTP endpoint and should be treated with the same security assumptions and authorization checks. This means, even if a Server Action or utility function is not imported elsewhere in your code, it’s still a publicly accessible.

To improve security, Next.js has the following built-in features:

Secure action IDs: Next.js creates encrypted, non-deterministic IDs to allow the client to reference and call the Server Action. These IDs are periodically recalculated between builds for enhanced security.
Dead code elimination: Unused Server Actions (referenced by their IDs) are removed from client bundle to avoid public access by third-party.
Good to know:

The IDs are created during compilation and are cached for a maximum of 14 days. They will be regenerated when a new build is initiated or when the build cache is invalidated. This security improvement reduces the risk in cases where an authentication layer is missing. However, you should still treat Server Actions like public HTTP endpoints.


// app/actions.js
'use server'
 
// This action **is** used in our application, so Next.js
// will create a secure ID to allow the client to reference
// and call the Server Action.
export async function updateUserAction(formData) {}
 
// This action **is not** used in our application, so Next.js
// will automatically remove this code during `next build`
// and will not create a public endpoint.
export async function deleteUserAction(formData) {}
Authentication and authorization
You should ensure that the user is authorized to perform the action. For example:

app/actions.ts

'use server'
 
import { auth } from './lib'
 
export function addItem() {
  const { user } = auth()
  if (!user) {
    throw new Error('You must be signed in to perform this action')
  }
 
  // ...
}
Closures and encryption
Defining a Server Action inside a component creates a closure where the action has access to the outer function's scope. For example, the publish action has access to the publishVersion variable:

app/page.tsx
TypeScript

TypeScript

export default async function Page() {
  const publishVersion = await getLatestVersion();
 
  async function publish() {
    "use server";
    if (publishVersion !== await getLatestVersion()) {
      throw new Error('The version has changed since pressing publish');
    }
    ...
  }
 
  return (
    <form>
      <button formAction={publish}>Publish</button>
    </form>
  );
}
Closures are useful when you need to capture a snapshot of data (e.g. publishVersion) at the time of rendering so that it can be used later when the action is invoked.

However, for this to happen, the captured variables are sent to the client and back to the server when the action is invoked. To prevent sensitive data from being exposed to the client, Next.js automatically encrypts the closed-over variables. A new private key is generated for each action every time a Next.js application is built. This means actions can only be invoked for a specific build.

Good to know: We don't recommend relying on encryption alone to prevent sensitive values from being exposed on the client. Instead, you should use the React taint APIs to proactively prevent specific data from being sent to the client.

Overwriting encryption keys (advanced)
When self-hosting your Next.js application across multiple servers, each server instance may end up with a different encryption key, leading to potential inconsistencies.

To mitigate this, you can overwrite the encryption key using the process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY environment variable. Specifying this variable ensures that your encryption keys are persistent across builds, and all server instances use the same key.

This is an advanced use case where consistent encryption behavior across multiple deployments is critical for your application. You should consider standard security practices such key rotation and signing.

Good to know: Next.js applications deployed to Vercel automatically handle this.

Allowed origins (advanced)
Since Server Actions can be invoked in a <form> element, this opens them up to CSRF attacks.

Behind the scenes, Server Actions use the POST method, and only this HTTP method is allowed to invoke them. This prevents most CSRF vulnerabilities in modern browsers, particularly with SameSite cookies being the default.

As an additional protection, Server Actions in Next.js also compare the Origin header to the Host header (or X-Forwarded-Host). If these don't match, the request will be aborted. In other words, Server Actions can only be invoked on the same host as the page that hosts it.

For large applications that use reverse proxies or multi-layered backend architectures (where the server API differs from the production domain), it's recommended to use the configuration option serverActions.allowedOrigins option to specify a list of safe origins. The option accepts an array of strings.

next.config.js

/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ['my-proxy.com', '*.my-proxy.com'],
    },
  },
}
Learn more about Security and Server Actions.

Data Fetching and Caching
This guide will walk you through the basics of data fetching and caching in Next.js, providing practical examples and best practices.

Here's a minimal example of data fetching in Next.js:

app/page.tsx
TypeScript

TypeScript

export default async function Page() {
  let data = await fetch('https://api.vercel.app/blog')
  let posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
This example demonstrates a basic server-side data fetch using the fetch API in an asynchronous React Server Component.

Reference
fetch
React cache
Next.js unstable_cache
Examples
Fetching data on the server with the fetch API
This component will fetch and display a list of blog posts. The response from fetch is not cached by default.

app/page.tsx
TypeScript

TypeScript

export default async function Page() {
  let data = await fetch('https://api.vercel.app/blog')
  let posts = await data.json()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
If you are not using any Dynamic APIs anywhere else in this route, it will be prerendered during next build to a static page. The data can then be updated using Incremental Static Regeneration.

To prevent the page from prerendering, you can add the following to your file:


export const dynamic = 'force-dynamic'
However, you will commonly use functions like cookies, headers, or reading the incoming searchParams from the page props, which will automatically make the page render dynamically. In this case, you do not need to explicitly use force-dynamic.

Fetching data on the server with an ORM or database
This component will fetch and display a list of blog posts. The response from the database is not cached by default but could be with additional configuration.

app/page.tsx
TypeScript

TypeScript

import { db, posts } from '@/lib/db'
 
export default async function Page() {
  let allPosts = await db.select().from(posts)
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
If you are not using any Dynamic APIs anywhere else in this route, it will be prerendered during next build to a static page. The data can then be updated using Incremental Static Regeneration.

To prevent the page from prerendering, you can add the following to your file:


export const dynamic = 'force-dynamic'
However, you will commonly use functions like cookies, headers, or reading the incoming searchParams from the page props, which will automatically make the page render dynamically. In this case, you do not need to explicitly use force-dynamic.

Fetching data on the client
We recommend first attempting to fetch data on the server-side.

However, there are still cases where client-side data fetching makes sense. In these scenarios, you can manually call fetch in a useEffect (not recommended), or lean on popular React libraries in the community (such as SWR or React Query) for client fetching.

app/page.tsx
TypeScript

TypeScript

'use client'
 
import { useState, useEffect } from 'react'
 
export function Posts() {
  const [posts, setPosts] = useState(null)
 
  useEffect(() => {
    async function fetchPosts() {
      let res = await fetch('https://api.vercel.app/blog')
      let data = await res.json()
      setPosts(data)
    }
    fetchPosts()
  }, [])
 
  if (!posts) return <div>Loading...</div>
 
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
Caching data with an ORM or Database
You can use the unstable_cache API to cache the response to allow pages to be prerendered when running next build.

app/page.tsx
TypeScript

TypeScript

import { unstable_cache } from 'next/cache'
import { db, posts } from '@/lib/db'
 
const getPosts = unstable_cache(
  async () => {
    return await db.select().from(posts)
  },
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
)
 
export default async function Page() {
  const allPosts = await getPosts()
 
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
This example caches the result of the database query for 1 hour (3600 seconds). It also adds the cache tag posts which can then be invalidated with Incremental Static Regeneration.

Reusing data across multiple functions
Next.js uses APIs like generateMetadata and generateStaticParams where you will need to use the same data fetched in the page.

If you are using fetch, requests can be memoized by adding cache: 'force-cache'. This means you can safely call the same URL with the same options, and only one request will be made.

Good to know:

In previous versions of Next.js, using fetch would have a default cache value of force-cache. This changed in version 15, to a default of cache: no-store.
app/page.tsx
TypeScript

TypeScript

import { notFound } from 'next/navigation'
 
interface Post {
  id: string
  title: string
  content: string
}
 
async function getPost(id: string) {
  let res = await fetch(`https://api.vercel.app/blog/${id}`, {
    cache: 'force-cache',
  })
  let post: Post = await res.json()
  if (!post) notFound()
  return post
}
 
export async function generateStaticParams() {
  let posts = await fetch('https://api.vercel.app/blog', {
    cache: 'force-cache',
  }).then((res) => res.json())
 
  return posts.map((post: Post) => ({
    id: post.id,
  }))
}
 
export async function generateMetadata({ params }: { params: { id: string } }) {
  let post = await getPost(params.id)
 
  return {
    title: post.title,
  }
}
 
export default async function Page({ params }: { params: { id: string } }) {
  let post = await getPost(params.id)
 
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
If you are not using fetch, and instead using an ORM or database directly, you can wrap your data fetch with the React cache function. This will de-duplicate and only make one query.


import { cache } from 'react'
import { db, posts, eq } from '@/lib/db' // Example with Drizzle ORM
import { notFound } from 'next/navigation'
 
export const getPost = cache(async (id) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, parseInt(id)),
  })
 
  if (!post) notFound()
  return post
})
Revalidating cached data
Learn more about revalidating cached data with Incremental Static Regeneration.

Patterns
Parallel and sequential data fetching
When fetching data inside components, you need to be aware of two data fetching patterns: Parallel and Sequential.

Sequential and Parallel Data Fetching
Sequential: requests in a component tree are dependent on each other. This can lead to longer loading times.
Parallel: requests in a route are eagerly initiated and will load data at the same time. This reduces the total time it takes to load data.
Sequential data fetching
If you have nested components, and each component fetches its own data, then data fetching will happen sequentially if those data requests are not memoized.

There may be cases where you want this pattern because one fetch depends on the result of the other. For example, the Playlists component will only start fetching data once the Artist component has finished fetching data because Playlists depends on the artistID prop:

app/artist/[username]/page.tsx
TypeScript

TypeScript

export default async function Page({
  params: { username },
}: {
  params: { username: string }
}) {
  // Get artist information
  const artist = await getArtist(username)
 
  return (
    <>
      <h1>{artist.name}</h1>
      {/* Show fallback UI while the Playlists component is loading */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* Pass the artist ID to the Playlists component */}
        <Playlists artistID={artist.id} />
      </Suspense>
    </>
  )
}
 
async function Playlists({ artistID }: { artistID: string }) {
  // Use the artist ID to fetch playlists
  const playlists = await getArtistPlaylists(artistID)
 
  return (
    <ul>
      {playlists.map((playlist) => (
        <li key={playlist.id}>{playlist.name}</li>
      ))}
    </ul>
  )
}
You can use loading.js (for route segments) or React <Suspense> (for nested components) to show an instant loading state while React streams in the result.

This will prevent the whole route from being blocked by data requests, and the user will be able to interact with the parts of the page that are ready.

Parallel Data Fetching
By default, layout and page segments are rendered in parallel. This means requests will be initiated in parallel.

However, due to the nature of async/await, an awaited request inside the same segment or component will block any requests below it.

To fetch data in parallel, you can eagerly initiate requests by defining them outside the components that use the data. This saves time by initiating both requests in parallel, however, the user won't see the rendered result until both promises are resolved.

In the example below, the getArtist and getAlbums functions are defined outside the Page component and initiated inside the component using Promise.all:

app/artist/[username]/page.tsx
TypeScript

TypeScript

import Albums from './albums'
 
async function getArtist(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}`)
  return res.json()
}
 
async function getAlbums(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`)
  return res.json()
}
 
export default async function Page({
  params: { username },
}: {
  params: { username: string }
}) {
  const artistData = getArtist(username)
  const albumsData = getAlbums(username)
 
  // Initiate both requests in parallel
  const [artist, albums] = await Promise.all([artistData, albumsData])
 
  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums} />
    </>
  )
}
In addition, you can add a Suspense Boundary to break up the rendering work and show part of the result as soon as possible.

Preloading Data
Another way to prevent waterfalls is to use the preload pattern by creating an utility function that you eagerly call above blocking requests. For example, checkIsAvailable() blocks <Item/> from rendering, so you can call preload() before it to eagerly initiate <Item/> data dependencies. By the time <Item/> is rendered, its data has already been fetched.

Note that preload function doesn't block checkIsAvailable() from running.

components/Item.tsx
TypeScript

TypeScript

import { getItem } from '@/utils/get-item'
 
export const preload = (id: string) => {
  // void evaluates the given expression and returns undefined
  // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/void
  void getItem(id)
}
export default async function Item({ id }: { id: string }) {
  const result = await getItem(id)
  // ...
}
app/item/[id]/page.tsx
TypeScript

TypeScript

import Item, { preload, checkIsAvailable } from '@/components/Item'
 
export default async function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  // starting loading item data
  preload(id)
  // perform another asynchronous task
  const isAvailable = await checkIsAvailable()
 
  return isAvailable ? <Item id={id} /> : null
}
Good to know: The "preload" function can also have any name as it's a pattern, not an API.

Using React cache and server-only with the Preload Pattern
You can combine the cache function, the preload pattern, and the server-only package to create a data fetching utility that can be used throughout your app.

utils/get-item.ts
TypeScript

TypeScript

import { cache } from 'react'
import 'server-only'
 
export const preload = (id: string) => {
  void getItem(id)
}
 
export const getItem = cache(async (id: string) => {
  // ...
})
With this approach, you can eagerly fetch data, cache responses, and guarantee that this data fetching only happens on the server.

The utils/get-item exports can be used by Layouts, Pages, or other components to give them control over when an item's data is fetched.

Good to know:

We recommend using the server-only package to make sure server data fetching functions are never used on the client.
Preventing sensitive data from being exposed to the client
We recommend using React's taint APIs, taintObjectReference and taintUniqueValue, to prevent whole object instances or sensitive values from being passed to the client.

To enable tainting in your application, set the Next.js Config experimental.taint option to true:

next.config.js

module.exports = {
  experimental: {
    taint: true,
  },
}
Then pass the object or value you want to taint to the experimental_taintObjectReference or experimental_taintUniqueValue functions:

app/utils.ts
TypeScript

TypeScript

import { queryDataFromDB } from './api'
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from 'react'
 
export async function getUserData() {
  const data = await queryDataFromDB()
  experimental_taintObjectReference(
    'Do not pass the whole user object to the client',
    data
  )
  experimental_taintUniqueValue(
    "Do not pass the user's address to the client",
    data,
    data.address
  )
  return data
}
app/page.tsx
TypeScript

TypeScript

import { getUserData } from './data'
 
export async function Page() {
  const userData = getUserData()
  return (
    <ClientComponent
      user={userData} // this will cause an error because of taintObjectReference
      address={userData.address} // this will cause an error because of taintUniqueValue
    />
  )
}
Previous
Data Fetching
Next

cache
Canary
cache is only for use with React Server Components. See frameworks that support React Server Components.

cache is only available in React’s Canary and experimental channels. Please ensure you understand the limitations before using cache in production. Learn more about React’s release channels here.

cache lets you cache the result of a data fetch or computation.

const cachedFn = cache(fn);
Reference
cache(fn)
Usage
Cache an expensive computation
Share a snapshot of data
Preload data
Troubleshooting
My memoized function still runs even though I’ve called it with the same arguments
Reference 
cache(fn) 
Call cache outside of any components to create a version of the function with caching.

import {cache} from 'react';
import calculateMetrics from 'lib/metrics';

const getMetrics = cache(calculateMetrics);

function Chart({data}) {
  const report = getMetrics(data);
  // ...
}
When getMetrics is first called with data, getMetrics will call calculateMetrics(data) and store the result in cache. If getMetrics is called again with the same data, it will return the cached result instead of calling calculateMetrics(data) again.

See more examples below.

Parameters 
fn: The function you want to cache results for. fn can take any arguments and return any value.
Returns 
cache returns a cached version of fn with the same type signature. It does not call fn in the process.

When calling cachedFn with given arguments, it first checks if a cached result exists in the cache. If a cached result exists, it returns the result. If not, it calls fn with the arguments, stores the result in the cache, and returns the result. The only time fn is called is when there is a cache miss.

Note
The optimization of caching return values based on inputs is known as memoization. We refer to the function returned from cache as a memoized function.

Caveats 
React will invalidate the cache for all memoized functions for each server request.
Each call to cache creates a new function. This means that calling cache with the same function multiple times will return different memoized functions that do not share the same cache.
cachedFn will also cache errors. If fn throws an error for certain arguments, it will be cached, and the same error is re-thrown when cachedFn is called with those same arguments.
cache is for use in Server Components only.
Usage 
Cache an expensive computation 
Use cache to skip duplicate work.

import {cache} from 'react';
import calculateUserMetrics from 'lib/user';

const getUserMetrics = cache(calculateUserMetrics);

function Profile({user}) {
  const metrics = getUserMetrics(user);
  // ...
}

function TeamReport({users}) {
  for (let user in users) {
    const metrics = getUserMetrics(user);
    // ...
  }
  // ...
}
If the same user object is rendered in both Profile and TeamReport, the two components can share work and only call calculateUserMetrics once for that user.

Assume Profile is rendered first. It will call getUserMetrics, and check if there is a cached result. Since it is the first time getUserMetrics is called with that user, there will be a cache miss. getUserMetrics will then call calculateUserMetrics with that user and write the result to cache.

When TeamReport renders its list of users and reaches the same user object, it will call getUserMetrics and read the result from cache.

Pitfall
Calling different memoized functions will read from different caches. 
To access the same cache, components must call the same memoized function.

// Temperature.js
import {cache} from 'react';
import {calculateWeekReport} from './report';

export function Temperature({cityData}) {
  // 🚩 Wrong: Calling `cache` in component creates new `getWeekReport` for each render
  const getWeekReport = cache(calculateWeekReport);
  const report = getWeekReport(cityData);
  // ...
}
// Precipitation.js
import {cache} from 'react';
import {calculateWeekReport} from './report';

// 🚩 Wrong: `getWeekReport` is only accessible for `Precipitation` component.
const getWeekReport = cache(calculateWeekReport);

export function Precipitation({cityData}) {
  const report = getWeekReport(cityData);
  // ...
}
In the above example, Precipitation and Temperature each call cache to create a new memoized function with their own cache look-up. If both components render for the same cityData, they will do duplicate work to call calculateWeekReport.

In addition, Temperature creates a new memoized function each time the component is rendered which doesn’t allow for any cache sharing.

To maximize cache hits and reduce work, the two components should call the same memoized function to access the same cache. Instead, define the memoized function in a dedicated module that can be import-ed across components.

// getWeekReport.js
import {cache} from 'react';
import {calculateWeekReport} from './report';

export default cache(calculateWeekReport);
// Temperature.js
import getWeekReport from './getWeekReport';

export default function Temperature({cityData}) {
	const report = getWeekReport(cityData);
  // ...
}
// Precipitation.js
import getWeekReport from './getWeekReport';

export default function Precipitation({cityData}) {
  const report = getWeekReport(cityData);
  // ...
}
Here, both components call the same memoized function exported from ./getWeekReport.js to read and write to the same cache.

Share a snapshot of data 
To share a snapshot of data between components, call cache with a data-fetching function like fetch. When multiple components make the same data fetch, only one request is made and the data returned is cached and shared across components. All components refer to the same snapshot of data across the server render.

import {cache} from 'react';
import {fetchTemperature} from './api.js';

const getTemperature = cache(async (city) => {
	return await fetchTemperature(city);
});

async function AnimatedWeatherCard({city}) {
	const temperature = await getTemperature(city);
	// ...
}

async function MinimalWeatherCard({city}) {
	const temperature = await getTemperature(city);
	// ...
}
If AnimatedWeatherCard and MinimalWeatherCard both render for the same city, they will receive the same snapshot of data from the memoized function.

If AnimatedWeatherCard and MinimalWeatherCard supply different city arguments to getTemperature, then fetchTemperature will be called twice and each call site will receive different data.

The city acts as a cache key.

Note
Asynchronous rendering is only supported for Server Components.

async function AnimatedWeatherCard({city}) {
	const temperature = await getTemperature(city);
	// ...
}
Preload data 
By caching a long-running data fetch, you can kick off asynchronous work prior to rendering the component.

const getUser = cache(async (id) => {
  return await db.user.query(id);
});

async function Profile({id}) {
  const user = await getUser(id);
  return (
    <section>
      <img src={user.profilePic} />
      <h2>{user.name}</h2>
    </section>
  );
}

function Page({id}) {
  // ✅ Good: start fetching the user data
  getUser(id);
  // ... some computational work
  return (
    <>
      <Profile id={id} />
    </>
  );
}
When rendering Page, the component calls getUser but note that it doesn’t use the returned data. This early getUser call kicks off the asynchronous database query that occurs while Page is doing other computational work and rendering children.

When rendering Profile, we call getUser again. If the initial getUser call has already returned and cached the user data, when Profile asks and waits for this data, it can simply read from the cache without requiring another remote procedure call. If the  initial data request hasn’t been completed, preloading data in this pattern reduces delay in data-fetching.

Deep Dive
Caching asynchronous work 

Hide Details
When evaluating an asynchronous function, you will receive a Promise for that work. The promise holds the state of that work (pending, fulfilled, failed) and its eventual settled result.

In this example, the asynchronous function fetchData returns a promise that is awaiting the fetch.

async function fetchData() {
  return await fetch(`https://...`);
}

const getData = cache(fetchData);

async function MyComponent() {
  getData();
  // ... some computational work  
  await getData();
  // ...
}
In calling getData the first time, the promise returned from fetchData is cached. Subsequent look-ups will then return the same promise.

Notice that the first getData call does not await whereas the second does. await is a JavaScript operator that will wait and return the settled result of the promise. The first getData call simply initiates the fetch to cache the promise for the second getData to look-up.

If by the second call the promise is still pending, then await will pause for the result. The optimization is that while we wait on the fetch, React can continue with computational work, thus reducing the wait time for the second call.

If the promise is already settled, either to an error or the fulfilled result, await will return that value immediately. In both outcomes, there is a performance benefit.

Pitfall
Calling a memoized function outside of a component will not use the cache. 
import {cache} from 'react';

const getUser = cache(async (userId) => {
  return await db.user.query(userId);
});

// 🚩 Wrong: Calling memoized function outside of component will not memoize.
getUser('demo-id');

async function DemoProfile() {
  // ✅ Good: `getUser` will memoize.
  const user = await getUser('demo-id');
  return <Profile user={user} />;
}
React only provides cache access to the memoized function in a component. When calling getUser outside of a component, it will still evaluate the function but not read or update the cache.

This is because cache access is provided through a context which is only accessible from a component.

Deep Dive
When should I use cache, memo, or useMemo? 

Hide Details
All mentioned APIs offer memoization but the difference is what they’re intended to memoize, who can access the cache, and when their cache is invalidated.

useMemo 
In general, you should use useMemo for caching a expensive computation in a Client Component across renders. As an example, to memoize a transformation of data within a component.

'use client';

function WeatherReport({record}) {
  const avgTemp = useMemo(() => calculateAvg(record), record);
  // ...
}

function App() {
  const record = getRecord();
  return (
    <>
      <WeatherReport record={record} />
      <WeatherReport record={record} />
    </>
  );
}
In this example, App renders two WeatherReports with the same record. Even though both components do the same work, they cannot share work. useMemo’s cache is only local to the component.

However, useMemo does ensure that if App re-renders and the record object doesn’t change, each component instance would skip work and use the memoized value of avgTemp. useMemo will only cache the last computation of avgTemp with the given dependencies.

cache 
In general, you should use cache in Server Components to memoize work that can be shared across components.

const cachedFetchReport = cache(fetchReport);

function WeatherReport({city}) {
  const report = cachedFetchReport(city);
  // ...
}

function App() {
  const city = "Los Angeles";
  return (
    <>
      <WeatherReport city={city} />
      <WeatherReport city={city} />
    </>
  );
}
Re-writing the previous example to use cache, in this case the second instance of WeatherReport will be able to skip duplicate work and read from the same cache as the first WeatherReport. Another difference from the previous example is that cache is also recommended for memoizing data fetches, unlike useMemo which should only be used for computations.

At this time, cache should only be used in Server Components and the cache will be invalidated across server requests.

memo 
You should use memo to prevent a component re-rendering if its props are unchanged.

'use client';

function WeatherReport({record}) {
  const avgTemp = calculateAvg(record); 
  // ...
}

const MemoWeatherReport = memo(WeatherReport);

function App() {
  const record = getRecord();
  return (
    <>
      <MemoWeatherReport record={record} />
      <MemoWeatherReport record={record} />
    </>
  );
}
In this example, both MemoWeatherReport components will call calculateAvg when first rendered. However, if App re-renders, with no changes to record, none of the props have changed and MemoWeatherReport will not re-render.

Compared to useMemo, memo memoizes the component render based on props vs. specific computations. Similar to useMemo, the memoized component only caches the last render with the last prop values. Once the props change, the cache invalidates and the component re-renders.

Troubleshooting 
My memoized function still runs even though I’ve called it with the same arguments 
See prior mentioned pitfalls

Calling different memoized functions will read from different caches.
Calling a memoized function outside of a component will not use the cache.
If none of the above apply, it may be a problem with how React checks if something exists in cache.

If your arguments are not primitives (ex. objects, functions, arrays), ensure you’re passing the same object reference.

When calling a memoized function, React will look up the input arguments to see if a result is already cached. React will use shallow equality of the arguments to determine if there is a cache hit.

import {cache} from 'react';

const calculateNorm = cache((vector) => {
  // ...
});

function MapMarker(props) {
  // 🚩 Wrong: props is an object that changes every render.
  const length = calculateNorm(props);
  // ...
}

function App() {
  return (
    <>
      <MapMarker x={10} y={10} z={10} />
      <MapMarker x={10} y={10} z={10} />
    </>
  );
}
In this case the two MapMarkers look like they’re doing the same work and calling calculateNorm with the same value of {x: 10, y: 10, z:10}. Even though the objects contain the same values, they are not the same object reference as each component creates its own props object.

React will call Object.is on the input to verify if there is a cache hit.

import {cache} from 'react';

const calculateNorm = cache((x, y, z) => {
  // ...
});

function MapMarker(props) {
  // ✅ Good: Pass primitives to memoized function
  const length = calculateNorm(props.x, props.y, props.z);
  // ...
}

function App() {
  return (
    <>
      <MapMarker x={10} y={10} z={10} />
      <MapMarker x={10} y={10} z={10} />
    </>
  );
}
One way to address this could be to pass the vector dimensions to calculateNorm. This works because the dimensions themselves are primitives.

Another solution may be to pass the vector object itself as a prop to the component. We’ll need to pass the same object to both component instances.

import {cache} from 'react';

const calculateNorm = cache((vector) => {
  // ...
});

function MapMarker(props) {
  // ✅ Good: Pass the same `vector` object
  const length = calculateNorm(props.vector);
  // ...
}

function App() {
  const vector = [10, 10, 10];
  return (
    <>
      <MapMarker vector={vector} />
      <MapMarker vector={vector} />
    </>
  );
}