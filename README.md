# LearnOps
LearnOps is an open-source platform designed for interactive learning of DevOps and Kubernetes. It leverages Kubernetes and Capsule to create isolated environments where students can complete tasks, follow courses, and test their skills.

The platform includes:
- **Courses**: Interactive lessons with theoretical content, practical assignments, and hands-on labs.
- **Task Verification**: Automatically validates student submissions.
- **Deployment Tools**: Kubernetes manifests and tools for easy deployment and local setup.

## Features
- 🚀 **Dynamic Kubernetes Environments**: Spin up containers for students to work on tasks in isolated namespaces.
- 📚 **Integrated Courses**: A rich collection of courses, lectures, and practical assignments.
- ✅ **Automated Task Verification**: Automatically checks student submissions for correctness.
- 🛠️ **CLI Tool**: A command-line interface to interact with the platform.
- 🎨 **Frontend**: A user-friendly web interface for students and instructors.
- 🔧 **API**: A backend API to manage courses, tasks, and environments.

## Documentation
For detailed information about how to use this platform, including setup instructions, features, and API references, please visit our [Official Documentation](https://ivanhahanov.github.io/learnops/docs/).

## Repository Structure
```plaintext
.
├── platform/       # Core platform code
│   ├── frontend/   # React-based frontend application
│   └── api/        # Backend API implemented in Golang
├── deploy/         # Kubernetes manifests for deploying LearnOps
└── demo/           # Scripts and configurations for running a local Kubernetes cluster with LearnOps
```

## Getting Started

### Prerequisites
- Kubernetes cluster (or use the `demo` setup for local testing)
- Capsule installed in your cluster
- `kubectl` installed on your machine

### Installation

#### Deploying to Kubernetes
1. Clone the repository:
   ```bash
   git clone https://github.com/Ivanhahanov/learnops.git
   cd learnops
   ```

2. Apply the Kubernetes manifests:
   ```bash
   kubectl apply -f deploy/
   ```

3. Access the platform:
   - Frontend will be available at the service URL defined in the Kubernetes manifests.
   - API endpoint and CLI instructions will also be available via the frontend or documentation.

#### Running Locally (Demo)
1. Navigate to the `demo` directory:
   ```bash
   cd demo
   ```

2. Start the local environment:
   ```bash
   ./demo.sh
   ```

3. Follow the instructions provided by the script to access the platform.

## Usage

### CLI
The CLI tool allows you to interact with LearnOps directly from the command line.

Install from source:
```bash
go install ./cli
```

Use the CLI upload courses:
```bash
learnops upload -c linux-basics/course.yml
```

## Contributing
We welcome contributions! To get started:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes and submit a pull request.

## License
This project is licensed under the [MIT License](LICENSE).


## Roadmap
- Add more courses and challenges.
- Integrate with third-party tools (e.g., Prometheus, Grafana).
- Enhance task verification with advanced validation logic.

---

Thank you for exploring LearnOps! 🚀 Happy learning! 🎓