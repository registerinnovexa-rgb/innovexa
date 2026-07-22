import re

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'r') as f:
    content = f.read()

get_endpoint = """
    // FORGE: Get Resources
    if (action === 'forge_get_resources') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      var rRows = rSheet.getDataRange().getValues();
      var resources = [];
      for (var i = 1; i < rRows.length; i++) {
        resources.push({
          resourceId: rRows[i][0],
          timestamp: rRows[i][1],
          title: rRows[i][2],
          category: rRows[i][3],
          url: rRows[i][4],
          addedBy: rRows[i][5]
        });
      }
      return respond({ success: true, resources: resources.reverse() });
    }
"""

if 'forge_get_resources' not in content:
    content = content.replace('if (action === \'forge_get_leaderboard\') {', get_endpoint + '\n    if (action === \'forge_get_leaderboard\') {')

post_endpoints = """
    // ADMIN: Add Resource
    if (op === 'admin_add_resource') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      var resourceId = 'RES-' + Date.now();
      rSheet.appendRow([
        resourceId,
        new Date().toISOString(),
        payload.title || 'Untitled',
        payload.category || 'General',
        payload.url || '',
        'Admin'
      ]);
      return respond({ success: true, message: 'Resource added.', resourceId: resourceId });
    }

    // ADMIN: Delete Resource
    if (op === 'admin_delete_resource') {
      var rSheet = getOrCreateSheet(ss, 'ForgeResources', ['ResourceID', 'Timestamp', 'Title', 'Category', 'URL', 'AddedBy']);
      var rRows = rSheet.getDataRange().getValues();
      for (var i = 1; i < rRows.length; i++) {
        if (rRows[i][0] === payload.resourceId) {
          rSheet.deleteRow(i + 1);
          return respond({ success: true, message: 'Resource deleted.' });
        }
      }
      return respond({ success: false, message: 'Resource not found.' });
    }
"""

if 'admin_add_resource' not in content:
    content = content.replace('if (op === \'admin_create_task\') {', post_endpoints + '\n    if (op === \'admin_create_task\') {')

with open('/Users/jaiakash/Documents/Inno-porta/Code.gs', 'w') as f:
    f.write(content)
print("Patched Code.gs with Resource endpoints")
