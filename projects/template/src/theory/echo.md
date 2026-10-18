<!--
Source: echo.html
Title: Project Template - Theory & Concepts
Description: Core engineering theory behind containerized projects.
-->

Navigation: [← Back to App](../index.html)

# Theory & Concepts

Core software engineering patterns used in containerized web and AI services.

### 1. Overview & Architecture

Every project follows a decoupled, single-container model where frontend assets, routing, and backend computation reside in a single deployable image.

### 2. Flask Blueprint Pattern

By mounting all routes on a Blueprint with a dynamic `PATH_PREFIX`, identical code runs locally on root and in production under an Nginx path.

### 3. Rate Limiting Mechanics

Sliding window rate limiters in SQLite safeguard APIs against excessive usage without needing complex distributed caches.

