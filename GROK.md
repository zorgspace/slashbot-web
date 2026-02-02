# GROK.md - Slashbot Web Documentation

Welcome to the comprehensive documentation for the Slashbot Web project. This document is designed to provide developers and AI assistants with a detailed understanding of the codebase, enabling quick onboarding, effective contributions, and seamless maintenance. Below, you'll find an in-depth exploration of the project's purpose, architecture, conventions, and workflows.

---

## 1. PROJECT OVERVIEW

### Project Name
- **Name**: Slashbot Web
- **Repository**: Likely hosted on GitHub at `github.com/zorgspace/slashbot` based on navigation links in the codebase.

### Purpose
Slashbot Web is a modern web application that serves as the frontend interface for Slashbot, a developer tool or bot designed to assist with coding tasks, project management, and integrations with communication platforms like Telegram and Discord. The application provides an interactive UI to showcase Slashbot's features, installation instructions, and connector setups, while also offering dynamic content such as version information fetched from GitHub releases.

### Problem It Solves
Slashbot Web addresses the need for an accessible, user-friendly interface to interact with and understand the Slashbot tool. It solves the problem of onboarding new users by offering:
- Visual demonstrations of Slashbot's terminal-based interactions.
- Clear documentation of features and integrations.
- Easy access to installation instructions and source code.
- Dynamic metadata and OG (Open Graph) images for social sharing.

### Target Users/Audience
- **Developers**: Primary users who will use Slashbot for coding assistance, automation, and project management.
- **Teams**: Groups looking to integrate Slashbot with collaboration tools like Discord for team workflows.
- **Bot Enthusiasts**: Individuals interested in exploring or extending bot functionalities with platforms like Telegram.
- **Open-Source Contributors**: Developers who want to contribute to the Slashbot project via GitHub.

### Current Status
- **Status**: Alpha or Early Development
  - The project appears to be in an early stage, with recent commits focusing on initial setup, dynamic version fetching, and SEO metadata. The presence of placeholder content and demo animations (e.g., in `Terminal.tsx`) suggests it is not yet in production.
  - Features like dynamic icons and OG image generation indicate active development toward a polished public release.

### License
- **License**: Not specified in the provided files or commits. Developers should check the GitHub repository for a `LICENSE` file or reach out to the maintainers for clarification.

---

## 2. TECH STACK & LANGUAGES

### Primary Language(s)
- **TypeScript**: The codebase is primarily written in TypeScript, ensuring type safety and modern JavaScript features. Version requirements are not explicitly stated but can be inferred from the `tsconfig.json` targeting `ES2017` and using modern features.

### Runtime
- **Node.js**: The project runs on Node.js, as it is a Next.js application. While the exact version isn't specified, compatibility with Next.js 15.1.0 suggests Node.js 18+ is recommended.

### Framework(s)
- **Next.js**: Version 15.1.0, used as the core framework for building the web application. It provides server-side rendering (SSR), static site generation (SSG), and API routes, enabling a performant and SEO-friendly frontend.
  - Utilizes features like `appDir` (App Router) for routing and layout management.
  - Leverages Vercel’s `@vercel/og` for dynamic Open Graph image generation.

### Major Libraries and Their Purposes
- **React**: Version 18.3.1, the UI library for building interactive components.
- **React DOM**: Version 18.3.1, for rendering React components to the DOM.
- **Framer Motion**: Version 12.29.2, for animations and transitions (e.g., in `Terminal.tsx` and `FeatureCard.tsx`).
- **@react-three/fiber**: Version 8.17.0, for 3D rendering with React (though not explicitly used in provided files, it suggests potential 3D features).
- **@react-three/drei**: Version 9.117.0, utility library for `@react-three/fiber`.
- **Three.js**: Version 0.182.0, for 3D graphics (paired with `@react-three/fiber`).
- **Remotion**: Version 4.0.414 (includes `@remotion/bundler`, `@remotion/cli`, `@remotion/renderer`), for creating videos programmatically (used in `Root.tsx` and `MyVideo.tsx`).
- **@vercel/og**: Version 0.8.6, for generating Open Graph images dynamically (used in `opengraph-image.tsx`, `twitter-image.tsx`, etc.).
- **Tailwind CSS**: Version 3.4.19, for utility-first CSS styling.
- **Autoprefixer**: Version 10.4.24, for adding vendor prefixes to CSS.
- **PostCSS**: Version 8.5.6, for CSS transformations (used with Tailwind).
- **ESLint**: Version 9.17.0, for linting and enforcing code quality.
- **TypeScript**: Version 5.7.0, for type checking and development.

