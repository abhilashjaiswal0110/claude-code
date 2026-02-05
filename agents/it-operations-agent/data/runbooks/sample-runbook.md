# Runbook: High CPU Usage on Application Server (Sample)

## Severity: P2 (High)
## Service: Application Server Cluster

### Symptoms
- CPU usage > 90% sustained for > 5 minutes
- Application response time > 2x baseline
- Alert from monitoring system (Prometheus/Grafana)

### Immediate Actions
1. Check current CPU usage: `top -bn1 | head -20`
2. Identify top processes: `ps aux --sort=-%cpu | head -10`
3. Check application logs: `tail -100 /var/log/app/application.log`
4. Verify no deployment in progress: check CI/CD pipeline status

### Diagnosis
1. **Application Thread Dump**: `jstack <PID>` (for Java) or equivalent
2. **Memory Check**: `free -m` and `vmstat 1 5`
3. **Disk I/O**: `iostat -x 1 5`
4. **Network**: `netstat -an | grep ESTABLISHED | wc -l`

### Resolution Steps
1. If caused by specific process: restart the process
2. If caused by traffic spike: scale horizontally (add instances)
3. If caused by memory leak: schedule maintenance restart
4. If caused by bad deployment: rollback to previous version

### Escalation
- If not resolved within 30 minutes: escalate to L3 Engineering
- If client-facing impact: notify Service Manager immediately

---
*Note: This is a sample runbook for demonstration purposes.*
