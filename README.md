# EdgeScope

**EdgeScope – Local Machine Performance Tester for RDP & WebRTC**

EdgeScope is a browser-based tool to quickly check if a local computer is causing lag in **RDP**, **WebRTC**, or other real-time apps. It measures **latency** and **jitter** via a loopback WebRTC connection to isolate **endpoint performance issues** from network or server problems.

---

## Key Features

- Single-click start/stop  
- Real-time latency & jitter metrics  
- PASS / WARNING / FAIL with plain-English interpretation  
- Copyable results  
- Dark, modern interface  
- Runs in any modern browser  

---

## Test Interpretation

| Status    | Meaning |
|-----------|---------|
| **PASS** | Latency <50 ms & Jitter <10 ms → Local machine OK |
| **WARNING** | Latency 50–100 ms or Jitter 10–30 ms → Possible local load |
| **FAIL** | Latency >100 ms or Jitter >30 ms → Local machine likely causing lag |

---

## Usage

1. Open `https://edgescope.lrfa.dev/` in a modern browser.  
2. Click **Start 30s Test**.  
3. Monitor metrics live.  
4. Review PASS/WARNING/FAIL and copy results if needed.  

---

## Limitations

- Only tests **local machine performance**  
- Does **not** test network, ISP, or server performance  
- Designed for **endpoint diagnostics only**  
