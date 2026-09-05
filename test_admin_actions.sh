#!/bin/bash
BASE="https://innovexa-backend-x57p.onrender.com/api/backend"

echo "=== Testing admin panel actions ==="

echo -e "\n1. adminMembers (GET)"
curl -s "$BASE?action=adminMembers" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n2. admin_get_tasks (GET)"  
curl -s "$BASE?action=admin_get_tasks" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK count='+str(len(d.get('tasks',[]))) if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n3. admin_get_sessions (GET)"
curl -s "$BASE?action=admin_get_sessions" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n4. admin_get_feedback (GET)"
curl -s "$BASE?action=admin_get_feedback" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n5. admin_get_audit_logs (GET)"
curl -s "$BASE?action=admin_get_audit_logs" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n6. admin_analytics (GET)"
curl -s "$BASE?action=admin_analytics" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n7. admin_get_requests (GET)"
curl -s "$BASE?action=admin_get_requests" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n8. assets (GET)"
curl -s "$BASE?action=assets" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n9. forge_get_bounties (GET)"
curl -s "$BASE?action=forge_get_bounties" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n10. admin_get_attendance (GET)"
curl -s "$BASE?action=admin_get_attendance" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n11. admin_get_settings (POST)"
curl -s -X POST "$BASE" -H "Content-Type: application/json" -d '{"action":"admin_get_settings"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n12. admin_system_health (GET)"
curl -s "$BASE?action=admin_system_health" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('success') else 'FAIL: '+str(d.get('message')))"

echo -e "\n=== Done ==="
