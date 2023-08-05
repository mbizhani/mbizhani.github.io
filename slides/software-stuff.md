---
layout: slide
caption: Software Stuff
theme: blood
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template>

## Software Stuff 
### (Design, Architecture, Engineering & ...)

===
### Reliability
- Apps should continue to **work correctly** at the desired level of performance, even in the face of _adversity_.
  - Performance due to user expectation under the expected load and data volume
  - Tolerate user mistakes
  - Preventing any unauthorized access and abuse
- _Fault-tolerant_ or _resilient_ systems anticipate faults and cope with them

---
### Hardware Faults
- MTTF (mean time to failure) factor for hard disks
- Add redundancy to the individual hardware components
- More computing requirement => more machines => more hardware faults
  - Cloud platforms are designed to prioritize flexibility and elasticity over single-machine reliability
  - Using software fault-tolerance techniques in preference or in addition to hardware redundancy

---
### Human Errors
- A Study: configuration errors by operators were the leading cause of outages, 
  whereas hardware faults (servers or network) played a role in only 10–25% of outages

---
### Human Errors - Solutions
- Well-designed abstractions, APIs, and admin interfaces
- Provide fully featured non-production _sandbox_ environments
- Test thoroughly at all levels
- Quick and easy recovery from human errors
  - Roll back configuration changes
  - Roll out new code gradually
  - Tools to recompute data
- Set up detailed and clear monitoring (_telemetry_)

===
### Scalability
- Dealing with system growth in data volume, traffic volume, or complexity
- Define _load parameters_ based on system's architecture
  - Twitter scaling challenge: tweets _fan-out_ - sending posted tweets to timeline of the followers

---
#### Performance Metrics (1/2)
Gather performance metrics (_throughput_ or _response time_), calculate _percentiles_
- _Median_ (_p50_) - shows half of results
- _p95_, _p99_, and _p999_, known as _tail latencies_
  - Customers with the slowest requests are often those with the most data on their accounts, 
    having made many purchases, and so most valuable ones
  - Amazon has observed a 100 ms increase in response time reduces sales by 1%
  - A 1-second slowdown reduces a customer satisfaction metric by 16%

---
#### Performance Metrics (2/2)
- Sample SLA
  - Median response time of less than 200 ms and a 99th percentile under 1 s
  - Uptime is at least 99.9% of the time
- Measure response times on the client side
  - It prevents _head-of-line blocking_ miscalculation (in case of queuing requests, the longest ones result in total delay)

===
### Maintainability
- Different people do & will work _productively_.
- 3 design principles for software systems
  - Operability
    - Make it easy for operations teams to keep the system running smoothly.
  - Simplicity
    - Make it easy for new engineers to understand the system.
  - Evolvability (_extensibility_, _modifiability_, or _plasticity_)
    - Make it easy for engineers to make changes to the system in the future.

===
### References
- Designing Data-Intensive Applications, Martin Kleppmann, OReilly, 2017

</textarea>
</section>