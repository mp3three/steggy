# Live debugging with elastic beanstalk

This guide is intended to provide a method of directly attaching to the log stream coming from a given container inside of elastic beanstalk. This will be accomplished by creating a key pair inside AWS, and attaching it to the environment used to deploy the container. From there, SSH into the remote machine, and interact with docker on the command line.

## Gaining access to the VM

> [Original post](https://stackoverflow.com/questions/4742478/ssh-to-elastic-beanstalk-instance/4921866#4921866) on stack overflow for more context

### Configure Security Group

1. In the AWS console, open the EC2 tab.
2. Select the relevant region and click on Security Group.
3. You should have an elasticbeanstalk-default security group if you have launched an Elastic Beanstalk instance in that region.
4. Edit the security group to add a rule for SSH access. The below will lock it down to only allow ingress from a specific IP address.

```text
SSH | tcp | 22 | 22 | 192.168.1.1/32
```

### Configure the environment of your Elastic Beanstalk Application

1. If you haven't made a key pair yet, make one by clicking Key Pairs below Security Group in the ec2 tab.
2. In the AWS console, open the Elastic Beanstalk tab.
3. Select the relevant region.
4. Select relevant Environment.
5. Select Configurations in left pane.
6. Select Security.
7. Under "EC2 key pair:", select the name of your keypair in the Existing Key Pair field.
If after these steps you see that the Health is set Degraded

![a](/assets/debugging_elastic_beanstalk/y0fGw.png)

that's normal and it just means that the EC2 instance is being updated. Just wait on a few seconds it'll be Ok again

![b](/assets/debugging_elastic_beanstalk/QeX3N.png)

Once the instance has relaunched, you need to get the host name from the AWS Console EC2 instances tab, or via the API. You should then be able to ssh onto the server.

``` bash
ssh -i path/to/keypair.pub ec2-user@ec2-an-ip-address.compute-1.amazonaws.com
```

**Note**: For adding a keypair to the environment configuration, the instances' termination protection must be off as Beanstalk would try to terminate the current instances and start new instances with the KeyPair.

**Note**: If something is not working, check the "Events" tab in the Beanstalk application / environments and find out what went wrong.

## Working with the containers

> The default ec2 user that you ssh in does not have access to docker. You can switch to root with `sudo su`

Using the api server multicontainer deployment as reference, this command can be used to find the correct containers and follow the logs.

```bash
docker ps | grep submission-server | awk -Fformiobot '{ print $1 }' | xargs docker logs -f
```

When combined with trace logging, this will give an extremely verbose look into events happening inside any container as they happen.
