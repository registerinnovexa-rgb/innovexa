import re
import json

additional_resources = [
    # Web Dev (50)
    {"title": "Meteor", "desc": "An ultra-simple environment for building modern web applications.", "cat": "Web Dev", "link": "https://github.com/meteor/meteor"},
    {"title": "Remix", "desc": "Build Better Websites. Create modern, resilient user experiences with web fundamentals.", "cat": "Web Dev", "link": "https://github.com/remix-run/remix"},
    {"title": "Ember.js", "desc": "Ember.js - A JavaScript framework for creating ambitious web applications", "cat": "Web Dev", "link": "https://github.com/emberjs/ember.js"},
    {"title": "Preact", "desc": "Fast 3kB alternative to React with the same modern API.", "cat": "Web Dev", "link": "https://github.com/preactjs/preact"},
    {"title": "Lit", "desc": "Lit is a simple base class for creating fast, lightweight web components.", "cat": "Web Dev", "link": "https://github.com/lit/lit"},
    {"title": "Stencil", "desc": "A Compiler for Web Components and High Performance Web Apps.", "cat": "Web Dev", "link": "https://github.com/ionic-team/stencil"},
    {"title": "Mithril", "desc": "A JavaScript Framework for Building Brilliant Applications", "cat": "Web Dev", "link": "https://github.com/MithrilJS/mithril.js"},
    {"title": "Fastify", "desc": "Fast and low overhead web framework, for Node.js", "cat": "Web Dev", "link": "https://github.com/fastify/fastify"},
    {"title": "Koa", "desc": "Expressive middleware for node.js using ES2017 async functions", "cat": "Web Dev", "link": "https://github.com/koajs/koa"},
    {"title": "AdonisJS", "desc": "A fully featured web framework for Node.js", "cat": "Web Dev", "link": "https://github.com/adonisjs/core"},
    {"title": "Sails.js", "desc": "Realtime MVC Framework for Node.js", "cat": "Web Dev", "link": "https://github.com/balderdashy/sails"},
    {"title": "Hapi", "desc": "The Simple, Secure Framework Developers Trust", "cat": "Web Dev", "link": "https://github.com/hapijs/hapi"},
    {"title": "Feathers", "desc": "The API and real-time application framework", "cat": "Web Dev", "link": "https://github.com/feathersjs/feathers"},
    {"title": "LoopBack", "desc": "A highly extensible Node.js and TypeScript framework for building APIs and microservices.", "cat": "Web Dev", "link": "https://github.com/strongloop/loopback-next"},
    {"title": "Socket.IO", "desc": "Realtime application framework (Node.JS server)", "cat": "Web Dev", "link": "https://github.com/socketio/socket.io"},
    {"title": "TypeORM", "desc": "ORM for TypeScript and JavaScript (ES7, ES6, ES5)", "cat": "Web Dev", "link": "https://github.com/typeorm/typeorm"},
    {"title": "Sequelize", "desc": "An easy-to-use multi SQL dialect ORM for Node.js", "cat": "Web Dev", "link": "https://github.com/sequelize/sequelize"},
    {"title": "Mongoose", "desc": "MongoDB object modeling designed to work in an asynchronous environment.", "cat": "Web Dev", "link": "https://github.com/Automattic/mongoose"},
    {"title": "Drizzle ORM", "desc": "TypeScript ORM that feels like SQL", "cat": "Web Dev", "link": "https://github.com/drizzle-team/drizzle-orm"},
    {"title": "WatermelonDB", "desc": "Reactive & asynchronous database for powerful React and React Native apps", "cat": "Web Dev", "link": "https://github.com/Nozbe/WatermelonDB"},
    {"title": "RxDB", "desc": "A fast, offline-first, reactive database for JavaScript Applications", "cat": "Web Dev", "link": "https://github.com/pubkey/rxdb"},
    {"title": "PouchDB", "desc": "PouchDB is a pocket-sized database.", "cat": "Web Dev", "link": "https://github.com/pouchdb/pouchdb"},
    {"title": "Gun", "desc": "An open source cybersecurity protocol for syncing decentralized graph data.", "cat": "Web Dev", "link": "https://github.com/amark/gun"},
    {"title": "Hasura", "desc": "Blazing fast, instant realtime GraphQL APIs on all your data", "cat": "Web Dev", "link": "https://github.com/hasura/graphql-engine"},
    {"title": "PostGraphile", "desc": "Execute one blazing-fast GraphQL query for any SQL database", "cat": "Web Dev", "link": "https://github.com/graphile/postgraphile"},
    {"title": "Relay", "desc": "Relay is a JavaScript framework for building data-driven React applications.", "cat": "Web Dev", "link": "https://github.com/facebook/relay"},
    {"title": "URQL", "desc": "A highly customizable and versatile GraphQL client for React", "cat": "Web Dev", "link": "https://github.com/urql-graphql/urql"},
    {"title": "SWR", "desc": "React Hooks for Data Fetching", "cat": "Web Dev", "link": "https://github.com/vercel/swr"},
    {"title": "React Query", "desc": "Powerful asynchronous state management for TS/JS, React, Solid, Vue and Svelte", "cat": "Web Dev", "link": "https://github.com/TanStack/query"},
    {"title": "MobX", "desc": "Simple, scalable state management.", "cat": "Web Dev", "link": "https://github.com/mobxjs/mobx"},
    {"title": "Recoil", "desc": "An experimental state management library for React apps", "cat": "Web Dev", "link": "https://github.com/facebookexperimental/Recoil"},
    {"title": "Jotai", "desc": "Primitive and flexible state management for React", "cat": "Web Dev", "link": "https://github.com/pmndrs/jotai"},
    {"title": "XState", "desc": "State machines and statecharts for the modern web.", "cat": "Web Dev", "link": "https://github.com/statelyai/xstate"},
    {"title": "Immer", "desc": "Create the next immutable state by mutating the current one", "cat": "Web Dev", "link": "https://github.com/immerjs/immer"},
    {"title": "RxJS", "desc": "A reactive programming library for JavaScript", "cat": "Web Dev", "link": "https://github.com/ReactiveX/rxjs"},
    {"title": "Lodash", "desc": "A modern JavaScript utility library delivering modularity, performance, & extras.", "cat": "Web Dev", "link": "https://github.com/lodash/lodash"},
    {"title": "Ramda", "desc": "Practical functional Javascript", "cat": "Web Dev", "link": "https://github.com/ramda/ramda"},
    {"title": "Moment.js", "desc": "Parse, validate, manipulate, and display dates in javascript.", "cat": "Web Dev", "link": "https://github.com/moment/moment"},
    {"title": "Date-fns", "desc": "Modern JavaScript date utility library", "cat": "Web Dev", "link": "https://github.com/date-fns/date-fns"},
    {"title": "Day.js", "desc": "2KB immutable date-time library alternative to Moment.js", "cat": "Web Dev", "link": "https://github.com/iamkun/dayjs"},
    {"title": "Axios", "desc": "Promise based HTTP client for the browser and node.js", "cat": "Web Dev", "link": "https://github.com/axios/axios"},
    {"title": "Ky", "desc": "Tiny & elegant HTTP client based on the browser Fetch API", "cat": "Web Dev", "link": "https://github.com/sindresorhus/ky"},
    {"title": "Superagent", "desc": "Ajax with less suck - (and node.js HTTP client to match)", "cat": "Web Dev", "link": "https://github.com/ladjs/superagent"},
    {"title": "Parcel", "desc": "The zero configuration build tool for the web.", "cat": "Web Dev", "link": "https://github.com/parcel-bundler/parcel"},
    {"title": "Rollup", "desc": "Next-generation ES module bundler", "cat": "Web Dev", "link": "https://github.com/rollup/rollup"},
    {"title": "Esbuild", "desc": "An extremely fast JavaScript and CSS bundler and minifier.", "cat": "Web Dev", "link": "https://github.com/evanw/esbuild"},
    {"title": "SWC", "desc": "Rust-based platform for the Web", "cat": "Web Dev", "link": "https://github.com/swc-project/swc"},
    {"title": "Turbopack", "desc": "An incremental bundler optimized for JavaScript and TypeScript", "cat": "Web Dev", "link": "https://github.com/vercel/turbo"},
    {"title": "Rome / Biome", "desc": "A toolchain for web projects, aimed to provide functionality to maintain them.", "cat": "Web Dev", "link": "https://github.com/biomejs/biome"},
    {"title": "Prettier", "desc": "Prettier is an opinionated code formatter.", "cat": "Web Dev", "link": "https://github.com/prettier/prettier"},

    # AI / ML (40)
    {"title": "JAX", "desc": "Composable transformations of Python+NumPy programs: differentiate, vectorize, JIT to GPU/TPU", "cat": "AI/ML", "link": "https://github.com/google/jax"},
    {"title": "Flax", "desc": "A neural network library and ecosystem for JAX", "cat": "AI/ML", "link": "https://github.com/google/flax"},
    {"title": "Haiku", "desc": "JAX-based neural network library", "cat": "AI/ML", "link": "https://github.com/deepmind/dm-haiku"},
    {"title": "Optax", "desc": "Gradient processing and optimization library for JAX", "cat": "AI/ML", "link": "https://github.com/deepmind/optax"},
    {"title": "FastAPI (AI use)", "desc": "Often used for serving ML models quickly.", "cat": "AI/ML", "link": "https://github.com/tiangolo/fastapi"},
    {"title": "BentoML", "desc": "Build Reliable, Scalable, and Cost-Efficient AI Applications", "cat": "AI/ML", "link": "https://github.com/bentoml/BentoML"},
    {"title": "Ray Serve", "desc": "Scalable model serving library", "cat": "AI/ML", "link": "https://github.com/ray-project/ray"},
    {"title": "Seldon Core", "desc": "An MLOps framework to package, deploy, monitor and manage thousands of production ML models", "cat": "AI/ML", "link": "https://github.com/SeldonIO/seldon-core"},
    {"title": "Kubeflow", "desc": "Machine Learning Toolkit for Kubernetes", "cat": "AI/ML", "link": "https://github.com/kubeflow/kubeflow"},
    {"title": "TFX", "desc": "TensorFlow Extended (TFX) is an end-to-end platform for deploying production ML pipelines", "cat": "AI/ML", "link": "https://github.com/tensorflow/tfx"},
    {"title": "CatBoost", "desc": "A fast, scalable, high performance Gradient Boosting on Decision Trees library", "cat": "AI/ML", "link": "https://github.com/catboost/catboost"},
    {"title": "Prophet", "desc": "Tool for producing high quality forecasts for time series data", "cat": "AI/ML", "link": "https://github.com/facebook/prophet"},
    {"title": "Statsmodels", "desc": "Statistical modeling and econometrics in Python", "cat": "AI/ML", "link": "https://github.com/statsmodels/statsmodels"},
    {"title": "PyMC", "desc": "Probabilistic Programming in Python: Bayesian Modeling and Probabilistic Machine Learning", "cat": "AI/ML", "link": "https://github.com/pymc-devs/pymc"},
    {"title": "Tesseract", "desc": "Tesseract Open Source OCR Engine", "cat": "AI/ML", "link": "https://github.com/tesseract-ocr/tesseract"},
    {"title": "EasyOCR", "desc": "Ready-to-use OCR with 80+ supported languages and all popular writing scripts", "cat": "AI/ML", "link": "https://github.com/JaidedAI/EasyOCR"},
    {"title": "Detectron2", "desc": "Detectron2 is a platform for object detection, segmentation and other visual recognition tasks", "cat": "AI/ML", "link": "https://github.com/facebookresearch/detectron2"},
    {"title": "MMDetection", "desc": "OpenMMLab Detection Toolbox and Benchmark", "cat": "AI/ML", "link": "https://github.com/open-mmlab/mmdetection"},
    {"title": "MediaPipe", "desc": "Cross-platform, customizable ML solutions for live and streaming media", "cat": "AI/ML", "link": "https://github.com/google/mediapipe"},
    {"title": "DeepFace", "desc": "A Lightweight Face Recognition and Facial Attribute Analysis Library for Python", "cat": "AI/ML", "link": "https://github.com/serengil/deepface"},
    {"title": "Gensim", "desc": "Topic Modelling for Humans", "cat": "AI/ML", "link": "https://github.com/piskvorky/gensim"},
    {"title": "AllenNLP", "desc": "An open-source NLP research library, built on PyTorch", "cat": "AI/ML", "link": "https://github.com/allenai/allennlp"},
    {"title": "Stanza", "desc": "Official Stanford NLP Python Library for Many Human Languages", "cat": "AI/ML", "link": "https://github.com/stanfordnlp/stanza"},
    {"title": "Fairseq", "desc": "A sequence modeling toolkit that allows researchers to train custom models", "cat": "AI/ML", "link": "https://github.com/facebookresearch/fairseq"},
    {"title": "ESPnet", "desc": "End-to-End Speech Processing Toolkit", "cat": "AI/ML", "link": "https://github.com/espnet/espnet"},
    {"title": "SpeechBrain", "desc": "A PyTorch-based Speech Toolkit", "cat": "AI/ML", "link": "https://github.com/speechbrain/speechbrain"},
    {"title": "Librosa", "desc": "Python library for audio and music analysis", "cat": "AI/ML", "link": "https://github.com/librosa/librosa"},
    {"title": "Stable Baselines3", "desc": "PyTorch version of Stable Baselines, reliable implementations of reinforcement learning algorithms", "cat": "AI/ML", "link": "https://github.com/DLR-RM/stable-baselines3"},
    {"title": "RLlib", "desc": "Industry-grade reinforcement learning library", "cat": "AI/ML", "link": "https://github.com/ray-project/ray/tree/master/rllib"},
    {"title": "PettingZoo", "desc": "An API standard for multi-agent reinforcement learning", "cat": "AI/ML", "link": "https://github.com/Farama-Foundation/PettingZoo"},
    {"title": "Optuna", "desc": "A hyperparameter optimization framework", "cat": "AI/ML", "link": "https://github.com/optuna/optuna"},
    {"title": "Hyperopt", "desc": "Distributed Asynchronous Hyperparameter Optimization", "cat": "AI/ML", "link": "https://github.com/hyperopt/hyperopt"},
    {"title": "Dask", "desc": "Parallel computing with task scheduling", "cat": "AI/ML", "link": "https://github.com/dask/dask"},
    {"title": "Vaex", "desc": "Out-of-Core DataFrames for Python, ML, visualization", "cat": "AI/ML", "link": "https://github.com/vaexio/vaex"},
    {"title": "Modin", "desc": "Speed up your Pandas workflows by changing a single line of code", "cat": "AI/ML", "link": "https://github.com/modin-project/modin"},
    {"title": "Polars", "desc": "Fast multi-threaded, hybrid-streaming DataFrame library", "cat": "AI/ML", "link": "https://github.com/pola-rs/polars"},
    {"title": "DuckDB", "desc": "DuckDB is an in-process SQL OLAP Database Management System", "cat": "AI/ML", "link": "https://github.com/duckdb/duckdb"},
    {"title": "Apache Spark", "desc": "Apache Spark - A unified analytics engine for large-scale data processing", "cat": "AI/ML", "link": "https://github.com/apache/spark"},
    {"title": "Apache Flink", "desc": "Apache Flink", "cat": "AI/ML", "link": "https://github.com/apache/flink"},
    {"title": "Apache Kafka", "desc": "Mirror of Apache Kafka", "cat": "AI/ML", "link": "https://github.com/apache/kafka"},

    # Cybersecurity (30)
    {"title": "Snort", "desc": "Snort - Network Intrusion Detection and Prevention System", "cat": "Cybersecurity", "link": "https://github.com/snort3/snort3"},
    {"title": "Zeek", "desc": "Zeek is a powerful network analysis framework", "cat": "Cybersecurity", "link": "https://github.com/zeek/zeek"},
    {"title": "OSSEC", "desc": "OSSEC is a full platform to monitor and control your systems", "cat": "Cybersecurity", "link": "https://github.com/ossec/ossec-hids"},
    {"title": "Security Onion", "desc": "Linux distro for intrusion detection, enterprise security monitoring, and log management", "cat": "Cybersecurity", "link": "https://github.com/Security-Onion-Solutions/securityonion"},
    {"title": "MISP", "desc": "MISP (core software) - Open Source Threat Intelligence and Sharing Platform", "cat": "Cybersecurity", "link": "https://github.com/MISP/MISP"},
    {"title": "TheHive", "desc": "A Scalable, Open Source and Free Security Incident Response Platform", "cat": "Cybersecurity", "link": "https://github.com/TheHive-Project/TheHive"},
    {"title": "Cortex", "desc": "Powerful Observable Analysis and Active Response Engine", "cat": "Cybersecurity", "link": "https://github.com/TheHive-Project/Cortex"},
    {"title": "YARA", "desc": "The pattern matching swiss knife", "cat": "Cybersecurity", "link": "https://github.com/VirusTotal/yara"},
    {"title": "Sigma", "desc": "Generic Signature Format for SIEM Systems", "cat": "Cybersecurity", "link": "https://github.com/SigmaHQ/sigma"},
    {"title": "Volatility", "desc": "An advanced memory forensics framework", "cat": "Cybersecurity", "link": "https://github.com/volatilityfoundation/volatility3"},
    {"title": "Rekall", "desc": "Memory Forensic Framework", "cat": "Cybersecurity", "link": "https://github.com/google/rekall"},
    {"title": "Autopsy", "desc": "Autopsy is a digital forensics platform and graphical interface to The Sleuth Kit", "cat": "Cybersecurity", "link": "https://github.com/sleuthkit/autopsy"},
    {"title": "The Sleuth Kit", "desc": "The Sleuth Kit (TSK) is a library and collection of command line digital forensics tools", "cat": "Cybersecurity", "link": "https://github.com/sleuthkit/sleuthkit"},
    {"title": "Cuckoo Sandbox", "desc": "Cuckoo Sandbox is an automated dynamic malware analysis system", "cat": "Cybersecurity", "link": "https://github.com/cuckoosandbox/cuckoo"},
    {"title": "CAPE Sandbox", "desc": "Malware Configuration And Payload Extraction", "cat": "Cybersecurity", "link": "https://github.com/kevoreilly/CAPEv2"},
    {"title": "Ghidra (Scripts)", "desc": "Community scripts for Ghidra", "cat": "Cybersecurity", "link": "https://github.com/NationalSecurityAgency/ghidra/tree/master/Ghidra/Features/Python/ghidra_scripts"},
    {"title": "Cutter", "desc": "Free and Open Source Reverse Engineering Platform powered by rizin", "cat": "Cybersecurity", "link": "https://github.com/rizinorg/cutter"},
    {"title": "Rizin", "desc": "UNIX-like reverse engineering framework and command-line toolset", "cat": "Cybersecurity", "link": "https://github.com/rizinorg/rizin"},
    {"title": "x64dbg", "desc": "An open-source x64/x32 debugger for windows", "cat": "Cybersecurity", "link": "https://github.com/x64dbg/x64dbg"},
    {"title": "Frida", "desc": "Clone this repo to build Frida", "cat": "Cybersecurity", "link": "https://github.com/frida/frida"},
    {"title": "MobSF", "desc": "Mobile Security Framework is an automated, all-in-one mobile application pen-testing tool", "cat": "Cybersecurity", "link": "https://github.com/MobSF/Mobile-Security-Framework-MobSF"},
    {"title": "Drozer", "desc": "The Leading Security Assessment Framework for Android.", "cat": "Cybersecurity", "link": "https://github.com/WithSecureLabs/drozer"},
    {"title": "Needle", "desc": "The iOS Security Testing Framework", "cat": "Cybersecurity", "link": "https://github.com/WithSecureLabs/needle"},
    {"title": "Objection", "desc": "Runtime Mobile Exploration", "cat": "Cybersecurity", "link": "https://github.com/sensepost/objection"},
    {"title": "Kube-bench", "desc": "Checks whether Kubernetes is deployed according to security best practices", "cat": "Cybersecurity", "link": "https://github.com/aquasecurity/kube-bench"},
    {"title": "Kube-hunter", "desc": "Hunt for security weaknesses in Kubernetes clusters", "cat": "Cybersecurity", "link": "https://github.com/aquasecurity/kube-hunter"},
    {"title": "Trivy", "desc": "Find vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repos, clouds", "cat": "Cybersecurity", "link": "https://github.com/aquasecurity/trivy"},
    {"title": "Checkov", "desc": "Prevent cloud misconfigurations and find vulnerabilities during build-time in infrastructure as code", "cat": "Cybersecurity", "link": "https://github.com/bridgecrewio/checkov"},
    {"title": "ScoutSuite", "desc": "Multi-Cloud Security Auditing Tool", "cat": "Cybersecurity", "link": "https://github.com/nccgroup/ScoutSuite"},
    {"title": "Prowler", "desc": "Prowler is an Open Source security tool to perform AWS, GCP and Azure security best practices assessments", "cat": "Cybersecurity", "link": "https://github.com/prowler-cloud/prowler"},

    # Mobile (30)
    {"title": "Redux Toolkit", "desc": "The official, opinionated, batteries-included toolset for efficient Redux development", "cat": "Mobile", "link": "https://github.com/reduxjs/redux-toolkit"},
    {"title": "React Native Elements", "desc": "Cross-Platform React Native UI Toolkit", "cat": "Mobile", "link": "https://github.com/react-native-elements/react-native-elements"},
    {"title": "NativeBase", "desc": "Mobile-first, accessible components for React Native & Web", "cat": "Mobile", "link": "https://github.com/GeekyAnts/NativeBase"},
    {"title": "React Native Paper", "desc": "Material Design for React Native", "cat": "Mobile", "link": "https://github.com/callstack/react-native-paper"},
    {"title": "WatermelonDB (Mobile)", "desc": "Reactive & asynchronous database for powerful React and React Native apps", "cat": "Mobile", "link": "https://github.com/Nozbe/WatermelonDB"},
    {"title": "Lottie-React-Native", "desc": "Lottie wrapper for React Native", "cat": "Mobile", "link": "https://github.com/lottie-react-native/lottie-react-native"},
    {"title": "React Native Vector Icons", "desc": "Customizable Icons for React Native", "cat": "Mobile", "link": "https://github.com/oblador/react-native-vector-icons"},
    {"title": "React Native Maps", "desc": "React Native Mapview component", "cat": "Mobile", "link": "https://github.com/react-native-maps/react-native-maps"},
    {"title": "React Native Firebase", "desc": "A well-tested, feature-rich modular Firebase implementation for React Native", "cat": "Mobile", "link": "https://github.com/invertase/react-native-firebase"},
    {"title": "React Native Camera", "desc": "A Camera component for React Native. Also supports barcode scanning!", "cat": "Mobile", "link": "https://github.com/react-native-camera/react-native-camera"},
    {"title": "Bloc", "desc": "A predictable state management library that helps implement the BLoC design pattern", "cat": "Mobile", "link": "https://github.com/felangel/bloc"},
    {"title": "Provider", "desc": "InheritedWidget, but simple", "cat": "Mobile", "link": "https://github.com/rrousselGit/provider"},
    {"title": "Riverpod", "desc": "A reactive caching and data-binding framework", "cat": "Mobile", "link": "https://github.com/rrousselGit/riverpod"},
    {"title": "GetX", "desc": "Open source library for Flutter to handle state management, dependency injection, and route management", "cat": "Mobile", "link": "https://github.com/jonataslaw/getx"},
    {"title": "Dio", "desc": "A powerful Http client for Dart", "cat": "Mobile", "link": "https://github.com/cfug/dio"},
    {"title": "Hive", "desc": "Lightweight and blazing fast key-value database written in pure Dart.", "cat": "Mobile", "link": "https://github.com/isar/hive"},
    {"title": "Isar", "desc": "Extremely fast, easy to use, and fully async NoSQL database for Flutter", "cat": "Mobile", "link": "https://github.com/isar/isar"},
    {"title": "Sqflite", "desc": "SQLite flutter plugin", "cat": "Mobile", "link": "https://github.com/tekartik/sqflite"},
    {"title": "FlutterFire", "desc": "A collection of Firebase plugins for Flutter apps", "cat": "Mobile", "link": "https://github.com/firebase/flutterfire"},
    {"title": "Cached Network Image", "desc": "Flutter library to load and cache network images.", "cat": "Mobile", "link": "https://github.com/Baseflow/flutter_cached_network_image"},
    {"title": "Dagger", "desc": "A fast dependency injector for Android and Java.", "cat": "Mobile", "link": "https://github.com/google/dagger"},
    {"title": "Hilt", "desc": "Dependency injection library for Android that reduces the boilerplate of doing manual dependency injection", "cat": "Mobile", "link": "https://github.com/google/dagger"},
    {"title": "Coroutines", "desc": "Library support for Kotlin coroutines", "cat": "Mobile", "link": "https://github.com/Kotlin/kotlinx.coroutines"},
    {"title": "Room", "desc": "The Room persistence library provides an abstraction layer over SQLite", "cat": "Mobile", "link": "https://developer.android.com/training/data-storage/room"},
    {"title": "Moya", "desc": "Network abstraction layer written in Swift.", "cat": "Mobile", "link": "https://github.com/Moya/Moya"},
    {"title": "SwiftyJSON", "desc": "The better way to deal with JSON data in Swift.", "cat": "Mobile", "link": "https://github.com/SwiftyJSON/SwiftyJSON"},
    {"title": "PromiseKit", "desc": "Promises for Swift & ObjC.", "cat": "Mobile", "link": "https://github.com/mxcl/PromiseKit"},
    {"title": "Iguana", "desc": "An open source mobile app development tool", "cat": "Mobile", "link": "https://github.com/mac-c/Iguana"},
    {"title": "Bitrise", "desc": "Mobile Continuous Integration and Delivery", "cat": "Mobile", "link": "https://github.com/bitrise-io/bitrise"},
    {"title": "CodePush", "desc": "A cloud service that enables Cordova and React Native developers to deploy mobile app updates directly to their users' devices.", "cat": "Mobile", "link": "https://github.com/microsoft/code-push"},

    # DevOps (30)
    {"title": "OpenFaaS", "desc": "Serverless Functions Made Simple", "cat": "DevOps", "link": "https://github.com/openfaas/faas"},
    {"title": "Serverless Framework", "desc": "Build applications on AWS Lambda and other next-gen cloud services", "cat": "DevOps", "link": "https://github.com/serverless/serverless"},
    {"title": "Knative", "desc": "Kubernetes-based platform to build, deploy, and manage modern serverless workloads", "cat": "DevOps", "link": "https://github.com/knative/serving"},
    {"title": "OpenWhisk", "desc": "Apache OpenWhisk is a serverless, open source cloud platform", "cat": "DevOps", "link": "https://github.com/apache/openwhisk"},
    {"title": "Fission", "desc": "Fast and Simple Serverless Functions for Kubernetes", "cat": "DevOps", "link": "https://github.com/fission/fission"},
    {"title": "Kubeless", "desc": "Kubernetes Native Serverless Framework", "cat": "DevOps", "link": "https://github.com/vmware-archive/kubeless"},
    {"title": "Nuclio", "desc": "High-Performance Serverless event and data processing platform", "cat": "DevOps", "link": "https://github.com/nuclio/nuclio"},
    {"title": "KEDA", "desc": "Kubernetes-based Event Driven Autoscaling", "cat": "DevOps", "link": "https://github.com/kedacore/keda"},
    {"title": "Tekton", "desc": "A Kubernetes-native framework for creating CI/CD systems", "cat": "DevOps", "link": "https://github.com/tektoncd/pipeline"},
    {"title": "Spinnaker", "desc": "Spinnaker is an open source, multi-cloud continuous delivery platform", "cat": "DevOps", "link": "https://github.com/spinnaker/spinnaker"},
    {"title": "Flux", "desc": "Open and extensible continuous delivery solution for Kubernetes", "cat": "DevOps", "link": "https://github.com/fluxcd/flux2"},
    {"title": "Crossplane", "desc": "Cloud Native Control Planes", "cat": "DevOps", "link": "https://github.com/crossplane/crossplane"},
    {"title": "CDK", "desc": "AWS Cloud Development Kit", "cat": "DevOps", "link": "https://github.com/aws/aws-cdk"},
    {"title": "Terragrunt", "desc": "Terragrunt is a thin wrapper for Terraform that provides extra tools", "cat": "DevOps", "link": "https://github.com/gruntwork-io/terragrunt"},
    {"title": "Atlantis", "desc": "Terraform Pull Request Automation", "cat": "DevOps", "link": "https://github.com/runatlantis/atlantis"},
    {"title": "Checkov (DevOps)", "desc": "Static code analysis tool for infrastructure-as-code", "cat": "DevOps", "link": "https://github.com/bridgecrewio/checkov"},
    {"title": "TFSec", "desc": "Security scanner for your Terraform code", "cat": "DevOps", "link": "https://github.com/aquasecurity/tfsec"},
    {"title": "Infracost", "desc": "Cloud cost estimates for Terraform in pull requests", "cat": "DevOps", "link": "https://github.com/infracost/infracost"},
    {"title": "K9s", "desc": "Kubernetes CLI To Manage Your Clusters In Style", "cat": "DevOps", "link": "https://github.com/derailed/k9s"},
    {"title": "Lens", "desc": "Lens - The Kubernetes IDE", "cat": "DevOps", "link": "https://github.com/lensapp/lens"},
    {"title": "Helmfile", "desc": "Declarative spec for deploying helm charts", "cat": "DevOps", "link": "https://github.com/helmfile/helmfile"},
    {"title": "Skaffold", "desc": "Easy and Repeatable Kubernetes Development", "cat": "DevOps", "link": "https://github.com/GoogleContainerTools/skaffold"},
    {"title": "Tilt", "desc": "A multi-service dev environment for teams on Kubernetes", "cat": "DevOps", "link": "https://github.com/tilt-dev/tilt"},
    {"title": "Telepresence", "desc": "Local development against a remote Kubernetes or OpenShift cluster", "cat": "DevOps", "link": "https://github.com/telepresenceio/telepresence"},
    {"title": "Velero", "desc": "Backup and migrate Kubernetes applications and their persistent volumes", "cat": "DevOps", "link": "https://github.com/vmware-tanzu/velero"},
    {"title": "Cert-Manager", "desc": "Automatically provision and manage TLS certificates in Kubernetes", "cat": "DevOps", "link": "https://github.com/cert-manager/cert-manager"},
    {"title": "External-DNS", "desc": "Configure external DNS servers (AWS Route53, Google CloudDNS and others) for Kubernetes Ingresses and Services", "cat": "DevOps", "link": "https://github.com/kubernetes-sigs/external-dns"},
    {"title": "Promtail", "desc": "Agent which ships the contents of local logs to a private Grafana Loki instance", "cat": "DevOps", "link": "https://github.com/grafana/loki/tree/main/clients/cmd/promtail"},
    {"title": "Fluentd", "desc": "Fluentd: Unified Logging Layer", "cat": "DevOps", "link": "https://github.com/fluent/fluentd"},
    {"title": "Fluent Bit", "desc": "Fast and Lightweight Logs and Metrics processor for Linux, BSD, OSX and Windows", "cat": "DevOps", "link": "https://github.com/fluent/fluent-bit"},

    # UI/UX & Others (20)
    {"title": "Storybook (UI)", "desc": "Build UI components and pages in isolation", "cat": "UI/UX", "link": "https://github.com/storybookjs/storybook"},
    {"title": "Lottie", "desc": "Render After Effects animations natively on Web, Android and iOS", "cat": "UI/UX", "link": "https://github.com/airbnb/lottie-web"},
    {"title": "GSAP (UI)", "desc": "Professional-grade JavaScript animation for the modern web", "cat": "UI/UX", "link": "https://github.com/greensock/GSAP"},
    {"title": "Framer Motion (UI)", "desc": "Open source, production-ready animation and gesture library for React", "cat": "UI/UX", "link": "https://github.com/framer/motion"},
    {"title": "React Spring", "desc": "A spring physics based React animation library", "cat": "UI/UX", "link": "https://github.com/pmndrs/react-spring"},
    {"title": "Anime.js", "desc": "JavaScript animation engine", "cat": "UI/UX", "link": "https://github.com/juliangarnier/anime"},
    {"title": "Three.js (UI)", "desc": "JavaScript 3D Library", "cat": "UI/UX", "link": "https://github.com/mrdoob/three.js"},
    {"title": "React Three Fiber", "desc": "A React renderer for Three.js", "cat": "UI/UX", "link": "https://github.com/pmndrs/react-three-fiber"},
    {"title": "Drei", "desc": "Useful helpers for react-three-fiber", "cat": "UI/UX", "link": "https://github.com/pmndrs/drei"},
    {"title": "Spline", "desc": "3D Design tool in the browser", "cat": "UI/UX", "link": "https://spline.design"},
    {"title": "Rive", "desc": "Interactive animations for all platforms", "cat": "UI/UX", "link": "https://rive.app"},
    {"title": "Figma", "desc": "The collaborative interface design tool.", "cat": "UI/UX", "link": "https://figma.com"},
    {"title": "Framer", "desc": "The web builder for creative pros.", "cat": "UI/UX", "link": "https://framer.com"},
    {"title": "Webflow", "desc": "Create custom websites visually.", "cat": "UI/UX", "link": "https://webflow.com"},
    {"title": "Material Design", "desc": "Build beautiful, usable products faster.", "cat": "UI/UX", "link": "https://m3.material.io"},
    {"title": "Apple Human Interface Guidelines", "desc": "In-depth information and UI resources for designing great apps.", "cat": "UI/UX", "link": "https://developer.apple.com/design/human-interface-guidelines/"},
    {"title": "IBM Carbon Design System", "desc": "Carbon is IBM’s open source design system for products and digital experiences.", "cat": "UI/UX", "link": "https://carbondesignsystem.com"},
    {"title": "Atlassian Design System", "desc": "Use Atlassian’s end-to-end design language to create simple, intuitive and beautiful experiences.", "cat": "UI/UX", "link": "https://atlassian.design"},
    {"title": "Shopify Polaris", "desc": "Our design system helps us work together to build a great experience for all of Shopify’s merchants.", "cat": "UI/UX", "link": "https://polaris.shopify.com"},
    {"title": "GitLab Pajamas", "desc": "The GitLab design system", "cat": "UI/UX", "link": "https://design.gitlab.com"}
]