### Package Manager
- **Bun**: The project uses Bun as the package manager, as indicated by the presence of `bun.lock`. Bun is a fast JavaScript runtime and package manager, often used as an alternative to npm or yarn for improved performance.

---

## 3. ARCHITECTURE & DESIGN PATTERNS

### High-Level Architecture
- **Monolith**: The project follows a monolithic frontend architecture within the Next.js framework. All components, pages, and logic are contained within a single repository, with no evidence of microservices or separate backend services in the provided files.
- **App Router**: Utilizes Next.js's App Router (introduced in Next.js 13+) for file-system-based routing, as seen in the `src/app/` directory structure.
- **Client-Server Hybrid**: Combines client-side rendering (CSR) with server-side capabilities (e.g., dynamic OG images with `edge` runtime).

### Design Patterns Used
- **Component-Based Architecture**: The UI is built using reusable React components (`Terminal.tsx`, `FeatureCard.tsx`, etc.), promoting modularity and maintainability.
- **Hooks Pattern**: Custom hooks like `useVersion.ts` are used for state management and data fetching (e.g., fetching version information from GitHub).
- **Animation-Driven UI**: Leverages Framer Motion for declarative animations, enhancing user experience with smooth transitions (e.g., in `Terminal.tsx` for line-by-line text display).
- **Factory Pattern (Implicit)**: Seen in the dynamic generation of terminal lines in `Terminal.tsx` using a predefined array of `TerminalLine` objects.

### State Management Approach
- **Local State with React Hooks**: State is managed locally within components using `useState` and `useEffect` (e.g., `Terminal.tsx` manages `lines` and `currentIndex` for animation).
- **Custom Hooks**: `useVersion` hook abstracts version fetching logic, likely from GitHub releases, for reuse across components.
- **No Global State Library**: There’s no evidence of libraries like Redux or Context API for global state, suggesting a focus on simplicity or localized state needs.

### Data Flow Patterns
- **Unidirectional Data Flow**: Follows React’s unidirectional data flow, where props pass data down to child components, and state updates trigger re-renders (e.g., `Terminal.tsx` updates `lines` based on timing).
- **Dynamic Content Fetching**: Version data is fetched dynamically (likely via API calls in `useVersion.ts`), ensuring the UI reflects the latest release information.

### Error Handling Patterns
- **Basic Error Handling**: No explicit error boundaries or global error handling mechanisms are visible in the provided code. Errors are likely handled locally within components or hooks (e.g., fallback for version fetching in `useVersion`).
- **Graceful Degradation**: Components like `Terminal.tsx` handle missing data (e.g., version string) by trimming or providing fallback content.

---

## 4. DIRECTORY STRUCTURE

### Overview
The project follows a standard Next.js structure with the App Router, organizing code into logical directories for components, pages, and utilities. Below is a detailed breakdown of the directory structure and key files.

### Major Directories and Their Purposes
- **`.next/`**: Contains build artifacts and cached files generated by Next.js during development and production builds. Not meant for direct editing.
- **`.git/`**: Git repository metadata. Ignored in documentation as it’s not relevant to development workflows.
- **`public/`**: Static assets directory for files like icons, manifests (`site.webmanifest`), and other resources served directly by Next.js.
- **`.slashbot/`**: Contains Slashbot-specific data or configurations, potentially for skills or plugins (`skills/` subdirectory). Purpose unclear without further context, possibly related to the bot’s runtime data.
- **`src/`**: Source code directory, housing the core application logic.
  - **`src/components/`**: Reusable UI components for the application.
    - `Connectors.tsx`: Displays integration options for platforms like Telegram and Discord.
    - `FeatureCard.tsx`: A card component for showcasing Slashbot features with icons and descriptions.
    - `Terminal.tsx`: An animated terminal UI demonstrating Slashbot commands and outputs.
    - `Navigation.tsx`: Navigation bar with links to different sections of the site.
  - **`src/app/`**: Next.js App Router directory for pages and layouts.
    - `page.tsx`: Main entry point for the homepage.
    - `layout.tsx`: Root layout for the application, wrapping all pages.
    - `globals.css`: Global CSS styles, likely including Tailwind imports.
    - `opengraph-image.tsx`, `twitter-image.tsx`, `icon.tsx`, `apple-icon.tsx`: Dynamic image generation for SEO and social sharing using `@vercel/og`.
  - **`src/hooks/`**: Custom React hooks for reusable logic.
    - `useVersion.ts`: Hook to fetch and provide the latest Slashbot version from GitHub releases.
