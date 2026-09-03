import re

with open('admin.html', 'r') as f:
    html = f.read()

# Add a utility class to the <style> block for the two-column grid
grid_class = """
    .dashboard-grid { display:grid; grid-template-columns: 2fr 1fr; gap:24px; align-items:start; }
    .charts-grid { display:grid; grid-template-columns: 1fr 1fr; gap:24px; }
    .actions-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .actions-grid { grid-template-columns: 1fr; }
    }
"""

# Insert right before </style>
html = html.replace('</style>', grid_class + '\n</style>')

# Replace the inline styles with the new classes
html = html.replace('style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; align-items:start;"', 'class="dashboard-grid"')
html = html.replace('style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;"', 'class="charts-grid"')
html = html.replace('style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px;"', 'class="actions-grid"')

with open('admin.html', 'w') as f:
    f.write(html)
