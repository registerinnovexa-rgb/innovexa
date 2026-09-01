import re

with open('index.html', 'r') as f:
    content = f.read()

new_trajectory = """
<!-- ══ ROADMAP (FILE SYSTEM IDE) ══════════════════════════════════════════════════ -->
<section class="roadmap-section container fade-up" style="margin-bottom: 60px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h2 style="font-size: 36px; font-family: var(--font-d); letter-spacing: -0.03em;">Trajectory <span class="italic" style="font-family:'Times New Roman',serif; font-style:italic; font-weight:400; opacity:0.8;">2026–2028.</span></h2>
  </div>

  <div class="ide-container" style="background: #1e1e1e; border-radius: 12px; border: 1px solid #333; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); max-width: 900px; margin: 0 auto; min-height: 400px; color: #ccc; font-family: 'Courier New', monospace; text-align: left;">
    
    <!-- IDE Header -->
    <div style="background: #252526; padding: 10px 16px; display: flex; align-items: center; border-bottom: 1px solid #111;">
      <div style="display: flex; gap: 8px;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
      </div>
      <div style="margin: 0 auto; font-size: 13px; color: #858585;">innovexa-workspace — Trajectory</div>
      <div style="width: 44px;"></div> <!-- Spacer -->
    </div>

    <!-- IDE Body -->
    <div style="display: flex; flex: 1; flex-wrap: wrap;">
      
      <!-- Sidebar -->
      <div style="width: 250px; background: #252526; border-right: 1px solid #333; padding: 16px 0; overflow-y: auto; flex-shrink: 0;">
        <div style="padding: 0 16px; font-size: 11px; text-transform: uppercase; color: #858585; letter-spacing: 1px; margin-bottom: 12px; font-family: sans-serif; font-weight: bold;">Explorer</div>
        
        <!-- Folder Tree -->
        <ul class="ide-tree" style="list-style: none; padding: 0; margin: 0; font-size: 13px; line-height: 2;">
          
          <!-- trajectory -->
          <li>
            <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> trajectory</div>
            <ul style="list-style: none; padding-left: 24px; margin: 0;">
              
              <!-- 2026 -->
              <li>
                <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> 2026</div>
                <ul style="list-style: none; padding-left: 24px; margin: 0;">
                  
                  <!-- Q3 Initiation -->
                  <li>
                    <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> Q3_Initiation</div>
                    <ul style="list-style: none; padding-left: 24px; margin: 0;">
                      <li class="ide-file active" data-file="initiation.md" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; background: #37373d; color: #fff; user-select: none;"><span style="font-size: 14px;">📄</span> initiation.md</li>
                    </ul>
                  </li>
                  
                  <!-- Q4 Execution -->
                  <li>
                    <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> Q4_Execution</div>
                    <ul style="list-style: none; padding-left: 24px; margin: 0; display: none;">
                      <li class="ide-file" data-file="execution.md" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📄</span> execution.md</li>
                    </ul>
                  </li>

                </ul>
              </li>

              <!-- 2027 -->
              <li>
                <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> 2027</div>
                <ul style="list-style: none; padding-left: 24px; margin: 0; display: none;">
                  
                  <!-- Q1-Q2 Expansion -->
                  <li>
                    <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> Q1-Q2_Expansion</div>
                    <ul style="list-style: none; padding-left: 24px; margin: 0; display: none;">
                      <li class="ide-file" data-file="expansion.md" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📄</span> expansion.md</li>
                    </ul>
                  </li>
                  
                  <!-- Apex -->
                  <li>
                    <div class="ide-folder" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📂</span> Apex</div>
                    <ul style="list-style: none; padding-left: 24px; margin: 0; display: none;">
                      <li class="ide-file" data-file="apex.md" style="padding: 4px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; user-select: none;"><span style="font-size: 14px;">📄</span> apex.md</li>
                    </ul>
                  </li>

                </ul>
              </li>

            </ul>
          </li>
        </ul>
      </div>

      <!-- Editor Window -->
      <div style="flex: 1; min-width: 300px; background: #1e1e1e; display: flex; flex-direction: column;">
        
        <!-- Tabs -->
        <div style="display: flex; background: #2d2d2d; overflow-x: auto;">
          <div id="ide-tab-name" style="padding: 10px 20px; background: #1e1e1e; border-top: 2px solid #007acc; font-size: 13px; color: #fff; white-space: nowrap;">initiation.md</div>
        </div>

        <!-- Code Content -->
        <div style="padding: 32px 24px; font-size: 15px; line-height: 1.7; overflow-y: auto;" id="ide-content-area">
          <div class="ide-pane active" id="pane-initiation.md">
            <span style="color: #569cd6;">#</span> <span style="color: #ce9178; font-weight:bold;">Initiation - Q3 2026</span><br><br>
            <span style="color: #6a9955;">// The beginning of the collective.</span><br><br>
            <span style="color: #dcdcaa;">execute</span>(<span style="color: #ce9178;">'Recruitment'</span>, { <br>
            &nbsp;&nbsp;target: <span style="color: #ce9178;">'Foundational Batch'</span>, <br>
            &nbsp;&nbsp;status: <span style="color: #569cd6;">true</span> <br>
            });<br><br>
            <span style="color: #dcdcaa;">launch</span>(<span style="color: #ce9178;">'Pathfinder Bootcamp'</span>, { <br>
            &nbsp;&nbsp;track: <span style="color: #ce9178;">'Full-Stack Web Architecture'</span> <br>
            });
          </div>
          
          <div class="ide-pane" id="pane-execution.md" style="display: none;">
            <span style="color: #569cd6;">#</span> <span style="color: #ce9178; font-weight:bold;">Execution - Q4 2026</span><br><br>
            <span style="color: #6a9955;">// Forging skills through pressure.</span><br><br>
            <span style="color: #c586c0;">const</span> hackathon = <span style="color: #569cd6;">new</span> <span style="color: #4ec9b0;">InternalEvent</span>();<br>
            hackathon.<span style="color: #dcdcaa;">duration</span>(<span style="color: #b5cea8;">48</span>);<br><br>
            <span style="color: #c586c0;">await</span> <span style="color: #dcdcaa;">deploy</span>(<span style="color: #ce9178;">'Open-Source Projects'</span>);<br>
            <span style="color: #c586c0;">await</span> <span style="color: #dcdcaa;">build</span>(<span style="color: #ce9178;">'Portfolios'</span>);
          </div>

          <div class="ide-pane" id="pane-expansion.md" style="display: none;">
            <span style="color: #569cd6;">#</span> <span style="color: #ce9178; font-weight:bold;">Expansion - Q1-Q2 2027</span><br><br>
            <span style="color: #6a9955;">// Scaling operations and expertise.</span><br><br>
            <span style="color: #c586c0;">import</span> { Summits } <span style="color: #c586c0;">from</span> <span style="color: #ce9178;">'./cross-college'</span>;<br><br>
            <span style="color: #c586c0;">const</span> tracks = [<br>
            &nbsp;&nbsp;<span style="color: #ce9178;">'Applied AI'</span>,<br>
            &nbsp;&nbsp;<span style="color: #ce9178;">'Blockchain / Web3'</span>,<br>
            &nbsp;&nbsp;<span style="color: #ce9178;">'Cyber Defense'</span><br>
            ];<br><br>
            <span style="color: #dcdcaa;">initializeSpecialization</span>(tracks);
          </div>

          <div class="ide-pane" id="pane-apex.md" style="display: none;">
            <span style="color: #569cd6;">#</span> <span style="color: #ce9178; font-weight:bold;">Apex - 2027+</span><br><br>
            <span style="color: #6a9955;">// The ultimate objective.</span><br><br>
            <span style="color: #4ec9b0;">Network</span>.<span style="color: #dcdcaa;">connect</span>(<span style="color: #ce9178;">'Direct Industry'</span>);<br><br>
            <span style="color: #c586c0;">for</span> (<span style="color: #c586c0;">let</span> op <span style="color: #c586c0;">of</span> operatives) {<br>
            &nbsp;&nbsp;<span style="color: #c586c0;">if</span> (op.isReady) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;op.<span style="color: #dcdcaa;">incubate</span>(<span style="color: #ce9178;">'Startup / Product'</span>);<br>
            &nbsp;&nbsp;}<br>
            }
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Simple toggle logic for folders
    document.querySelectorAll('.ide-folder').forEach(folder => {
      folder.addEventListener('click', (e) => {
        const ul = folder.nextElementSibling;
        if(ul && ul.tagName === 'UL') {
          ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
        }
      });
    });

    // File selection logic
    document.querySelectorAll('.ide-file').forEach(file => {
      file.addEventListener('click', () => {
        document.querySelectorAll('.ide-file').forEach(f => {
          f.style.background = 'transparent';
          f.style.color = '#ccc';
        });
        
        file.style.background = '#37373d';
        file.style.color = '#fff';

        const filename = file.dataset.file;
        document.getElementById('ide-tab-name').innerText = filename;

        document.querySelectorAll('.ide-pane').forEach(p => p.style.display = 'none');
        document.getElementById('pane-' + filename).style.display = 'block';
      });
    });
  </script>
</section>
"""

old_roadmap_pattern = r'<!-- ══ ROADMAP ══════════════════════════════════════════════════ -->.*?</section>'
# re.sub with count=1 in case there are multiple roadmap sections (there is a Skill Tree below it)
content = re.sub(old_roadmap_pattern, new_trajectory, content, count=1, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)

print("Done")
