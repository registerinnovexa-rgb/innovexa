import re

with open('atlas.html', 'r') as f:
    content = f.read()

new_resources_array = """const resources = [
    // Web Dev
    { title: 'MDN Web Docs', desc: 'The definitive source for web documentation.', cat: 'Web Dev', link: 'https://developer.mozilla.org' },
    { title: 'React', desc: 'The library for web and native user interfaces.', cat: 'Web Dev', link: 'https://react.dev' },
    { title: 'Next.js', desc: 'The React Framework for the Web.', cat: 'Web Dev', link: 'https://nextjs.org' },
    { title: 'Tailwind CSS', desc: 'Rapidly build modern websites without ever leaving your HTML.', cat: 'Web Dev', link: 'https://tailwindcss.com' },
    { title: 'TypeScript', desc: 'JavaScript with syntax for types.', cat: 'Web Dev', link: 'https://www.typescriptlang.org' },
    { title: 'Supabase', desc: 'The open source Firebase alternative.', cat: 'Web Dev', link: 'https://supabase.com' },
    { title: 'Vite', desc: 'Next Generation Frontend Tooling.', cat: 'Web Dev', link: 'https://vitejs.dev' },
    { title: 'Framer Motion', desc: 'Production-ready animation library for React.', cat: 'Web Dev', link: 'https://www.framer.com/motion/' },
    { title: 'Astro', desc: 'The web framework for content-driven websites.', cat: 'Web Dev', link: 'https://astro.build' },
    { title: 'Svelte', desc: 'Cybernetically enhanced web apps.', cat: 'Web Dev', link: 'https://svelte.dev' },
    { title: 'GSAP', desc: 'Professional-grade JavaScript animation.', cat: 'Web Dev', link: 'https://greensock.com/gsap/' },
    { title: 'Three.js', desc: 'JavaScript 3D Library.', cat: 'Web Dev', link: 'https://threejs.org' },

    // AI / ML
    { title: 'Hugging Face', desc: 'The hub for machine learning models and datasets.', cat: 'AI/ML', link: 'https://huggingface.co' },
    { title: 'PyTorch', desc: 'Open source machine learning framework.', cat: 'AI/ML', link: 'https://pytorch.org' },
    { title: 'TensorFlow', desc: 'End-to-end platform for machine learning.', cat: 'AI/ML', link: 'https://www.tensorflow.org' },
    { title: 'LangChain', desc: 'Building applications with LLMs through composability.', cat: 'AI/ML', link: 'https://www.langchain.com' },
    { title: 'LlamaIndex', desc: 'Data framework for your LLM applications.', cat: 'AI/ML', link: 'https://www.llamaindex.ai' },
    { title: 'Kaggle', desc: 'Machine Learning and Data Science Community.', cat: 'AI/ML', link: 'https://www.kaggle.com' },
    { title: 'Papers with Code', desc: 'The latest in machine learning research and code.', cat: 'AI/ML', link: 'https://paperswithcode.com' },
    { title: 'Fast.ai', desc: 'Making neural nets uncool again.', cat: 'AI/ML', link: 'https://www.fast.ai' },
    { title: 'OpenAI API', desc: 'Developer platform for GPT and DALL-E.', cat: 'AI/ML', link: 'https://platform.openai.com' },

    // Cybersecurity
    { title: 'OWASP', desc: 'Standard awareness document for web app security.', cat: 'Cybersecurity', link: 'https://owasp.org' },
    { title: 'HackTheBox', desc: 'Massive cybersecurity training platform.', cat: 'Cybersecurity', link: 'https://hackthebox.com' },
    { title: 'TryHackMe', desc: 'Bite-sized cybersecurity training.', cat: 'Cybersecurity', link: 'https://tryhackme.com' },
    { title: 'PortSwigger Web Security', desc: 'Free, interactive web security training.', cat: 'Cybersecurity', link: 'https://portswigger.net/web-security' },
    { title: 'Exploit Database', desc: 'Archive of public exploits and vulnerable software.', cat: 'Cybersecurity', link: 'https://www.exploit-db.com' },
    { title: 'Kali Linux', desc: 'Advanced Penetration Testing Linux distribution.', cat: 'Cybersecurity', link: 'https://www.kali.org' },
    { title: 'MITRE ATT&CK', desc: 'Globally-accessible knowledge base of adversary tactics.', cat: 'Cybersecurity', link: 'https://attack.mitre.org' },
    { title: 'Nmap', desc: 'Network exploration tool and security / port scanner.', cat: 'Cybersecurity', link: 'https://nmap.org' },

    // Mobile
    { title: 'Flutter', desc: 'UI toolkit for building natively compiled applications.', cat: 'Mobile', link: 'https://flutter.dev' },
    { title: 'React Native', desc: 'Create native apps for Android and iOS using React.', cat: 'Mobile', link: 'https://reactnative.dev' },
    { title: 'Expo', desc: 'The fastest way to build apps with React Native.', cat: 'Mobile', link: 'https://expo.dev' },
    { title: 'Swift', desc: 'Powerful and intuitive programming language for iOS.', cat: 'Mobile', link: 'https://developer.apple.com/swift/' },
    { title: 'Kotlin', desc: 'Modern programming language for Android.', cat: 'Mobile', link: 'https://kotlinlang.org' },
    { title: 'Android Developers', desc: 'Tools and resources for Android app development.', cat: 'Mobile', link: 'https://developer.android.com' },

    // DevOps
    { title: 'Docker', desc: 'Containerization and microservices architecture.', cat: 'DevOps', link: 'https://docs.docker.com' },
    { title: 'Kubernetes', desc: 'Production-grade container orchestration.', cat: 'DevOps', link: 'https://kubernetes.io' },
    { title: 'GitHub Actions', desc: 'Automate your workflow from idea to production.', cat: 'DevOps', link: 'https://github.com/features/actions' },
    { title: 'Terraform', desc: 'Infrastructure as code software tool.', cat: 'DevOps', link: 'https://www.terraform.io' },
    { title: 'AWS Documentation', desc: 'Comprehensive guides for Amazon Web Services.', cat: 'DevOps', link: 'https://docs.aws.amazon.com' },
    { title: 'Prometheus', desc: 'Systems monitoring and alerting toolkit.', cat: 'DevOps', link: 'https://prometheus.io' },
    { title: 'Grafana', desc: 'The open observability platform.', cat: 'DevOps', link: 'https://grafana.com' },
    { title: 'Ansible', desc: 'Radically simple IT automation.', cat: 'DevOps', link: 'https://www.ansible.com' },

    // UI / UX
    { title: 'Figma', desc: 'The collaborative interface design tool.', cat: 'UI/UX', link: 'https://figma.com' },
    { title: 'Mobbin', desc: 'The world’s largest UI & UX reference library.', cat: 'UI/UX', link: 'https://mobbin.com' },
    { title: 'Godly', desc: 'Astronomically good web design inspiration.', cat: 'UI/UX', link: 'https://godly.website' },
    { title: 'Awwwards', desc: 'The awards for design, creativity and innovation on the Internet.', cat: 'UI/UX', link: 'https://www.awwwards.com' },
    { title: 'Dribbble', desc: 'Discover the world’s top designers & creatives.', cat: 'UI/UX', link: 'https://dribbble.com' },
    { title: 'Google Fonts', desc: 'Making the web more beautiful, fast, and open.', cat: 'UI/UX', link: 'https://fonts.google.com' },
    { title: 'LottieFiles', desc: 'Lightweight, scalable animations for your web and apps.', cat: 'UI/UX', link: 'https://lottiefiles.com' },
    { title: 'Refactoring UI', desc: 'Learn how to design beautiful user interfaces.', cat: 'UI/UX', link: 'https://www.refactoringui.com' }
  ];"""

# Replace old resources array
content = re.sub(r'const resources = \[.*?\];', new_resources_array, content, flags=re.DOTALL)

with open('atlas.html', 'w') as f:
    f.write(content)

print("Added 50 resources")