- **`node_modules/`**: Dependencies installed by Bun. Not relevant for direct editing.

### Key Files and Their Purposes
- **`package.json`**: Defines project metadata, scripts (`dev`, `build`, `start`, `lint`), and dependencies.
- **`bun.lock`**: Lock file for Bun, ensuring consistent dependency versions.
- **`tsconfig.json`**: TypeScript configuration, enabling strict type checking, modern ES features, and path aliases (`@/*` for `src/*`).
- **`tailwind.config.js`**: Tailwind CSS configuration for styling.
- **`remotion.config.ts`**: Configuration for Remotion, used for video rendering.
- **`src/Root.tsx` and `src/RemotionRoot.tsx`**: Entry points for Remotion video compositions.
- **`src/MyVideo.tsx`**: Custom video component for Remotion, likely for promotional or demo content.

### Entry Points and Bootstrapping
- **Main Entry Point**: `src/app/layout.tsx` serves as the root layout, wrapping all pages. `src/app/page.tsx` is the homepage, rendered within this layout.
- **Bootstrapping**: Next.js automatically bootstraps the application by rendering the layout and page components based on the file-system routing in `src/app/`.
- **Remotion Entry Point**: `src/RemotionRoot.tsx` registers the root for Remotion video rendering, pointing to compositions defined in `src/Root.tsx`.

### Where to Find Specific Types of Code
- **Routes/Pages**: `src/app/` for all page definitions and dynamic routes (e.g., `opengraph-image.tsx`).
- **Components**: `src/components/` for reusable UI elements.
- **Hooks/Utilities**: `src/hooks/` for custom logic and state management.
- **Styles**: `src/app/globals.css` for global styles, with Tailwind utilities applied project-wide.
- **Video Content**: `src/MyVideo.tsx` and related files for Remotion-based video rendering.

---

## 5. CODE CONVENTIONS & STYLE

### Formatting Rules
- **Indentation**: 2 spaces (inferred from TypeScript and Next.js community standards, as no explicit `.prettierrc` is provided).
- **Line Length**: No strict limit specified, but code appears to stay within 80-100 characters for readability.
- **Quotes**: Single quotes for strings (based on `tsconfig.json` allowing modern JS and common Next.js practices).
- **Semicolons**: Used consistently at the end of statements, as seen in provided code.

### Naming Conventions
- **Files**: Kebab-case for file names (e.g., `opengraph-image.tsx`).
- **Components**: PascalCase for React component names (e.g., `Terminal`, `FeatureCard`).
- **Variables/Functions**: camelCase for variable and function names (e.g., `getDemoLines`, `currentIndex`).
- **CSS Classes**: Kebab-case for Tailwind class names (e.g., `terminal-window`, `text-terminal-violet`).

### Import Ordering
- **Order**: Imports are typically grouped as follows (seen in `Terminal.tsx`):
  1. React and built-in libraries.
  2. Third-party libraries (e.g., Framer Motion).
  3. Local imports (e.g., custom hooks like `useVersion`).
- **Path Aliases**: Uses `@/` alias for `src/` directory, as defined in `tsconfig.json`.

### Comment Style and Documentation
- **Comments**: Minimal inline comments in the provided code, focusing on clarity through self-explanatory variable names.
- **TypeScript Types**: Interfaces are used for type definitions (e.g., `TerminalLine` in `Terminal.tsx`), with no explicit JSDoc unless required for complex logic.
- **Documentation**: No formal documentation files (e.g., README.md) provided, but commit messages suggest intent and context.

### Type Annotation Expectations
- **Strict Typing**: `tsconfig.json` enables `strict: true`, enforcing full type annotations for variables, props, and return types.
- **Explicit Types**: Props and state are typed explicitly (e.g., `TerminalLine` interface, `FeatureCardProps`).

