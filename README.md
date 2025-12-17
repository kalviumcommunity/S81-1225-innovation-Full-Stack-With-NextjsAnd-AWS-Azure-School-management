# Student Management System


# Advanced Data Fetching in Next.js (App Router)


## Concept-1: Static, Dynamic, and Hybrid Rendering


This project demonstrates how Next.js App Router supports multiple rendering strategies — Static Site Generation (SSG), Server-Side Rendering (SSR), and Incremental Static Regeneration (ISR). The goal is to understand how choosing the right rendering method impacts performance, scalability, and data freshness in real-world applications.

---

## Rendering Strategies Implemented in This App

| Page           | Rendering Strategy      | Reason                             |
| -------------- | ----------------------- | ---------------------------------- |
| /about         | Static Rendering (SSG)  | Content does not change frequently |
| /dashboard     | Dynamic Rendering (SSR) | Real-time and user-specific data   |
| /announcements | Hybrid Rendering (ISR)  | Needs periodic updates             |

---

## How Rendering Choices Affect Performance, Scalability, and Data Freshness

### 1. Static Rendering (SSG)
**Used in:** About Page

Static pages are generated at build time and served as pre-rendered HTML.

**Impact:**
- Performance: Very high (fastest load time)
- Scalability: Excellent (served via CDN)
- Data Freshness: Low (requires rebuild to update)

**Why chosen:**  
The About page contains static school information that rarely changes.

---

### 2. Dynamic Rendering (SSR)
**Used in:** Dashboard Page

Pages are rendered on every request, ensuring fresh and personalized data.

**Impact:**
- Performance: Moderate (server computation per request)
- Scalability: Limited due to server load
- Data Freshness: Excellent (always up-to-date)

**Why chosen:**  
The Dashboard displays live and user-specific data such as attendance and academic summaries.

---

### 3. Hybrid Rendering (ISR)
**Used in:** Announcements Page

ISR combines static rendering with periodic revalidation using the `revalidate` option.

**Impact:**
- Performance: High
- Scalability: High
- Data Freshness: Good (updated automatically at intervals)

**Why chosen:**  
Announcements need to stay updated but do not require real-time rendering.

---

## Trade-Off Summary

| Rendering Type | Speed  | Scalability | Freshness |
| -------------- | ------ | ----------- | --------- |
| Static (SSG)   | High   | High        | Low       |
| Dynamic (SSR)  | Medium | Low         | High      |
| Hybrid (ISR)   | High   | High        | Medium    |


Each rendering mode optimizes two out of three factors: speed, scalability, and data freshness.

---







