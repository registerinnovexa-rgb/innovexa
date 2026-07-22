import re

with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'r') as f:
    content = f.read()

# 1. Extract the whole tabEvents block
match = re.search(r'(    <!-- ── EVENTS TAB ── -->\n    <div class="tab-content" id="tabEvents">.*?    </div>\n)', content, flags=re.DOTALL)
if match:
    tab_events_html = match.group(1)
    
    # 2. Remove it from its current location
    content = content.replace(tab_events_html, '')
    
    # 3. Find the end of tabMembers and the closing </div> of main-content
    target_spot = """      </div>
    </div>
</div>"""
    
    replacement_spot = """      </div>
    </div>
""" + tab_events_html + """
</div>"""
    
    content = content.replace(target_spot, replacement_spot)
    
    # Also I need to rename the old `loadEvents` to `loadEventsOld` just in case there's a conflict
    content = content.replace("async function loadEvents() {", "async function loadEventsOld() {", 1)
    
    with open('/Users/jaiakash/Documents/Inno-porta/admin.html', 'w') as f:
        f.write(content)
    print("Fixed tabEvents positioning.")
else:
    print("Could not find tabEvents block.")
