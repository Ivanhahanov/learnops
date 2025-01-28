---
title: Demo
prev: docs
weight: 2
---
## What Do You Need to Get Started?
Before running the demo, make sure you have the following tools installed:

- [**Kind**](https://kind.sigs.k8s.io/docs/user/quick-start/#installation): A tool for creating local Kubernetes clusters using Docker containers. Simply put, it helps you spin up a mini-cluster on your computer.

- [**kubectl**](https://kubernetes.io/docs/tasks/tools/install-kubectl/): The command-line tool for managing Kubernetes. You can’t do much without it—it’s essential.

- [**Helm**](https://helm.sh/docs/intro/install/): A package manager for Kubernetes. It helps you quickly install the applications you need into your cluster.

- [**Opentofu**](https://learn.hashicorp.com/tutorials/terraform/install-cli): A tool for managing infrastructure as code. With it, you can describe everything you need in config files, and the system will set it up for you.

## Running the Demo

### Step 1: Navigate to the Demo Directory

Open your terminal and go to the `demo/` folder where the `demo.sh` script is located.

```bash
cd demo/
```

### Step 2: Run the Script

Now, simply execute the `demo.sh` script. It will do all the magic for you:

```bash
./demo.sh
```

What does it do? Here’s the breakdown:
- Creates a Kubernetes cluster using Kind.
- Deploys necessary services (e.g., Keycloak for authentication).
- Configures the environment so everything works as expected.

## What to Do After Running the Demo?

Once the script finishes, follow these simple steps to get everything up and running.

### Step 1: Add the Certificate to Trusted Certificates (MacOS)

To prevent your browser from complaining about self-signed certificates, add our certificate to the trusted store. Just run this command:

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .ssl/root-ca.pem
```

### Step 2: Log in as `learnops-admin`

Now, log in to the system using the admin account. Use the following command:

```bash
learnops login
```

And use these credentials:
- Username: `learnops-admin`
- Password: `learnops-admin`

### Step 3: Upload Courses

Next, upload the courses to the platform. Use the `learnops upload` command:

```bash
learnops upload -c courses/linux-basic/course.yml
learnops upload -c courses/git/course.yml
```

### Step 4: Open the Platform

Open your browser in incognito mode (or simply log out of the `learnops-admin` account if you’re already logged in) and go to:

```
https://learnops.local
```

### Step 5: Log in as a Regular User

Now, log in as a regular user:
- Username: `user`
- Password: `user`

### Step 6: Assign Courses to the User

Finally, assign the uploaded courses to the user. Do this with the following command:

```bash
learnops assign -u user -c linux-basic -c git-basic
```

## All Set!

Now you can explore the platform, check out the courses, and enjoy the results. If something doesn’t work as expected, don’t worry—just reach out to us, and we’ll help you figure it out. Good luck! 🚀