### Error Handling Conventions
- **Local Handling**: Errors are managed within components or hooks, with no global error boundary visible.
- **Fallbacks**: Components provide fallback content for missing data (e.g., empty version string in `Terminal.tsx`).

---

## 6. HOW TO USE (for developers)

### Installation Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/zorgspace/slashbot.git
   cd slashbot-web
   ```
2. **Install Dependencies**:
   Since the project uses Bun, install dependencies with:
   ```bash
   bun install
   ```
   If Bun is not installed, install it first or fallback to npm:
   ```bash
   npm install
   ```

### Environment Setup
- **Environment Variables**: No explicit `.env` files or variables are mentioned in the provided code. However, if dynamic fetching (e.g., GitHub API for version) requires authentication, you may need to set up API keys or tokens.
  - Check for a `.env.local` file or documentation in the repository for any required variables.
  - Example `.env.local` (if needed):
    ```
    GITHUB_API_TOKEN=your_token_here
    ```

### Running in Development Mode
- Start the development server with:
  ```bash
  bun run dev
  ```
  or
  ```bash
  npm run dev
  ```
- The application will be available at `http://localhost:3000`.

### Running Tests
- **No Test Configuration**: There are no test scripts or frameworks (e.g., Jest, Cypress) mentioned in `package.json` or directory structure. If testing is required, developers should add a testing framework.
- Placeholder for future test command:
  ```bash
  # To be implemented
  bun run test
  ```

### Building for Production
- Build the application with:
  ```bash
  bun run build
  ```
  or
  ```bash
  npm run build
  ```
- The output will be in the `.next/` directory.

### Deployment Process
- **Vercel (Likely)**: Given the use of `@vercel/og` and `.vercel` in `.gitignore`, deployment is likely intended for Vercel.
  1. Push the repository to GitHub.
  2. Connect the repository to Vercel via the dashboard.
  3. Vercel will automatically build and deploy on push.
- **Manual Deployment**: Run the production build locally and start the server:
  ```bash
  bun run start
  ```
  or
  ```bash
  npm run start
  ```

---

## 7. HOW TO DEVELOP & EXTEND

### Adding New Features
- **Where to Put New Code**:
  - UI features: Add new components in `src/components/`.
  - Pages: Add new routes in `src/app/` with appropriate file names (e.g., `about/page.tsx` for `/about`).
  - Logic: Create custom hooks in `src/hooks/` for reusable state or data fetching.
- **Steps**:
  1. Create a new component or page.
  2. Import and use it in the relevant page or layout.
  3. Test in development mode with `bun run dev`.

### Adding New API Endpoints
- **Location**: Add serverless functions or API routes in `src/app/api/` (not present in current structure but standard for Next.js).
- **Steps**:
  1. Create a new file in `src/app/api/endpoint/route.ts`.
  2. Define the endpoint logic using Next.js API route syntax:
     ```typescript
     import { NextResponse } from "next/server";

     export async function GET() {
       return NextResponse.json({ message: "Hello from API!" });
     }
     ```
  3. Test the endpoint at `/api/endpoint` in development mode.

### Adding New Components/Modules
- **Conventions**:
  - Place in `src/components/` with PascalCase naming (e.g., `NewFeature.tsx`).
  - Use TypeScript for props and state typing.
  - Apply Tailwind CSS classes for styling.
- **Example**:
  ```typescript
  "use client";

  import { motion } from "framer-motion";

  interface NewFeatureProps {
    title: string;
  }

  export function NewFeature({ title }: NewFeatureProps) {
    return (
      <motion.div className="p-4 bg-terminal-bg">
        <h3>{title}</h3>
      </motion.div>
    );
  }
  ```

### Database Changes
- **No Database**: There’s no database integration in the provided code. If a database is added (e.g., Prisma, MongoDB), follow these steps:
  1. Install the ORM or database client (e.g., `bun add prisma`).
  2. Define models and migrations.
  3. Update environment variables for connection strings.

### Testing
- **Current State**: No testing framework is set up.
- **Steps to Add Tests**:
  1. Install a testing library like Jest:
     ```bash
     bun add --dev jest @testing-library/react @testing-library/jest-dom
     ```
  2. Add test scripts to `package.json`.
  3. Write tests in a `__tests__` folder or alongside components (e.g., `Terminal.test.tsx`).

---

