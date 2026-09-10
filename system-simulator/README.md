# System Architecture Simulator

Build a system architecture on a canvas and watch simulated traffic flow through it. The
point is to make capacity and queueing *visible* — you find the ceiling by hitting it, not
by reading about it.

A single self-contained `static/index.html`. No build step, no dependencies, no network calls.

## Components

| Component | Capacity | Behaviour |
|-----------|----------|-----------|
| **Client** | — | Generates Poisson-distributed traffic. One outgoing connection, like a single DNS name |
| **CDN** | 512 slots · 5 ms | Edge cache. A hit is answered immediately; a miss is forwarded on |
| **Load Balancer** | 256 slots · 1 ms | Spreads requests across everything it points to |
| **App Server** | 4 slots · 40 ms per instance | ~100 rps per instance |
| **Cache** | 64 slots · 2 ms | Absorbs reads before they reach the database |
| **Database** | 8 slots · 10 ms | ~800 rps, shared and hard to scale |
| **Queue** | unbounded | Acknowledges instantly and holds the job for a worker |
| **Worker** | 4 slots · 200 ms per instance | ~20 jobs/s per instance, off the request path |

## How routing works

- A node splits its outgoing traffic **evenly (round-robin)** across every node it points
  to. One rule, so any topology you can draw has a defined meaning.
- A **Client has exactly one** outgoing connection — to reach more than one server you have
  to put a load balancer in front, which is the whole point of one.
- **CDN** and **Cache** are hit-ratio pass-throughs: on a hit they respond, on a miss they
  forward downstream.
- A **Queue** is an async handoff. The caller is acked immediately and the job lands in a
  backlog for Workers to drain, so job latency is tracked separately from request latency.

## The simulation

A discrete-event simulation stepped at 5 ms of simulated time. Each node is a finite-capacity
server: requests take a free slot, wait in a bounded queue, or are rejected when that queue is
full. Service times are exponentially distributed. Callers give up after 3 s.

Links carry real latency — 30 ms from the client, 12 ms internally — so end-to-end latency is
the sum of every hop plus whatever queueing delay the system is generating. Utilisation shown
on each node is smoothed over ~500 ms; the inspector shows exact in-flight and waiting counts.

Metrics are measured over a rolling 5-second window of simulated time.

## Things worth trying

1. Load **Single server** and push traffic past 100 rps. Throughput flatlines at capacity
   while latency climbs and requests start failing — the queue is full, not the server slow.
2. Load **Load balanced** at 1200 rps and raise App Server instances. 4 → 8 nearly doubles
   throughput; 8 → 12 → 16 changes almost nothing, because the database is now the ceiling.
3. Load **CDN and cache** and drag the hit ratios down. Watch how much load the origin was
   never seeing.
4. Load **Async queue** and push past 300 rps. Response times stay healthy while the backlog
   grows without bound — the work isn't lost, it's just falling further behind.

## Development

No build step. Open `static/index.html` directly, or serve the directory:

```bash
cd system-simulator/static && python3 -m http.server 8080
```
