import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    content = f.read()

new_code = """
    // FORGE: Edit Task
    if (action === 'forge_edit_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === payload.taskId) {
          tasksSheet.getRange(i + 1, 9).setValue(payload.submitLink || '');
          return respond({ success: true, message: 'Submission link updated.' });
        }
      }
      return respond({ success: false, message: 'Task not found.' });
    }

    // FORGE: Recall Task
    if (action === 'forge_recall_task') {
      var tasksSheet = getOrCreateSheet(ss, 'ForgeTasks', ['TaskID', 'Timestamp', 'Title', 'Description', 'XP', 'Difficulty', 'Status', 'AssignedTo', 'SubmitLink', 'Feedback']);
      var rows = tasksSheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === payload.taskId) {
          // Change status back to In Progress
          tasksSheet.getRange(i + 1, 7).setValue('In Progress');
          return respond({ success: true, message: 'Task recalled.' });
        }
      }
      return respond({ success: false, message: 'Task not found.' });
    }
"""

content = content.replace("    // Verify Admin Key\n    if (payload.adminKey !== 'INNOVEXA_SECURE_KEY_2025') {", new_code + "\n    // Verify Admin Key\n    if (payload.adminKey !== 'INNOVEXA_SECURE_KEY_2025') {")

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(content)

print("Patched Code.gs successfully!")
