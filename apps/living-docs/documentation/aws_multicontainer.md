# AWS Multicontainer Deployment

## Description

This is intended to be a generic guide to be referenced by other pages for setting up a multicontainer deployment with AWS.
The page linking here should have provided a zip file and an **application name**

## Configuration

With place your configuration file (named after the application) in a `config` directory next to the `multicontainer.zip` file. For example:

```text
- multicontainer.zip
+ config
  - {appname}
```

Run the command

```bash
zip -r multicontainer.zip config
```

This will add the `config` directory to the zip file, where the deployment is pre-configured to look for it.

## Elastic Beanstalk

### Set up a new elastic beanstalk environment

1. Navigate to **Elastic Beanstalk** using search
2. Find application to add deployment to
3. **Create a new environment**
4. Environment Tier
   - Web server environment
5. Platform
   - Platform: Docker
   - Platform branch: Multi-container Docker running on 64bit Amazon Linux
   - Platform version: Recommended
6. Application Code
   - Select **Upload your code**
   - Select **Local File**
   - Use **Choose File** to upload your `multicontainer.zip`
7. Configure Environment
   - Development: at least `t3.medium` capacity
   - Production: probably higher than development. No metrics exist yet
