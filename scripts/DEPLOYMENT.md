# Deploying LASA-BE to AWS EC2

Prerequisites
- An EC2 instance with Node.js 18+ installed
- PM2 (the script will install it if missing)
- SSH access to the instance (private key)

Quick usage

1. From your local repo root run:

```
./scripts/deploy-to-ec2.sh --host <EC2_IP_OR_DNS> --user <ssh_user> --key ~/.ssh/mykey.pem --remote-dir /home/ubuntu/lasa-be --env production
```

2. On the server, view logs:

```
pm2 logs lasa-be-production
```

Notes
- The script uses `rsync` to sync project files and excludes `node_modules`, `.git`, and `.env`.
- Ensure your server has a proper `.env` file placed in the remote `--remote-dir` before starting, or copy one after deploy.
- If you prefer systemd, replace the PM2 start commands with your own service setup.
