# 📰 Case Study: “The News Portal That Felt Outdated”

## Understanding Rendering Trade-offs in Next.js

In a content-heavy application like a news portal, choosing the right rendering strategy is critical. Each approach—**Static**, **Dynamic**, and **Hybrid rendering**—optimizes for different goals. The challenge is balancing **speed**, **data freshness**, and **scalability**.

This case study explains how we solved the problem faced by *DailyEdge*, where static pages felt outdated and fully dynamic pages caused performance and cost issues.

---

## ⚖️ The Rendering Trade-off Triangle

| Rendering Type       | Speed       | Freshness     | Scalability |
| -------------------- | ----------- | ------------- | ----------- |
| Static (SSG)         | ✅ Very Fast | ❌ Low         | ✅ High      |
| Dynamic (SSR)        | ❌ Slower    | ✅ High        | ❌ Lower     |
| Hybrid (ISR / Mixed) | ✅ Fast      | ✅ Medium–High | ✅ High      |

No single strategy gives all three perfectly. The solution is **using the right strategy for the right page**.

---

## 🔍 Problem Analysis (DailyEdge Scenario)

### 1️⃣ Static Rendering (SSG)

* Homepage loads instantly
* Cached at build time
* “Breaking News” becomes outdated

```ts
export const revalidate = false;
```

**Trade-off:**
✔️ Speed & scalability
❌ No real-time updates

---

### 2️⃣ Dynamic Rendering (SSR)

* Data fetched on every request
* Always shows latest headlines

```ts
export const dynamic = 'force-dynamic';
```

**Trade-off:**
✔️ Freshness
❌ Slower load times & higher server cost

---

### 3️⃣ Hybrid Rendering (Best Solution)

* Static page shell
* Frequently updated sections revalidated periodically
* Personalized data rendered dynamically

This approach combines the best of both worlds.

---

## 🛠️ Our Balanced Solution Using Next.js App Router

### 🏠 Homepage (Hybrid Rendering)

* Static layout for performance
* Breaking News updates every 60 seconds

```ts
export const revalidate = 60;

const res = await fetch('https://api/news', {
  next: { revalidate: 60 }
});
```

✔️ Fast initial load
✔️ Headlines stay reasonably fresh
✔️ Scales well under traffic

---

### 📰 News Feed Page (Hybrid / ISR)

* Content changes frequently
* Revalidate every 30–120 seconds

```ts
export const revalidate = 120;
```

✔️ Fast browsing experience
✔️ Acceptable freshness for news

---

### 👤 User Dashboard (Dynamic Rendering)

* Personalized content
* Requires authentication
* Must always be up-to-date

```ts
export const dynamic = 'force-dynamic';
```

✔️ Accurate user-specific data
❌ Not cached (acceptable due to lower traffic)

---

### 🛍️ Product Catalog (Static + ISR)

* Rarely changes
* Can tolerate slightly stale data

```ts
export const revalidate = 3600;
```

✔️ Extremely fast
✔️ Very scalable
✔️ Minimal server cost

---

## 🧠 How We Decide Which Rendering Mode to Use

We ask three key questions:

1. **Does the data change frequently?**
2. **Is the content personalized?**
3. **Is speed or freshness more important?**

| Page Type       | Rendering Choice | Reason                    |
| --------------- | ---------------- | ------------------------- |
| Landing Page    | Static / ISR     | Speed & SEO               |
| Breaking News   | Hybrid (ISR)     | Balance freshness & speed |
| User Dashboard  | Dynamic          | Personalized data         |
| Product Catalog | Static / ISR     | Scalability               |

---

## 🎯 Final Takeaway

* **Static rendering** gives speed and scalability
* **Dynamic rendering** guarantees freshness
* **Hybrid rendering** is the practical real-world solution

By combining these strategies using **Next.js App Router**, we avoid outdated content *without sacrificing performance or increasing costs*.

This balanced approach ensures:

* Fast page loads
* Fresh critical content
* Efficient server usage