## 8. COMMON TASKS & PATTERNS

### Common Operations with Code Examples
- **Updating UI Content**:
  Modify existing components like `FeatureCard.tsx` to add new features:
  ```typescript
  <FeatureCard
    icon={<svg>...</svg>}
    title="New Feature"
    description="Description of the new feature."
    command="/new-command"
  />
  ```

- **Adding Animations**:
  Use Framer Motion for transitions, as seen in `Terminal.tsx`:
  ```typescript
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    Animated content
  </motion.div>
  ```

### How to Handle Authentication
- **Current State**: No authentication logic is implemented in the provided code.
- **Future Implementation**: If authentication is needed, add it via API routes or third-party services like Auth0 or NextAuth.js in `src/app/api/auth/`.

### How to Interact with the Database
- **Current State**: No database integration.
- **Future**: Use an ORM like Prisma or direct client libraries for database operations once set up.

### How to Add/Modify UI Components
- Create or update components in `src/components/` following existing patterns (e.g., Tailwind classes, Framer Motion for animations).
- Example: See `FeatureCard.tsx` above.

### How to Add New CLI Commands
- **Context**: CLI commands are simulated in `Terminal.tsx` for demo purposes.
- **Steps**: Update the `getDemoLines` function to include new commands:
  ```typescript
  { type: "command", content: "/new-command", delay: 600 },
  { type: "output", content: "New command output", delay: 100 },
  ```

---

## 9. DEPENDENCIES & EXTERNAL SERVICES

### Database Requirements
- **None**: No database is currently integrated. Future additions may require PostgreSQL, MongoDB, or similar, with corresponding environment variables.

### API Keys Needed
- **GitHub API (Likely)**: For fetching version data in `useVersion.ts`, a GitHub API token might be required for rate limiting, though not explicitly mentioned.

### External Services Integration
- **Vercel**: For deployment and OG image generation.
- **GitHub**: For version fetching and repository hosting.

### Docker/Container Requirements
- **None**: No Docker configuration is provided. Developers can containerize the app using a standard Node.js Dockerfile if needed.

---

## 10. GOTCHAS & IMPORTANT NOTES

### Non-Obvious Behaviors
- **Terminal Animation Reset**: In `Terminal.tsx`, the animation resets every 6 seconds after completing, which might confuse users expecting continuous output.
- **Dynamic Version**: The version displayed in UI components depends on `useVersion` hook, which may fail silently if GitHub API calls are rate-limited.

### Performance Considerations
- **Animation Overhead**: Framer Motion animations in `Terminal.tsx` may impact performance on low-end devices due to frequent state updates.
- **Dynamic Images**: Generating OG images on the edge (`@vercel/og`) could introduce latency if not cached properly.

### Security Considerations
- **API Keys**: If GitHub API tokens are used, ensure they are not hardcoded or exposed in client-side code.
- **No Auth**: Lack of authentication means the app is currently public-facing with no user-specific data protection.

### Breaking Changes History
- **React 18 Compatibility**: Commit `63015c2` mentions fixing compatibility for `@react-three` packages, indicating potential issues with older React versions.

### Known Issues or Limitations
- **No Testing**: Absence of a testing framework limits quality assurance.
- **Early Stage**: The project is in alpha, so expect incomplete features or placeholder content.

---

## 11. COMMAND REFERENCE

### npm/bun Scripts with Descriptions
- **`dev`**: Starts the development server with hot reloading.
  ```bash
  bun run dev
  ```
- **`build`**: Builds the application for production.
  ```bash
  bun run build
  ```
- **`start`**: Starts the production server after a build.
  ```bash
  bun run start
  ```
- **`lint`**: Runs ESLint to check for code quality issues.
  ```bash
  bun run lint
  ```

### CLI Commands
- **None**: No custom CLI commands are defined beyond npm scripts. The `Terminal.tsx` component simulates a CLI for demo purposes.

### Common Development Commands
- **Install Dependencies**:
  ```bash
  bun install
  ```
- **Run Development Server**:
  ```bash
  bun run dev
  ```
- **Check for Updates**:
  Ensure Bun or npm is up-to-date for compatibility.

---

This `GROK.md` serves as a comprehensive guide to the Slashbot Web project. For further questions or contributions, refer to the GitHub repository or reach out to the maintainers. Happy coding!