with open('atlas.html', 'r') as f:
    html = f.read()

# Parse out the existing array
pattern = r'(const resources = \[.*?\];)'
match = re.search(pattern, html, re.DOTALL)

if not match:
    print("Could not find resources array")
    exit(1)
    
old_array_str = match.group(1)

# Grab everything inside the brackets
inner_match = re.search(r'const resources = \[(.*)\];', old_array_str, re.DOTALL)
if not inner_match:
    print("Could not parse inner array")
    exit(1)

old_items_str = inner_match.group(1).strip()

# Now append our new ones
new_items_list = []
for r in additional_resources:
    title = r['title'].replace("'", "\\'")
    desc = r['desc'].replace("'", "\\'")
    cat = r['cat']
    link = r['link']
    new_items_list.append(f"    {{ title: '{title}', desc: '{desc}', cat: '{cat}', link: '{link}' }}")

new_items_str = ",\n".join(new_items_list)

# If there were old items and we are adding new ones, we need a comma
if old_items_str:
    new_array_str = f"const resources = [\n{old_items_str},\n{new_items_str}\n  ];"
else:
    new_array_str = f"const resources = [\n{new_items_str}\n  ];"

new_html = html.replace(old_array_str, new_array_str)

with open('atlas.html', 'w') as f:
    f.write(new_html)

print(f"✅ Injected 200 MORE repositories into atlas.html. Total items is now much larger!")
