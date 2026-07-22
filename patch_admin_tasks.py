import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# Replace adminCreateTask
create_new = """async function adminCreateTask() {
  const title = document.getElementById('tkTitle').value.trim();
  const desc = document.getElementById('tkDesc').value.trim();
  const xp = document.getElementById('tkXP').value;
  const difficulty = document.getElementById('tkDiff').value;
  const assignedTo = document.getElementById('tkAssign').value.trim();

  if (!title || !desc) return showToast('Title and Description are required.', 'error');
  
  try {
    showToast('Deploying bounty...', 'info');
    await apiWrite('admin_create_task', { title, description: desc, xp, difficulty, assignedTo });
    showToast('Bounty deployed!', 'success');
    document.getElementById('taskFormCard').style.display = 'none';
    document.getElementById('tkTitle').value = '';
    document.getElementById('tkDesc').value = '';
    document.getElementById('tkXP').value = '100';
    document.getElementById('tkAssign').value = 'Open';
    await new Promise(r => setTimeout(r, 500));
    loadForgeTasks();
  } catch (e) { showToast('Network error. Try again.', 'error'); }
}"""

content = re.sub(
    r'async function adminCreateTask\(\) \{[\s\S]*?\} catch \(e\) \{ showToast\(\'Network error. Try again.\', \'error\'\); \}\n\}',
    create_new,
    content
)

# Replace adminReviewTask
review_new = """async function adminReviewTask(taskId, status) {
  const feedbackInput = document.getElementById('feedback_' + taskId);
  const feedback = feedbackInput ? feedbackInput.value : '';
  
  if (!confirm(`Are you sure you want to ${status === 'Completed' ? 'Approve' : 'Reject'} this submission?`)) return;

  try {
    showToast('Updating...', 'info');
    await apiWrite('admin_review_task', { taskId, status, feedback });
    showToast(status === 'Completed' ? 'Approved! XP granted.' : 'Rejected. Sent back.', 'success');
    await new Promise(r => setTimeout(r, 500));
    loadForgeTasks();
  } catch(e) { showToast('Network error. Try again.', 'error'); }
}"""

content = re.sub(
    r'async function adminReviewTask\(taskId, status\) \{[\s\S]*?\} catch\(e\) \{ showToast\(\'Network error. Try again.\', \'error\'\); \}\n\}',
    review_new,
    content
)

# Replace adminDeleteTask
delete_new = """async function adminDeleteTask(taskId) {
  if (!confirm('Delete this task?')) return;
  try {
    showToast('Deleting...', 'info');
    await apiWrite('admin_delete_task', { taskId });
    showToast('Bounty deleted.', 'success');
    await new Promise(r => setTimeout(r, 500));
    loadForgeTasks();
  } catch(e) { showToast('Network error.', 'error'); }
}"""

content = re.sub(
    r'async function adminDeleteTask\(taskId\) \{[\s\S]*?\} catch\(e\) \{ showToast\(\'Network error.\', \'error\'\); \}\n\}',
    delete_new,
    content
)

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
    f.write(content)
print("Task functions patched!")
